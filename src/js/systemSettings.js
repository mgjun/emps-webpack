/**
 * Created by MENGJUN on 2017/2/14.
 */
var settingTable;
$(document).ready( function () {
    settingTable = $("#setting-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#setting-name-value").val();
            app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"viewSystemSettings";
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
                "data":"keyName"
            },
            {
                "data":"type"
            },
            {
                "data":"value"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                	var editButton = '<button onclick="setting.update('+row.id+')" class="btn btn-sm btn-app-primary setting-show-edit">'+editsettingVue.message.button.edit+'</button>';
                    var uploadButton = '<button onclick="setting.upload('+row.id+')" class="btn btn-sm btn-app-primary setting-show-edit">'+editsettingVue.message.button.upload+'</button> ';
                   // var downloadButton = '<button onclick="setting.download('+row.id+')" class="btn btn-sm btn-app-primary setting-show-edit">Download</button> ';
                    var downloadButton ='<a class="btn btn-app-danger"  href='+app.appOption.url+setting.settingUrl+'downloadPdfFile?sspi='+app.appOption.getQueryParam("sspi")+'>'+editsettingVue.message.button.download+'</a>'
                    var str = "";
                    if("uploadPdf" == row.type){
                        str = uploadButton+downloadButton;
                    }else{
                    	 str = editButton;
                    }
                    return str;
/*                        '<button onclick="setting.delete('+row.id+',\''+row.name+'\')" class="btn btn-sm btn-app-danger setting-show-delete">Delete</button>';*/
                }
            }
        ]
    })).api();

    $(".select2").select2();


    //save create setting
    $("#setting-create-save").bind("click",function () {
        var validator = setting.formValidate($("#setting-create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+setting.settingUrl+"createSystemSettings";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#setting-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addSetting").modal("hide");
            settingTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit setting
    $("#setting-edit-save").bind("click",function () {
        var validator = setting.formValidate($("#setting-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"updateSystemSetting";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#setting-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editSetting").modal("hide");
            settingTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    //save edit setting
    $("#setting-upload-save").bind("click",function () {
        app.appOption.fileInput.upload($("#jobPdfFile"));//发送上传请求
    });
    //save delete setting
    $("#setting-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"deleteSystemSetting/"+setting.settingId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteSetting").modal("hide");
            settingTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#setting-name-search").bind("click",function () {
        // setting.isNameSearch = true;
        settingTable.draw();
        // $("#setting-name-value").val("");
    })
});

var setting = {
    settingId:null,
    // isNameSearch:false,
    settingUrl:"v1/api/setting/",
    create:function () {
        $("#setting-create-form").resetValue().resetValidation();
        $("#addSetting").modal("show");  
    },
    update:function (settingId) {
        $("#setting-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"findSettingById/"+settingId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:settingId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                editsettingVue.settingInfo = result;
            }
            $("#editSetting").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    download:function (settingId) {

        app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"downloadPdfFile";
        app.appOption.ajax.type="get";

        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {

            }
            //$("#editSetting").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    upload:function (settingId) {
        //$("#setting-load-form").resetValidation();
    	this.settingId = settingId;
        $("#uploadSetting").modal("show");
        app.appOption.fileInput.destroy($("#jobPdfFile"));
        app.appOption.fileInput.init($("#jobPdfFile"),{
            uploadUrl:app.appOption.url+setting.settingUrl+"uploadPdfFile/"+setting.settingId+"?sspi="+app.appOption.getQueryParam('sspi'),
            allowedFileTypes: ['pdf'],
            allowedFileExtensions: ['pdf'],
            maxFileSize: 10*1024,
            minFileCount: 1,
            maxFileCount: 1,
            ajaxSettings:{
                beforeSend:function () {
                    $(".content").loadingOverlay({loadingText:"waiting"});
                },
                complete:function () {
                    $(".content").loadingOverlay("remove");
                    $("#jobPdfFile").attr("disabled",false);
                },
                success:function (result) {
                    if(result.result == "SUCCESS") {
                        app.appOption.fileInput.progressSuccess();
                        $("#uploadSetting").modal("hide");
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
        },true);

    },
    delete:function (settingId,settingName) {
        this.settingId = settingId;
        deletesettingVue.settingName = settingName;
        // $("#deleteSetting").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+setting.settingUrl+"deleteSystemSetting/"+setting.settingId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteSetting").modal("hide");
                    settingTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                keyName:{
                    required:true,
                    remote:{
                        url:app.appOption.url+setting.settingUrl+"isExistSystemSettings?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function() {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            keyName:function() {
                                obj.find("input[name='keyName']").removeData("previousValue");
                                return obj.find("input[name='keyName']").val();
                            },
                            type:function() {
                                obj.find("input[name='type']").removeData("previousValue");
                                return obj.find("input[name='type']").val();
                            }
                        }
                    }
                },
                type:{
                    required:true,
                    remote:{
                        url:app.appOption.url+setting.settingUrl+"isExistSystemSettings?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function() {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            keyName:function() {
                                obj.find("input[name='keyName']").removeData("previousValue");
                                return obj.find("input[name='keyName']").val();
                            },
                            type:function() {
                                obj.find("input[name='type']").removeData("previousValue");
                                return obj.find("input[name='type']").val();
                            }
                        }
                    }
                },
                value:"required"
            },
            messages:{
                keyName:{
                    required:editsettingVue.message.validate.require,
                    remote:editsettingVue.message.validate.dupNameAndType
                },
                type:{
                    required:editsettingVue.message.validate.require,
                    remote:editsettingVue.message.validate.dupNameAndType
                },
                value:editsettingVue.message.validate.require
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === "duplicated name and type!") {
                    element.parent().addClass("duplicated");
                }
                element.parent().addClass("has-error").removeClass("has-success");
                element.parent().append(error);
            },
            success: function (label) {
                if(label.closest("div").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.parent().removeClass("has-error").addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};

window.setting = setting;
//editsetting vue object
var editsettingVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        settingInfo:{
           id:'',
           name:'',
           type:'',
           description:''
        }
    }
});
var deletesettingVue = new Vue({
    el:"#deleteSetting",
    data:{
        settingName:null
    }
});
