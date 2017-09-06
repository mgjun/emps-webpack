/**
 * Created by MENGJUN on 2017/2/14.
 */
var packageTable;
$(document).ready( function () {
    packageTable = $("#package-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
//            data.columns[0].search.value = $("#zone-name-value").val();
            app.appOption.ajax.url = app.appOption.url+packages.packageUrl+"viewPackages";
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
                "data":"name"
            },
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    var str = row.length+' X '+row.width+' X '+row.height;
                    return str;
                }
            },
            {
                "data":"maxWeight"
            },
            {
                "data":"minWeight"
            },  
            {
                "data":"volumn"
            },    
            {
                "orderable":false,
                "data":"description",
                // "sWidth":"200px",
                "sClass":"ellipsis"
            },              
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="packages.update('+row.id+')" class="btn btn-sm btn-app-primary package-show-edit">'+editPackageVue.message.button.edit+'</button>'+
                        '<button onclick="packages.delete('+row.id+')" class="btn btn-sm btn-app-danger package-show-delete">'+editPackageVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2();

    //save create setting
    $("#package-create-save").bind("click",function () {
        var validator = packages.formValidate($("#package-create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+packages.packageUrl+"create";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#package-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addPackage").modal("hide");
            packageTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit setting
    $("#package-edit-save").bind("click",function () {
        var validator = packages.formValidate($("#package-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+packages.packageUrl+"update";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#package-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editPackage").modal("hide");
            packageTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete setting
    $("#package-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+packages.packageUrl+"delete/"+packages.packageId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deletePackage").modal("hide");
            packageTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#package-name-search").bind("click",function () {
        // setting.isNameSearch = true;
        packageTable.draw();
        // $("#setting-name-value").val("");
    });

    // $("input[name='name'],input[name='maxWeight']").on("change",function () {
    //    var currentForm = $(this).closest("form");
    //    packages.formValidate(currentForm).element(currentForm.find("input[name='volumn']"));
    // });
});

var packages = {
    packageId:null,
    // isNameSearch:false,
    packageUrl:"v1/api/package/",
    create:function () {
        $("#package-create-form").resetValue().resetValidation();
        $("#addPackage").modal("show");  
    },
    update:function (packageId) {
        $("#package-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+packages.packageUrl+"findPackageById/"+packageId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:packageId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
            	editPackageVue.packageInfo = result;
            }
            $("#editPackage").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (packageId) {
        this.packageId = packageId;
        // $("#deletePackage").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+packages.packageUrl+"delete/"+packages.packageId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deletePackage").modal("hide");
                    packageTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                name:{
                    required:true
                },
                length:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                width:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                height:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                maxWeight:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true,
                    remote:{
                        url:app.appOption.url+packages.packageUrl+"isExistPackage?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            maxWeight:function() {
                                obj.find("input[name='maxWeight']").removeData("previousValue");
                                return obj.find("input[name='maxWeight']").val();
                            },
                            volumn:function() {
                                obj.find("input[name='volumn']").removeData("previousValue");
                                return obj.find("input[name='volumn']").val();
                            }
                        }
                    }
                },
                minWeight:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true,
                    lessThan:obj.find("input[name='maxWeight']")
                },
                volumn:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true,
                    remote:{
                        url:app.appOption.url+packages.packageUrl+"isExistPackage?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            maxWeight:function() {
                                obj.find("input[name='maxWeight']").removeData("previousValue");
                                return obj.find("input[name='maxWeight']").val();
                            },
                            volumn:function() {
                                obj.find("input[name='volumn']").removeData("previousValue");
                                return obj.find("input[name='volumn']").val();
                            }
                        }
                    }
                },
                description:{
                    maxlength:100
                }
            },
            messages:{
                name:{
                    required:editPackageVue.message.validate.require
                },
                length:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","length")
                },
                width:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","width")
                },
                height:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","height")
                },
                maxWeight:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","maxWeight"),
                    remote:editPackageVue.message.validate.dupWeightAndVolume
                },
                minWeight:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","minWeight"),
                    lessThan:editPackageVue.message.validate.weightLessThan
                },
                volumn:{
                    required:editPackageVue.message.validate.require,
                    number:editPackageVue.message.validate.number,
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editPackageVue.message.validate.bigZero.replace("{0}","volumn"),
                    remote:editPackageVue.message.validate.dupWeightAndVolume
                },
                description:{
                    maxlength:editPackageVue.message.validate.maxlength.replace("{0}","100")
                }

            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === editPackageVue.message.validate.dupWeightAndVolume) {
                    element.parent().addClass("duplicated");
                }
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                if(label.closest("div").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.parent().removeClass("has-error");
                    label.parent().addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};

window.packages = packages;
//editsetting vue object
var editPackageVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        packageInfo:{
        }
    }
});
