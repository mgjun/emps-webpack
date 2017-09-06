/**
 * Created by MENGJUN on 2017/3/24.
 */
var additionalTable;
$(document).ready(function () {
    additionalTable = $("#additional-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        ajax:function (data, callback, settings) {
            data.columns[1].search.value = $("#additional-name-value").val();
            app.appOption.ajax.url = app.appOption.url+additional.url+"viewAdditionalSettings";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
                callback(result);
            },function (error) {
                console.log(error);
            })
        },
        columns:[
            {
                data:"vehicleTypeId",
                render:function (data, type, row, meta) {
                    return row.vehicleTypeName;
                }
            },
            {
                data:"name"
            },
            {
                data:"sellingPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.sellingPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:"costPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.costPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data,type,row,meta) {
                    return '<button id="edit-'+meta.row+'" onclick="additional.update(\'edit-'+meta.row+'\')" class="btn btn-sm btn-app-primary">'+vm.message.button.edit+'</button>'+
                            '<button id="delete-'+meta.row+'" onclick="additional.delete('+row.id+')" class="btn btn-sm btn-app-danger">'+vm.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $("#additional-create-save").bind("click",function () {
        var validator = additional.formValidate($("#additional-create-form"));
        if(!validator.form()) return;
        var data = $("#additional-create-form").serializeObject();
        app.appOption.ajax.url = app.appOption.url+additional.url+"createAdditionalSettings";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = JSON.stringify(data);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            additionalTable.draw();
            $("#addAdditional").modal("hide");
        },function (error) {
            console.log(error);
        })
    });

    $("#additional-edit-save").bind("click",function () {
        var validator = additional.formValidate($("#additional-edit-form"));
        if(!validator.form()) return;
        var data = $("#additional-edit-form").serializeObject();
        app.appOption.ajax.url = app.appOption.url+additional.url+"updateAdditionalSettings";
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(data);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            additionalTable.draw();
            $("#editAdditional").modal("hide");
        },function (error) {
            console.log(error);
        })
    });

    $("#additional-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+additional.url+"deleteAdditionalSettings/"+additional.id;
        app.appOption.ajax.type = "delete";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            additionalTable.draw();
            $("#deleteAdditional").modal("hide");
        },function (error) {
            console.log(error);
            $("#deleteAdditional").modal("hide");
        })
    });

    $("#additional-name-search").bind("click",function () {
       additionalTable.draw();
    });

    additional.findAllVehicleTypes();
});
var additional = {
    id:null,
    url:"v1/api/additionalSettings/",
    create:function () {
        $("#additional-create-form").resetValue().resetValidation();
        $("#addAdditional").modal("show");
    },
    update:function (btnId) {
        $("#additional-edit-form").resetValidation();
        vm.editInfo = additionalTable.row($("#"+btnId).closest("tr")).data();
        $("#editAdditional").modal("show");
    },
    delete:function (id) {
        this.id = id;
        // $("#deleteAdditional").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+additional.url+"deleteAdditionalSettings/"+additional.id;
                app.appOption.ajax.type = "delete";
                app.appOption.ajax.data = "";
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    additionalTable.draw();
                },function (error) {
                    console.log(error);
                })
            }
        })
    },
    findAllVehicleTypes:function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/vehicleType/findAllVehicleType";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            vm.vehicleTypes = result;
        },function (error) {
            console.log(error);
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules: {
                vehicleTypeId: {
                    required:true,
                    remote:{
                        url:app.appOption.url+additional.url+"isExistAdditionalSetting?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            vehicleTypeId:function () {
                                obj.find("select[name='vehicleTypeId']").removeData("previousValue");
                                return obj.find("select[name='vehicleTypeId']").val();
                            },
                            name:function() {
                                obj.find("input[name='name']").removeData("previousValue");
                                return obj.find("input[name='name']").val();
                            }
                        }
                    }
                },
                name: {
                    required:true,
                    remote:{
                        url:app.appOption.url+additional.url+"isExistAdditionalSetting?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            vehicleTypeId:function () {
                                obj.find("select[name='vehicleTypeId']").removeData("previousValue");
                                return obj.find("select[name='vehicleTypeId']").val();
                            },
                            name:function() {
                                obj.find("input[name='name']").removeData("previousValue");
                                return obj.find("input[name='name']").val();
                            }
                        }
                    }
                },
                sellingPrice:{
                    required:true,
                    number:true,
                    bigZero:true
                },
                costPrice:{
                    required:true,
                    number:true,
                    bigZero:true
                }
            },
            messages: {
                vehicleTypeId: {
                    required:vm.message.validate.require,
                    remote:vm.message.validate.dupTypeAndName
                },
                name: {
                    required:vm.message.validate.require,
                    remote:vm.message.validate.dupTypeAndName
                },
                sellingPrice:{
                    required:vm.message.validate.require,
                    number:vm.message.validate.invalid,
                    bigZero:vm.message.validate.invalid
                },
                costPrice:{
                    required:vm.message.validate.require,
                    number:vm.message.validate.invalid,
                    bigZero:vm.message.validate.invalid
                }
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === vm.message.validate.dupTypeAndName) {
                    element.parent().addClass("duplicated");
                }
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                if(label.closest("div").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    label.closest("div").removeClass("duplicated");
                    _label.remove();
                }
                else {
                    label.parent().removeClass("has-error");
                    label.parent().addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};
window.additional = additional;
var vm = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        editInfo:{},
        vehicleTypes:[],
        message:commonMsg.messages
    }
});
