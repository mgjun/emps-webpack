/**
 * Created by MENGJUN on 2017/2/14.
 */
var apiLink = require("exports-loader?emps_api_url,quickegateway,tawk_src!./apiLink.js");
var emps_api_url = apiLink.emps_api_url;
var quickegateway = apiLink.quickegateway;
var tawk_src = apiLink.tawk_src;


var toastr = require("toastr/build/toastr.min.js");
var alertify = require("../lib/alertify/js/alertify.js");
require("../lib/loading-overlay.min.js");
require("./jquery.validate.js");
require("../lib/iCheck/iCheck.js");



/**
 * Created by MENGJUN on 2017/2/14.
 */
var appOption = {
   url:emps_api_url,
    gatewayurl:quickegateway+"/emps/static/",//prod
    // gatewayurl:"http://localhost:63342/quickegateway/app/emps/static/",//test
    sessionOutUrl: quickegateway,
//     url:"http://10.202.34.140:7209/emps/",
    datatables:{
        defaultOptions:{
            "info":false,
            "searching":false,
            "paging":true,
            // "ordering":false,
            "bLengthChange":false,
            "pagingType":"full_numbers",
            "serverSide":true,
            "processing":false,
            language:{
            //     lengthMenu: "_MENU_",
                emptyTable:commonMsg.messages.table.emptyTable,
                zeroRecords:commonMsg.messages.table.zeroRecords,
                paginate: {
                    "first":commonMsg.messages.table.first,
                    "last":commonMsg.messages.table.last,
                    "next":commonMsg.messages.table.next,
                    "previous":commonMsg.messages.table.previous
                }
            },
            "initComplete":function () {
                var button = $(".dataTable tbody tr td button");
                if(button) {
                    button.closest("td").addClass("text-inline");
                }
            },
            drawCallback:function () {
                var button = $(".dataTable tbody tr td button");
                if(button) {
                    button.closest("td").addClass("text-inline");
                }
            }
        }
    },
    ajax:{
        //options for ajax
        url:null,
        type:null,
        data:null,
        dataType:"json",
        async:true,
        contentType:"application/json",
        /**
         *
         * @param url
         * @param requestType post or get or put or delete
         * @param param data.
         * @param success success function
         * @param error error function.
         */
        request: function (url, requestType, param, success, error,needLoading) {
            if(url && url.indexOf("?") != -1) {
                url += "&sspi=" + appOption.getQueryParam("sspi");
            }else {
                url+="?sspi="+ appOption.getQueryParam("sspi");
            }
            $.ajax({
                url: url,
                contentType: "application/json",
                data: param,
                type: requestType,
                beforeSend:function(xhr){
                    if("noLoading" != needLoading) {
                        $(".content").loadingOverlay({
                            loadingText: commonMsg.messages.waiting
                        });
                    }
                },
                complete: function (XMLHttpRequest, status) {
                    // if("noLoading" != needLoading) {
                    //     $(".content").loadingOverlay("remove");
                    // }
                    if (status == 'timeout') { // 超时,status还有success,error等值的情况
                        toastr.error(commonMsg.messages.timeout);
                    }
                },
                success: function (data) {
                    if (data['result'] != "SUCCESS") {
                        this.error(data);
                    } else{
                        success(data.data);
                    }
                    if("noLoading" != needLoading) {
                        $(".content").loadingOverlay("remove");
                    }
                },
                error: function (data) {
                    if(data['result'] != "SUCCESS" && '-99' == data['code']) {
                        top.location.href = appOption.sessionOutUrl;
                    }else {
                        debugger;
                        if(data['message']){
                            appOption.ajax.dealErrorMsg(data.message);
                        }else{
                            toastr.error(commonMsg.messages.systemError);
                            error(data);
                        }
                    }
                    if("noLoading" != needLoading) {
                        $(".content").loadingOverlay("remove");
                    }
                },
                dataType: "json"
            });
        },
        requestWithStatus: function (url, requestType, param, success, error,needLoading) {
            if(url && url.indexOf("?") != -1) {
                url += "&sspi=" + appOption.getQueryParam("sspi");
            }else {
                url+="?sspi="+ appOption.getQueryParam("sspi");
            }
            $.ajax({
                url: url,
                contentType: "application/json",
                data: param,
                type: requestType,
                beforeSend:function(xhr){
                    if("noLoading" != needLoading) {
                        $(".content").loadingOverlay({
                            loadingText: commonMsg.messages.waiting
                        });
                    }
                },
                complete: function (XMLHttpRequest, status) {
                    if("noLoading" != needLoading) {
                        $(".content").loadingOverlay("remove");
                    }
                    if (status == 'timeout') { // 超时,status还有success,error等值的情况
                        toastr.error(commonMsg.messages.timeout);
                    }
                },
                success: function (data) {
                    if(data['result'] != "SUCCESS" && '-99' == data['code']) {
                        top.location.href = appOption.sessionOutUrl;
                    }else {
                        success(data);
                    }
                },
                error: function (data) {
                    if(data['message']){
                        appOption.ajax.dealErrorMsg(data.message);
                    }else{
                        toastr.error(commonMsg.messages.systemError);
                        error(data);
                    }
                },
                dataType: "json"
            });
        },
        asyncRequest:function(url,requestType,param,success,error){{
            if(url && url.indexOf("?") != -1) {
                url += "&sspi=" + appOption.getQueryParam("sspi");
            }else {
                url+="?sspi="+ appOption.getQueryParam("sspi");
            }
            $.ajax({
                url: url,
                contentType: "application/json",
                dataType: "json",
                async:false,
                data: param,
                type: requestType,
                beforeSend:function(){
                    $(".content").loadingOverlay({
                        loadingText: commonMsg.messages.waiting
                    });
                },
                complete: function (XMLHttpRequest, status) {
                    $(".content").loadingOverlay("remove");
                    if (status == 'timeout') { // 超时,status还有success,error等值的情况
                        alert(commonMsg.messages.timeout);
                    }
                },
                success: function (data) {
                    if (data['result'] != "SUCCESS") {
                        // toastr.error(data.message|| 'Unknown error');
                        this.error(data);
                    } else{
                        success(data.data);
                    }
                },
                error: function (data) {
                    if(data['result'] != "SUCCESS" && '-99' == data['code']) {
                        top.location.href = appOption.sessionOutUrl;
                    }else {
                        if(data['message']){
                            appOption.ajax.dealErrorMsg(data.message);
                        }else{
                            toastr.error(commonMsg.messages.systemError);
                            error(data);
                        }
                    }
                }

            });
        }},
        dealErrorMsg:function (errorMessage) {
            try {
                //"{\"key\":\"TagAlreadyExistedError\",\"variable\":[\"1\",\"2\"]}"
                var jsonError = JSON.parse(errorMessage);
                var variables = jsonError.variable;
                if(variables) {
                    var str = commonMsg.messages[jsonError.key];
                    for(var index in variables) {
                        str = str.replace("{"+index+"}",variables[index])
                    }
                    toastr.error(str)
                }else {
                    toastr.error(commonMsg.messages[jsonError.key])
                }
            }catch (e){
                if(commonMsg.messages[errorMessage]) {
                    toastr.error(commonMsg.messages[errorMessage])
                }else {
                    toastr.error(errorMessage);
                }
            }
        }
    },
    fileInput:{
        $el:null,
        fileCounts:0,
        frameHeight:'145px',
        tempMsg:null,
        cachedFiles:[],
        default_options:{
            uploadAsync: false,
            showCaption: false,
            showUpload: false,
            showCancel: false,
            showClose: false,
            showRemove: false,
            showBrowse: false,
            showUploadedThumbs: false,
            captionClass: "col-sm-6",
            allowedFileTypes: ['image'],
            allowedFileExtensions: ['jpg', 'png', 'gif'],
            maxFileSize: 10*1024,
            minFileCount: 1,
            maxFileCount: 5
        },
        display_options:{
            dropZoneTitleClass:"hide"
        },
        edit_options:{
            showPreview:true,
            showUploadedThumbs: true,
            dragClass:"hide",
            showDrag:false,
            dropZoneTitle:commonMsg.messages.dropOr+' <a id="upload-file-button color-success" onclick="appOption.fileInput.triggerUpload()">'+commonMsg.messages.browse+'<i class="fa fa-cloud-upload"></i></a>',
            removeFromPreviewOnError:true,
            overwriteInitial: false,
            elErrorContainer:'hide',
            previewSettings: {
                image: {width: "auto", height: "60px"},
                html: {width: "50px", height: "40px"},
                text: {width: "50px", height: "40px"},
                video: {width: "50px", height: "40px"},
                audio: {width: "50px", height: "40px"},
                flash: {width: "50px", height: "40px"},
                object: {width: "50px", height: "auto"},
                pdf: {width: "50px", height: "40px"},
                other: {width: "50px", height: "40px"}
            }
        },
        wrap_op:{},
        init:function ($el, options, editable) {
            var _this = this;
            _this.$el = $el;
            // _this.fileCounts = 0;
            var ops;
            ops = editable ? $.extend({},_this.default_options,_this.edit_options) : $.extend({},_this.default_options,_this.display_options);
            ops = $.extend({},ops,options);
            this.wrap_op = ops;
            $el.fileinput(ops);

            if(editable) {
                $(".file-drop-zone").css("min-height",_this.frameHeight);
                _this.validate.clear();
                $el.on("filedeleted",function () {
                    appOption.fileInput.fileCounts--;
                    _this.validate.valid();
                    if(appOption.fileInput.fileCounts <= 0) {
                        $(".file-drop-zone").css("min-height",_this.frameHeight);
                        if(ops.minFileCount && ops.minFileCount > 0) {
                            _this.validate.valid();
                        }
                    }
                }).on("fileremoved",function () {
                    appOption.fileInput.fileCounts--;
                    _this.validate.valid();
                    if(appOption.fileInput.fileCounts <= 0) {
                        $(".file-drop-zone").css("min-height",_this.frameHeight);
                        if(ops.minFileCount && ops.minFileCount > 0) {
                            _this.validate.valid();
                        }
                    }
                }).on("filebatchselected",function (event, files) {
                    var _self = this;
                    if(_self.cachedFiles == files) return;
                    _self.cachedFiles = files;
                    if(files) appOption.fileInput.fileCounts = files.length;
                    if(ops.minFileCount && ops.minFileCount > 0) {
                        _this.validate.valid();
                    }
                }).on("fileuploaderror",function (event, data, msg) {
                    var _self = this;
                    if(_self.tempMsg === msg) return;
                    if(isEmpty(_self.tempMsg) || _self.tempMsg !== msg) {
                        this.tempMsg = msg;
                    }
                    toastr.options.timeOut = 10000;
                    toastr.options.onShown = function () {
                        _self.tempMsg = null;
                    };
                    toastr.error(msg);
                }).on("change",function () {

                    // _this.$el.val("");
                });
            }
        },
        triggerUpload:function () {
            this.$el.val("");
            return this.$el.trigger("click");
        },
        destroy:function ($el) {
            $el.fileinput("destroy");
            return this;
        },
        upload:function ($el) {
            $el.fileinput("upload");
            return this;
        },
        refresh:function ($el, options) {
            if(isEmpty(options)) {
                $el.fileinput("refresh");
            }else {
                $el.fileinput("refresh",options);
            }
            return this;
        },
        progressSuccess:function () {
            $(".file-input").find(".progress").html('<div class="text-center back-main color-white">'+commonMsg.messages.success+'</div>');
            $(".file-preview-loading").removeClass("file-preview-loading");
            $(".file-uploading").removeClass("file-uploading");
            this.$el.attr("disabled",false);
            $(".kv-file-upload").attr("disabled",false);
            $(".kv-file-remove").attr("disabled",false);
            $(".kv-file-zoom").attr("disabled",false);
        },
        progressFailure:function () {
            $(".file-input").find(".progress").html('<div class="text-center back-error color-white">'+commonMsg.messages.error+'</div>');
            $(".file-preview-loading").removeClass("file-preview-loading");
            $(".file-uploading").removeClass("file-uploading");
            this.$el.attr("disabled",false);
            $(".kv-file-upload").attr("disabled",false);
            $(".kv-file-remove").attr("disabled",false);
            $(".kv-file-zoom").attr("disabled",false);
        },
        validate:{
            valid:function () {
                var _self = appOption.fileInput;
                if(_self.wrap_op && _self.wrap_op.minFileCount
                    && appOption.fileInput.fileCounts >= _self.wrap_op.minFileCount) {
                    this.success();
                }else {
                    this.error();
                }
            },
            success:function () {
                var $validFrame = appOption.fileInput.$el.closest(".valid-frame"),$fileInput = $validFrame.find(".file-input");
                if(!isEmpty($fileInput)) {
                    $validFrame.removeClass("file-error").addClass("file-valid").find("label.error").remove();
                    $fileInput.find(".file-preview").addClass("has-success").removeClass("has-error");
                    $fileInput.find(".file-drop-zone").addClass("has-success").removeClass("has-error");
                }
            },
            error:function () {
                var $validFrame = appOption.fileInput.$el.closest(".valid-frame"),$fileInput = $validFrame.find(".file-input"),
                    minCount = appOption.fileInput.wrap_op.minFileCount?appOption.fileInput.wrap_op.minFileCount : 0,
                    maxCount = appOption.fileInput.wrap_op.maxFileCount ? appOption.fileInput.wrap_op.maxFileCount : appOption.fileInput.wrap_op.minFileCount,
                    errorMsg = maxCount > minCount ?
                                commonMsg.messages.validate.fileCountBetweenError.replace("{minCount}",minCount).replace("{maxCount}",maxCount):
                                commonMsg.messages.validate.fileCountLessError.replace("{minCount}",minCount);
                if(!isEmpty($fileInput) && !$validFrame.hasClass("file-error")) {
                    $validFrame.removeClass("file-valid").addClass("file-error")
                        .append('<label class="error">'+errorMsg+'</label>').css("display","block");
                    $fileInput.find(".file-preview").addClass("has-error").removeClass("has-success");
                    $fileInput.find(".file-drop-zone").addClass("has-error").removeClass("has-success");
                }
            },
            clear:function () {
                var $validFrame = appOption.fileInput.$el.closest(".valid-frame"),$fileInput = $validFrame.find(".file-input");
                if(!isEmpty($fileInput)) {
                    $validFrame.removeClass("file-valid").removeClass("file-error");
                    if($validFrame.find("label.error")) $validFrame.find("label.error").remove();
                    $fileInput.find(".file-preview").removeClass("has-error").removeClass("has-success");
                    $fileInput.find(".file-drop-zone").removeClass("has-error").removeClass("has-success");
                }
            }
        }
    },
    imageOp:{
       isSmall:false,
       options:{},
       getImageStr:function (index,options) {
           options = options ? options : {};
           options.height = options.height ? options.height : "170px";
           options.width = options.width ? options.width : "130px";
           this.options = options;
           return '<img id="img_id_'+index+'" src="'+appOption.gatewayurl+'img/loading.gif" class="file-preview-image kv-preview-data"/>';
       },
       fileinputLoad:function (arr,urlArr) {
           for(var index in arr) {
               this.loadImage(urlArr[index],"img_id_"+index,this.checkImg)
           }
       },
       loadImage:function (url,imgid,callback) {
           $(".file-preview-frame").height(this.options.height).width(this.options.width);
           $(".kv-file-content").css("min-height",this.options.height);

           var Browser=new Object();
           Browser.userAgent=window.navigator.userAgent.toLowerCase();
           Browser.ie=/msie/.test(Browser.userAgent);
           Browser.Moz=/gecko/.test(Browser.userAgent);
           var val=url;
           var img=new Image();
           if(Browser.ie){
               img.onreadystatechange =function(){
                   if(img.readyState=="complete"||img.readyState=="loaded"){
                       callback(img,imgid);
                   }
               }
           }else if(Browser.Moz){
               img.onload=function(){
                   if(img.complete==true){
                       callback(img,imgid);
                   }
               };
           }
           //如果因为网络或图片的原因发生异常，则显示该图片
           img.onerror=function(){
               img.src=appOption.gatewayurl + 'img/img-not-found.png'
           };
           img.src=val;
       },
       checkImg:function (obj, imgId) {
           $("#"+imgId).attr("src",obj.src).height(appOption.imageOp.options.height).width(appOption.imageOp.options.width);
       }
    },
    alertify:{
       deleteDefaultMsg:commonMsg.messages.deleteInfo,
       _init:function (params) {
           alertify.set({
               labels : {
                   ok: params.ok ? params.ok : commonMsg.messages.button.yes,
                   cancel: params.cancel ? params.cancel : commonMsg.messages.button.no
               }
           });
           alertify.confirm(params.confirmMsg ? params.confirmMsg : this.deleteDefaultMsg, function (e) {
               if(e) {
                   (params.confirmFn instanceof Function) ? params.confirmFn(e) : "";
               }else {
                   (params.cancelFn instanceof Function) ? params.cancelFn(e) : "";
               }
           });
           if(params.hideCancel) {
               $(".alertify-button-cancel").addClass("hide");
           }else {
               $(".alertify-button-cancel").nextAll().addClass("margin-left-10");
           }
       }
    },
    formOperation:{
        resetValue:function (formObjSelector) {
            $(formObjSelector)[0].reset();
            return this;
        },
        resetValidation:function (formObjSelector) {
            $(formObjSelector).find(".has-success").removeClass("has-success")
                .closest(formObjSelector).find(".has-error").removeClass("has-error")
                .closest(formObjSelector).find(".valid").removeClass("valid")
                .closest(formObjSelector).find(".error").removeClass("error")
                .closest(formObjSelector).find("label.error").remove();
               
            return this;
        }
    },
    getQueryParam:function (name) {
        return commonMsg.getQueryParam(name);
    },
    deepCopy:function(obj) {
        return commonMsg.deepCopy(obj);
    },
    formatOperation:{
       //price format
        priceFormat:function(price) {
           if(isEmpty(price)) {
               return 0;
           }
           if(!(price instanceof Number)) {
               price = parseFloat(price);
           }

           return price.toFixed(2);
       },
        priceDisplay: function (price) {
            if(price) {
                return "S$ " + this.priceFormat(price);
            }else {
                return "-";
            }
        }
    },
    displayStatus:function (status) {
        switch (status) {
            case "draft" : return "Draft";break;
            case "submitted" : return "Submitted";break;
            case "revoke" : return "Revoked";break;
            case "match_success" : return "Match Found";break;
            case "match_unsuccess" : return "No Match Found";break;
            case "accept_job" : return "Job Accepted";break;
            case "wait_payment" : return "Pending Payment";break;
            case "shipper_paid" : return "Shipper Paid";break;
            case "complete" : return "Completed";break;
            case "shipper_reject" : return "Shipper Rejected";break;
            case "transporter_reject" : return "Transporter Rejected";break;
            case "shipper_refund" : return "Shipper Refunded";break;
            case "refund" : return "Refunded";break;
            case "refund_apply" : return "Refund Applied";break;
            case "platform_paid" : return "Platform Paid";break;
            default : return "";
        }

    },
    reverseDateStr:function (dateStr) {
        if(isEmpty(dateStr)) return dateStr;
        var dateElArr = dateStr.split("-");
        if(!isEmpty(dateElArr) && dateElArr.length === 3) {
            return dateElArr.reverse().join("-");
        }
        return dateStr;
    }
};

// var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
// (function(){
//     var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
//     s1.async=true;
//     s1.src= tawk_src;
//     s1.charset='UTF-8';
//     s1.setAttribute('crossorigin','*');
//     s0.parentNode.insertBefore(s1,s0);
// })();


function isArray(array) {
    return Array.isArray(array) || Object.prototype.toString().call(array) === '[object Array]';
}

function uniqueArray(array) {
    var arr = [],flag = false;
    if(isEmpty(array) || !isArray(array)) return arr;
    for(var i=0;i<array.length;i++) {
        for(var j = i+1;j<array.length;j++) {
            if(array[i] == array[j]) {
                flag = true;
            }
        }
        if(!flag) {
            arr.push(array[i]);
        }
        flag = false;
    }
    return arr;
}

function upperCaseFirstLetter(str){
    str = str.toLowerCase();
    var reg = /\b(\w)|\s(\w)/g;
    return str.replace(reg,function(m){
        return m.toUpperCase()
    });
}

(function ($) {
    $.fn.resetValue = function () {
        $(this)[0].reset();
        $(this).find(".checked").removeClass("checked");
        return this;
    };
    $.fn.resetValidation = function () {
        $(this).find("label.error").remove();
        $(this).find(".has-success").removeClass("has-success")
        $(this).find(".has-error").removeClass("has-error")
        $(this).find(".valid").removeClass("valid")
        $(this).find(".error").removeClass("error")

        return this;
    };
})(jQuery);

// Number.prototype.toFixed = function( fractionDigits ) {
//     var m = Math.pow( 10, fractionDigits  );
//     console.log(parseInt(this * m + 0.5));
//     return (parseInt(this * m + 0.5)/m).toString();
// };
Math.formatFloat = function(f, digit) {
    var m = Math.pow(10, digit);
    return parseInt(f * m, 10) / m;
};
String.prototype.replaceAll = function(s1,s2){
    return this.replace(new RegExp(s1,"gm"),s2);
};

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
function isEmpty(obj) {
    if(obj == null || obj == '' || obj == undefined || obj == 'null') {
        return true;
    }
    return false;
}

function dateTimeFormat(dateTimeStr) {
    if(isEmpty(dateTimeStr)) return "";
    var date = new Date(dateTimeStr.toString().indexOf("-") != -1 ? dateTimeStr.replaceAll("-","/").replace(/T|Z/g,' ').trim() : dateTimeStr);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if(month < 10)  month = "0" + month;
    if(day < 10) day = "0" + day;
    if(hours < 10) hours = "0" + hours;
    if(minutes < 10) minutes = "0" + minutes;
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
}

function dateFormat(dateStr) {
    if(isEmpty(dateStr)) return "";
    var date = new Date(dateStr.toString().indexOf("-") != -1 ? dateStr.replaceAll(/-/g,"/").replace(/T|Z/g,' ').trim() : dateStr);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if(month < 10)  month = "0" + month;
    if(day < 10) day = "0" + day;
    return year + "-" + month + "-" + day;
}
function timeFormat(str) {
    if(isEmpty(str)) {
        return "";
    }
    var date;
        date = new Date(str.replace(/-/g,"/"));
    if(!date.getFullYear()) {
        date = new Date("1970/01/01 " + str);
        if(!date.getFullYear()) return "";
    }

    var hours = date.getHours();
    var minutes = date.getMinutes();
    if(hours<10) {
        hours = "0"+hours;
    }
    if(minutes<10) {
        minutes = "0"+minutes;
    }
    return hours+":"+minutes;
}

Date.prototype.format = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'H+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S': this.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    return fmt
};

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};



/*
jquery  validate method
 */
$.validator.addMethod("wideEmail",function (value, element, param) {
    var reg = /^(([a-zA-Z0-9_.])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+)([;]+([a-zA-Z0-9_.])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+)*$/;
    return this.optional(element) || reg.test(value);
},"invalid email!");
$.validator.addMethod("vehicleNameValidate",function (value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
},"invalid value!");
//name validation
$.validator.addMethod("nameValidate",function (value, element, param) {
    return this.optional(element) || /^(?!_)(?!.*?_$)(?!\s$)[a-zA-Z0-9\s_]+$/.test(value);
},"invalid value!");
$.validator.addMethod("laterThan",function (value,element,param) {
    var _otherValue = param.formObj.find(param.type+"[name='"+param.name+"']").val();
    var otherDate = new Date("1970/01/01 "+_otherValue);
    otherDate.setHours(otherDate.getHours()+1);
    var valueDate = new Date("1970/01/01 "+value);
    return this.optional(element) || valueDate >= otherDate;
},"");
$.validator.addMethod("earlyThan",function (value,element,param) {
    var _otherValue = param.formObj.find(param.type+"[name='"+param.name+"']").val();
    var otherDate = new Date("1970/01/01 "+_otherValue);
    otherDate.setHours(otherDate.getHours()-1);
    var valueDate = new Date("1970/01/01 "+value);
    return this.optional(element) || valueDate < otherDate;
},"");
$.validator.addMethod("laterHours",function (value,element,param) {
    var valueIsFullDate = /^\d{4}\-\d{1,2}\-\d{1,2}[ ]\d{1,2}\:\d{1,2}$/.test(value);
    var selectedDate,otherDate;
    if(valueIsFullDate) {
        selectedDate = new Date(Date.parse(value.replace(/-/g,"/").trim()));
        otherDate = new Date();
        otherDate.setHours(otherDate.getHours()+parseInt(param));
        return this.optional(element) || selectedDate >= otherDate;
    }else {
        selectedDate = new Date();
        selectedDate.setMinutes(value.split(":")[1].trim());
        selectedDate.setHours(value.split(":")[0].trim());
        otherDate = new Date();
        otherDate.setHours(otherDate.getHours()+parseInt(param));
        return this.optional(element) || selectedDate >= otherDate;
    }
},"");
$.validator.addMethod("jobLaterThan",function (value, element, param) {

    var date = param.formObj.find("input[name='transporterDate']").val();
    if(!date) {
        date = '1970/01/01';
    }
    else {
        date = date.split("-").reverse().join("/");
    }
    var _otherValue = param.formObj.find(param.type+"[name='"+param.name+"']").val();
    var valueDate,otherDate;
    valueDate  = new Date(Date.parse(date.replace(/-/g,"/").trim() + " " + value.toString().trim()));
    otherDate = new Date(Date.parse(date.replace(/-/g,"/").trim() + " " + _otherValue.toString().trim()));
    otherDate.setHours(otherDate.getHours()+1);
    return valueDate >= otherDate;
},"");
$.validator.addMethod("jobLaterHours",function (value,element,param) {
    var date = param.formObj.find("input[name='transporterDate']").val();
    var selectedDate;
    if(!date) {
        selectedDate = new Date("1970/01/01 " + value.toString().trim());
        selectedDate.setFullYear(new Date().getFullYear(),new Date().getMonth() + 1,new Date().getDate());
    }else {
        date = date.split("-").reverse().join("/");
        selectedDate = new Date(Date.parse(date.replace(/-/g,"/").trim() + " " + value.toString().trim()));
    }
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours()+parseInt(param.hours));
    return selectedDate >= currentDate;
},"");

$.validator.addMethod("laterDate",function (value,element,param) {
    if(isEmpty(value)) return false;
    var selectedDate = new Date(Date.parse(value.replace(/-/g,"/").trim()));
    if(value.split("-")[0].length < 4) {
        selectedDate = new Date(appOption.reverseDateStr(value).replace(/-/g,"/").trim());
    }
    var date;
    if(param === true || isEmpty(param)) {
        date = new Date();
        date = new Date(date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate());
    }else {
        var dateValue = param.formObj.find(param.type+"[name='"+param.name+"']").val();
        date = new Date(dateValue.replace(/-/g,"/").trim());
    }

    return selectedDate.getTime() >= date.getTime();
},"");
$.validator.addMethod("laterDateThanCurrent",function (value,element,param) {
    if(isEmpty(value)) return false;
    var date = new Date();
    date = new Date(date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate());
    var selectedDate = new Date(Date.parse(value.replace(/-/g,"/").trim()));
    if(value.split("-")[0].length < 4) {
        selectedDate = new Date(appOption.reverseDateStr(value).replace(/-/g,"/").trim());
    }
    return selectedDate.getTime() >= date.getTime();
},"");
//compare two number bigger than param's value
$.validator.addMethod("bigThan",function (value,element,param) {
    return this.optional(element) || parseFloat(value) >= parseFloat(param.val());
},"");
//compare two number,less than param's value
$.validator.addMethod("lessThan",function (value,element,param) {
    return this.optional(element) || parseFloat(value) <= parseFloat(param.val());
},"");
//price must bigger than zero
$.validator.addMethod("bigZero",function (value,element,param) {
    return this.optional(element) || parseFloat(value) >= 0;
},"");
//validate phone
jQuery.validator.addMethod("mobileValidate", function (value, element) {
    if (value != null) {
        var reg = /^([+]{0,1})\d{1,11}([-]{0,1})\d{1,11}$/;
        return this.optional(element) || reg.test(value);
    }
    return this.optional(element);
}, "");



//timewindow plugin
(function () {
    var TimeWindow = function ($el, options) {
        this.$el = $el;
        this.defaults = {
            elements:[
                "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
                "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
                "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
                "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
                "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
                "20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30"
            ],
            deleteElements:0,
            defaultValue:"00:00"
        };
        isEmpty(options) ? this.options = this.defaults : this.options = $.extend({},this.defaults,options);
        var displayElements = this.options.elements,delElCount = this.options.deleteElements;
        this.options.elements = isEmpty(delElCount) ? displayElements : displayElements.slice(0,displayElements.length - delElCount);
    };
    TimeWindow.prototype = {
        init:function () {
            var self = this,ops = self.options;
            this.$el.empty();
            var str = "";
            $.each(ops.elements,function (key, item) {
                if(item === ops.defaultValue) {
                    str += '<option value="'+item+'" selected>'+item+'</option>';
                }else {
                    str += '<option value="'+item+'">'+item+'</option>';
                }
            });
            self.$el.append(str);
            return this;
        }
    };
    $.fn.TimeWindow = function (options) {
        new TimeWindow(this,options).init()
        return this;
    }
})();


//allow jquery to validate disabled elements by default
//if want it not validate disabled elements,can add ignore:"selector"(the disabled element to be ignored)
$.validator.prototype.elements = function () {
    var validator = this,
        rulesCache = {};

    // Select all valid inputs inside the form (no submit or reset buttons)
    return $( this.currentForm )
        .find( "input, select, textarea, [contenteditable]" )
        // .not( ":submit, :reset, :image, :disabled" )
        .not( ":submit, :reset, :image" )
        .not( this.settings.ignore )
        .filter( function() {
            var name = this.name || $( this ).attr( "name" ); // For contenteditable
            if ( !name && validator.settings.debug && window.console ) {
                console.error( "%o has no name assigned", this );
            }

            // Set form expando on contenteditable
            if ( this.hasAttribute( "contenteditable" ) ) {
                this.form = $( this ).closest( "form" )[ 0 ];
            }

            // Select only the first element for each name, and only those with rules specified
            if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
                return false;
            }

            rulesCache[ name ] = true;
            return true;
        } );
};
window.appOption = appOption;
module.exports = {
    appOption : appOption,
    isArray : isArray,
    uniqueArray : uniqueArray,
    upperCaseFirstLetter : upperCaseFirstLetter,
    isEmpty : isEmpty,
    dateTimeFormat : dateTimeFormat,
    dateFormat : dateFormat,
    timeFormat : timeFormat,
    toastr : toastr
}
