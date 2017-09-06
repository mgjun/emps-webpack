/**
 * Created by MENGJUN on 2017/2/14.
 */
var leadTimeTable;
$(document).ready( function () {
    leadTimeTable = $("#leadTime-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
//            data.columns[0].search.value = $("#zone-name-value").val();
            app.appOption.ajax.url = app.appOption.url+leadTime.leadTimeUrl+"viewLeadTime";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                leadTime.leadTimeInfos = result.data;
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            {
                "data":"leadDayBegin"
            },
            {
                "data":"leadDayEnd"
            },
            {
                "data":"rate"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="leadTime.update('+row.id+')" class="btn btn-sm btn-app-primary leadTime-show-edit">'+editLeadTimeVue.message.button.edit+'</button>'+
                        '<button onclick="leadTime.delete('+row.id+')" class="btn btn-sm btn-app-danger leadTime-show-delete">'+editLeadTimeVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2();

    //save create setting
    $("#leadTime-create-save").bind("click",function () {
        var validator = leadTime.formValidate($("#leadTime-create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+leadTime.leadTimeUrl+"create";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#leadTime-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addLeadTime").modal("hide");
            leadTimeTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit setting
    $("#leadTime-edit-save").bind("click",function () {
        var validator = leadTime.formValidate($("#leadTime-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+leadTime.leadTimeUrl+"update";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#leadTime-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editLeadTime").modal("hide");
            leadTimeTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete setting
    $("#leadTime-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+leadTime.leadTimeUrl+"delete/"+leadTime.leadTimeId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteLeadTime").modal("hide");
            leadTimeTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#leadTime-name-search").bind("click",function () {
        // setting.isNameSearch = true;
        leadTimeTable.draw();
        // $("#setting-name-value").val("");
    });

    // $("input[name='leadDayBegin']").bind("change",function () {
    //     var currentForm = $(this).closest("form");
    //     leadTime.formValidate(currentForm).element(currentForm.find("input[name='leadDayEnd']"));
    // });
});

var leadTime = {
    leadTimeId:null,
    // isNameSearch:false,
    leadTimeUrl:"v1/api/leadTime/",
    leadTimeInfos:[],
    editLeadTimeInfo:{},
    create:function () {
        this.editLeadTimeInfo = {};
        $("#leadTime-create-form").resetValue().resetValidation();
        $("#addLeadTime").modal("show");  
    },
    update:function (leadTimeId) {
        $("#leadTime-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+leadTime.leadTimeUrl+"findLeadTimeById/"+leadTimeId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:leadTimeId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
            	editLeadTimeVue.leadTimeInfo = result;
            	leadTime.editLeadTimeInfo = app.appOption.deepCopy(result);
            }
            $("#editLeadTime").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (leadTimeId) {
        this.leadTimeId = leadTimeId;
        // $("#deleteLeadTime").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+leadTime.leadTimeUrl+"delete/"+leadTime.leadTimeId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteLeadTime").modal("hide");
                    leadTimeTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                leadDayBegin:{
                    required:true,
                    digits:true,
                    crossTime:obj.find("input[name='leadDayEnd']"),
                    remote:{
                        url:app.appOption.url+leadTime.leadTimeUrl+"isExistLeadTime?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            leadDayBegin:function () {
                                obj.find("input[name='leadDayBegin']").removeData("previousValue");
                                return obj.find("input[name='leadDayBegin']").val();
                            },
                            leadDayEnd:function () {
                                obj.find("input[name='leadDayEnd']").removeData("previousValue");
                                return obj.find("input[name='leadDayEnd']").val();
                            }
                        }
                    }
                },
                leadDayEnd:{
                    required:true,
                    digits:true,
                    bigThan:obj.find("input[name='leadDayBegin']"),
                    crossTime:obj.find("input[name='leadDayBegin']"),
                    remote:{
                        url:app.appOption.url+leadTime.leadTimeUrl+"isExistLeadTime?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            leadDayBegin:function () {
                                obj.find("input[name='leadDayBegin']").removeData("previousValue");
                                return obj.find("input[name='leadDayBegin']").val();
                            },
                            leadDayEnd:function () {
                                obj.find("input[name='leadDayEnd']").removeData("previousValue");
                                return obj.find("input[name='leadDayEnd']").val();
                            }
                        }
                    }
                },
                rate:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                type:"required"
            },
            messages:{
                leadDayBegin:{
                    required:editLeadTimeVue.message.validate.require,
                    digits:editLeadTimeVue.message.validate.digits,
                    crossTime:editLeadTimeVue.message.validate.leadCrossTime,
                    remote:editLeadTimeVue.message.validate.dupLeadDay
                },
                leadDayEnd:{
                    required:editLeadTimeVue.message.validate.require,
                    digits:editLeadTimeVue.message.validate.digits,
                    crossTime:editLeadTimeVue.message.validate.leadCrossTime,
                    bigThan:editLeadTimeVue.message.validate.leadBigThan,
                    remote:editLeadTimeVue.message.validate.dupLeadDay
                },
                rate:{
                    required:editLeadTimeVue.message.validate.require,
                    number:editLeadTimeVue.message.validate.digits,
                    maxlength:editLeadTimeVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:editLeadTimeVue.message.validate.bigZero.replace("{0}","rate")
                },
                type:editLeadTimeVue.message.validate.require
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === editLeadTimeVue.message.validate.dupLeadDay) {
                    element.parent().addClass("duplicated");
                }else if(error[0].textContent === editLeadTimeVue.message.validate.leadCrossTime) {
                    element.parent().addClass("crossTime");
                }
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                if(label.closest("div").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else if(label.closest("div").hasClass("crossTime")) {
                    var _label = label.closest("form").find(".crossTime").find("label.error");
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

window.leadTime = leadTime;
//editsetting vue object
var editLeadTimeVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        leadTimeInfo:{}
    }
});

$.validator.addMethod("crossTime",function (value, element, param) {
    var otherValue = param.val(),
        begin,end;
    for(var index in leadTime.leadTimeInfos) {
        begin = leadTime.leadTimeInfos[index].leadDayBegin;
        end = leadTime.leadTimeInfos[index].leadDayEnd;
        if(begin == leadTime.editLeadTimeInfo.leadDayBegin && end == leadTime.editLeadTimeInfo.leadDayEnd) {
            continue;
        }
        if(value >=  begin && value <= end ) {
            return false;
        }else if(otherValue && value <= begin && otherValue >= end) {
            return false;
        }else if(otherValue && value >= end && otherValue <= begin) {
            return false;
        }
    }
    return true;
},editLeadTimeVue.message.validate.leadCrossTime);
