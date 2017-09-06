/**
 * Created by MENGJUN on 2017/2/14.
 */
 // require("html-loader?attrs=img:src img:data-src!../../static/pages/driver.html");
var driverTable;
$(document).ready( function () {
	driverTable = $("#driver-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#driver-licenseNo-value").val();
            app.appOption.ajax.url = app.appOption.url+driver.driverUrl+"viewDriver";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            {
                "data":"licenseNo"
            },
            {
                "data":"firstName",
                "orderable":false,
                render:function (data, type, row, meta) {
                    return row.firstName + ' ' + row.lastName;
                }
            },
            {
                "data":"mobile",
                "orderable":false
            },
            {
                "data":"rating",
                render:function (data,type, row, meta) {
                    var domDivObj=document.createElement("div");
                    $(domDivObj).raty($.extend({},driver.ratingOption,{
                        score:row.rating,
                        readOnly:true
                    }));
                    return domDivObj.outerHTML;
                }
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="driver.update('+row.id+')" class="btn btn-sm btn-app-primary driver-show-edit">'+editDriverVue.message.button.edit+'</button>'+
                        '<button onclick="driver.delete('+row.id+')" class="btn btn-sm btn-app-danger driver-show-delete">'+editDriverVue.message.button.delete+'</button>';
                }
            },
        ]
    })).api();


    $(".select2").select2();

    //save create driver
    $("#driver-create-save").bind("click",function () {
        var validator = driver.formValidate($("#driver-create-form"));
        var validForm = !validator.form();
        //validate file
        app.appOption.fileInput.validate.valid();
        if(validForm) {
            return;
        }
        app.appOption.fileInput.upload($("#create-attachmentImages"));
    });
    
    //save edit driver
    $("#driver-edit-save").bind("click",function () {
        //validate file
        app.appOption.fileInput.validate.valid();
        var validator = driver.formValidate($("#driver-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.fileInput.upload($("#edit-attachmentImages"));
    });

    //save delete driver
    $("#driver-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+driver.driverUrl+"deleteDriver/"+driver.driverId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteDriver").modal("hide");
            driverTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by driver name
    $("#driver-licenseNo-search").bind("click",function () {
        driverTable.draw();
    });


    $(".portrait-upload-btn").bind("click",function () {
        $(this).closest("form").find(".upload-file").trigger("click");
    });

    $(".upload-file").bind("change",function () {
        debugger;
        var self = this,file = self.files[0],imageReg = /image\/\w+/,fileReader = new FileReader();
        if(!imageReg.test(file.type)) {
            app.appOption.alertify._init({
                ok:editDriverVue.message.button.close,
                hideCancel:true,
                confirmMsg:editDriverVue.message.invalidImageInfo
            });
            return;
        }
        $(this).closest("form").find("input[name='imageName']").val(file.name);
        fileReader.onload = function () {
            var url = fileReader.result;
            $("#pro-modal").modal({
                backdrop:"static",
                show:true
            });
            $("#cropper-img").attr("src",url);
            driver.initPortrait.cropper = new Cropper(document.getElementById("cropper-img"),{
                viewMode:0,
                minContainerHeight :  $("#cropper-body").height(),
                minContainerWidth : $("#cropper-body").width(),
                minCropBoxWidth:100,
                minCropBoxHeight:100,
                minCropCanvasWidth:100,
                minCropCanvasHeight:100,
                aspectRatio: 1 / 1,
                autoCropArea: 0.5,
                guides: false,
                dragMode: "move",
                toggleDragModeOnDblclick: false,
                responsive: false,
                background: false,
                movable: true,
                cropBoxMovable: false,
                cropBoxResizable: false
            });
            $(self).val("");
        };
        fileReader.readAsDataURL(file);
    });

    $("#portrait-save").bind("click",function() {
        $("#pro-modal").modal("hide").on('hidden.bs.modal',function () {
            $("body").addClass("modal-open");
        });
        if(driver.isEdit) {
            $("#edit-show-portrait").attr("src", driver.initPortrait.cropper.getCroppedCanvas({width: 200, height: 200}).toDataURL('image/jpg')).show();
            $("#edit-por-data").val(driver.initPortrait.cropper.getCroppedCanvas({width:200,height:200}).toDataURL('image/jpg'));
            driver.formValidate($("#edit-por-data").closest("form")).element($("#edit-por-data"));
        }else {
            $("#image").attr("src", driver.initPortrait.cropper.getCroppedCanvas({width: 200, height: 200}).toDataURL('image/jpg')).show();
            $("#por-data").val(driver.initPortrait.cropper.getCroppedCanvas({width:200,height:200}).toDataURL('image/jpg'));
            driver.formValidate($("#por-data").closest("form")).element($("#por-data"));
        }
        driver.initPortrait.cropper.destroy();
    });
    $(".close-pro-modal").bind("click",function () {
        driver.initPortrait.cropper.destroy();
        $("#pro-modal").modal("hide").on('hidden.bs.modal',function () {
            $("body").addClass("modal-open");
        });
    });

    driver.driverImageOppition = {
        minFileCount : 2,
        maxFileCount:2,
        uploadExtraData:function() {
            var formData;
            if(driver.isEdit) {
                formData = $("#driver-edit-form").serializeObject();
            }else {
                formData = $("#driver-create-form").serializeObject();
            }
            return formData;
        },
        ajaxSettings:{
            beforeSend:function () {
                $(".content").loadingOverlay({loadingText:"waiting"});
            },
            complete:function () {
                $(".content").loadingOverlay("remove");
            },
            success:function (result) {
                if(result.result == "SUCCESS") {
                    app.appOption.fileInput.progressSuccess();
                    driver.isEdit ? $("#editDriver").modal("hide"):$("#addDriver").modal("hide");
                    driverTable.draw();
                    // window.location.href = './bidCreate.html?bv=' + shipperCreateVue.bidVersion + '&bidId='+app.appOption.getQueryParam("bidId")+'&sspi='+app.appOption.getQueryParam("sspi")+'&hasOperatedJob=true';
                }else {
                    app.appOption.fileInput.progressFailure();
                    toastr.error(result.message);
                }

            },
            error:function (error) {
                app.appOption.fileInput.progressFailure();
                toastr.error("request failed");
            }
        }
    };

    driver.ratingOption = {
        number: 5,
        score:0,
        hints:[1,2,3,4,5],
        targetType: 'number',
        cancelOff: 'cancel-off.png',
        cancelOn: 'cancel-on.png',
        path:"../img/",
        size: 24,
        starHalf: 'star-half.png',
        starOff: 'star-off.png',
        starOn: 'star-on.png',
        cancel: true,
        cancelPlace:"left",
        targetKeep: true
    }
});

var driver = {
    driverId:null,
    // isNameSearch:false,
    driverUrl:"v1/api/driver/",
    isEdit:false,//current operation is edit or not;
    ratingOption:null,
    driverImageOppition:null,
    initPortrait:{
        cropper:null,
        cropperImg:document.getElementById("cropper-img"),
        cropperOptions:{
            viewMode:0,
            minContainerHeight :  $("#cropper-body").height(),
            minContainerWidth : $("#cropper-body").width(),
            minCropBoxWidth:100,
            minCropBoxHeight:100,
            minCropCanvasWidth:100,
            minCropCanvasHeight:100,
            aspectRatio: 1 / 1,//裁剪框比例 1：1
            autoCropArea: 0.5,
            guides: false,//裁剪框虚线 默认true有
            dragMode: "move",
            toggleDragModeOnDblclick: false,//禁用双击切换拖动模式
            responsive: false,
            background: false,// 容器是否显示网格背景
            movable: true,//是否能移动图片
            cropBoxMovable: false,//是否允许拖动裁剪框
            cropBoxResizable: false//是否允许拖动 改变裁剪框大小
        }
    },
    create:function () {
        this.isEdit = false;
        $("#image").attr("src","../img/init.png");
        $("#por-data").val("");
        $("#driver-create-form").resetValue().resetValidation();
        $("#create-rating").raty($.extend({},this.ratingOption,{
            score:0,
            target: '#create-rating-value',
            click:function (score, evt) {
                if(!score) score = 0;
                $("#create-rating-value").val(score);
            }
        }));
        app.appOption.fileInput.destroy($("#create-attachmentImages"));
        app.appOption.fileInput.init($("#create-attachmentImages"),$.extend({},this.driverImageOppition,{
            uploadUrl:app.appOption.url+driver.driverUrl+"createDriver?sspi="+app.appOption.getQueryParam("sspi"),
            minFileCount: 2,
            maxFileCount: 2
        }),true);
        $("#addDriver").modal("show");
    },
    update:function (driverId) {
        this.isEdit = true;
        $("#edit-show-portrait").attr("src","../img/init.png");
        $("#edit-por-data").val("");
        $("#driver-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+driver.driverUrl+"findDriverById/"+driverId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:driverId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                editDriverVue.driverInfo = result;

                var attachFiles = result.attachmentFileDtos,imageArr = [],initConfigArr = [];
                if(attachFiles) {
                    for(var index in attachFiles) {
                        var attach = attachFiles[index];
                        imageArr.push('<img src="data:image/jpeg;base64,'+attach.file+'" class="file-preview-image kv-preview-data min-file-preview-image"/>');
                        var config = {};
                        config.url=app.appOption.url + driver.driverUrl + "deleteImageByFileId/"+attach.id+"?sspi="+app.appOption.getQueryParam("sspi");
                        initConfigArr.push(config);
                    }
                }
                app.appOption.fileInput.fileCounts = imageArr.length;
                app.appOption.fileInput.destroy($("#edit-attachmentImages"));
                app.appOption.fileInput.init($("#edit-attachmentImages"),$.extend({},driver.driverImageOppition,{
                    uploadUrl:app.appOption.url+driver.driverUrl+"updateDriver?sspi="+app.appOption.getQueryParam("sspi"),
                    initialPreview: imageArr,
                    initialPreviewConfig:initConfigArr,
                    minFileCount : 2,
                    maxFileCount:2}), true);
                $("#edit-rating").raty($.extend({},driver.ratingOption,{
                    score:editDriverVue.driverInfo.rating,
                    target: '#edit-rating-value',
                    click:function (score, evt) {
                        if(!score) score = 0;
                        $("#edit-rating-value").val(score);
                    }
                }));

                $("#edit-show-portrait").attr("src",app.appOption.url + "getImageByBusinessId/"+result.id+"?sspi="+app.appOption.getQueryParam("sspi"));
                $("#edit-por-data").val("-1");
            }
            $("#editDriver").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (driverId) {
        this.driverId = driverId;
        // $("#deletedriver").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+driver.driverUrl+"deleteDriver/"+driver.driverId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deletedriver").modal("hide");
                    driverTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            ignore:"",
            rules:{
                image:"required",
                firstName:"required",
                lastName:"required",
                licenseNo:"required",
                mobile:"required",
                // rating:"required"
            },
            messages:{
                image:editDriverVue.message.validate.require,
                firstName:editDriverVue.message.validate.require,
                lastName:editDriverVue.message.validate.require,
                licenseNo:editDriverVue.message.validate.require,
                mobile:editDriverVue.message.validate.require
                // rating:"this field is required!"
            },
            errorPlacement: function (error, element) {
                element.closest(".valid-frame").addClass("has-error").removeClass("has-success").append(error);
            },
            success: function (label) {
                label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                label.remove();
            }
        })
    }
};

window.driver = driver;
//editTag vue object
var editDriverVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        driverInfo:{
           id:'',
           firstName:'',
           lastName:'',
           licenseNo:'',
           mobile:'',
           rating:''
        }
    }
});
