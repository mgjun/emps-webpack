/**
 * Created by MENGJUN on 2017/2/14.
 */
var zoneTable;
$(document).ready( function () {
    zoneTable = $("#zone-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
           data.columns[2].search.value = $("#postal-code-value").val();
            app.appOption.ajax.url = app.appOption.url+zone.zoneUrl+"viewZones";
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
                "data":"zoneId"
            },
            {
                "data":"name"
            },
            {
                "data":"postal"
            },
            {
                "data":"address"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="zone.update('+row.id+')" class="btn btn-sm btn-app-primary zone-show-edit">'+editZoneVue.message.button.edit+'</button>'+
                        '<button onclick="zone.delete('+row.id+')" class="btn btn-sm btn-app-danger zone-show-delete">'+editZoneVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2();

    //save create setting
    $("#zone-create-save").bind("click",function () {
        zone.validator = zone.formValidate($("#zone-create-form"));
        if(!zone.validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+zone.zoneUrl+"createZone";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#zone-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addZone").modal("hide");
            zoneTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit setting
    $("#zone-edit-save").bind("click",function () {
        zone.validator = zone.formValidate($("#zone-edit-form"));
        if(!zone.validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+zone.zoneUrl+"updateZone";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#zone-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editZone").modal("hide");
            zoneTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete setting
    $("#zone-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+zone.zoneUrl+"deleteZone/"+zone.zoneId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteZone").modal("hide");
            zoneTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#postal-code-search").bind("click",function () {
        // setting.isNameSearch = true;
        zoneTable.draw();
        // $("#setting-name-value").val("");
    });

    // $("input[name='zoneId']").on("change",function () {
    //     zone.formValidate($(this).closest("form")).element($(this).closest("form").find("input[name='postal']"));
    // });
});

var zone = {
    zoneId:null,
    // isNameSearch:false,
    zoneUrl:"v1/api/zone/",
    validator:null,
    create:function () {
        $("#zone-create-form").resetValue().resetValidation();
        $("#addZone").modal("show");  
    },
    update:function (zoneId) {
        $("#zone-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+zone.zoneUrl+"findZoneById/"+zoneId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:zoneId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
            	editZoneVue.zoneInfo = result;
            }
            $("#editZone").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (zoneId) {
        this.zoneId = zoneId;
        // $("#deleteZone").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+zone.zoneUrl+"deleteZone/"+zone.zoneId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteZone").modal("hide");
                    zoneTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                zoneId:{
                    required:true
                },
                name:{
                    required:true,
                    remote:{
                        url:app.appOption.url+zone.zoneUrl+"isExistName?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function () {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            name:function () {
                                obj.find("input[name='name']").removeData("previousValue");
                                return obj.find("input[name='name']").val();
                            }
                        }
                    }
                },
                postal:{
                    required:true,
                    remote:{
                        url:app.appOption.url+zone.zoneUrl+"isExistPostal?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function () {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            postal:function () {
                                obj.find("input[name='postal']").removeData("previousValue");
                                return obj.find("input[name='postal']").val();
                            }
                        }
                    }
                },
                address:"required",
                boundary:"required",
                latitude:{
                    required:true,
                    number:true
                },
                longitude:{
                    required:true,
                    number:true
                }
            },
            messages:{
                zoneId:editZoneVue.message.validate.require,
                name:{
                    required:editZoneVue.message.validate.require,
                    remote:editZoneVue.message.validate.dupTypeAndName
                },
                postal:{
                    required:editZoneVue.message.validate.require,
                    remote:editZoneVue.message.validate.dupTypeAndName
                },
                address:editZoneVue.message.validate.require,
                boundary:editZoneVue.message.validate.require,
                latitude:{
                    required:editZoneVue.message.validate.require,
                    number:editZoneVue.message.validate.invalid
                },
                longitude:{
                    required:editZoneVue.message.validate.require,
                    number:editZoneVue.message.validate.invalid
                }
            },
            errorPlacement: function (error, element) {
                // if(error[0].textContent === "duplicated zoneId and postal!") {
                //     element.parent().addClass("duplicated");
                // }
                element.parent().addClass("has-error").append(error);
            },
            success: function (label) {
                // if(label.closest("div").hasClass("duplicated")) {
                //     var _label = label.closest("form").find(".duplicated").find("label.error");
                //     _label.parent().removeClass("has-error").addClass("has-success");
                //     _label.remove();
                // }else {
                    label.parent().removeClass("has-error").addClass("has-success");
                    label.remove();
                // }
            }
        })
    }
};

window.zone = zone;
//editsetting vue object
var editZoneVue = new Vue({
	i18n:commonMsg.i18n,
    el:".content",
    data:{
        zoneInfo:{
        },
        message:commonMsg.messages
    }
});
