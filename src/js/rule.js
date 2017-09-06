/**
 * Created by MENGJUN on 2017/2/16.
 */
var ruleTable;
$(document).ready(function () {
    ruleTable = $("#rule-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"viewRule";
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
                "data":"tagName1",
                "render":function (data,type,row,meta) {
                    return row.tagName1+":"+row.tagType1;
                }
            },
            {
                "data":"tagName2",
                "render":function (data,type,row,meta) {
                    return row.tagName2+":"+row.tagType2;
                }
            },
            {"data":"ruleConstraint"},
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    console.log(row);
                    return '<button onclick="rule.update('+row.id+')" class="btn btn-sm btn-app-primary rule-show-edit">'+editRuleVue.message.button.edit+'</button>'+
                        '<button onclick="rule.delete('+row.id+')" class="btn btn-sm btn-app-danger rule-show-delete">'+editRuleVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();


    //save created rule
    $("#rule-create-save").bind("click",function () {
        var createValidator = rule.formValidate($("#rule-create-form"));
        if(!createValidator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"createRule";
        app.appOption.ajax.type = "POST";
        console.log(rule.dealTagType($("#rule-create-form").serializeObject()));
        app.appOption.ajax.data = JSON.stringify(rule.dealTagType($("#rule-create-form").serializeObject()));
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (_data) {
            $("#addRule").modal("hide");
            ruleTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    //save edited rule
    $("#rule-edit-save").bind("click",function () {
        var editValidator = rule.formValidate($("#rule-edit-form"));
        if(!editValidator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"updateRule";
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(rule.dealTagType($("#rule-edit-form").serializeObject()));
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (_data) {
            $("#editRule").modal("hide");
            ruleTable.draw();
        },function (error) {
            console.log(error);
        })
    });
    
    //save deleted rule
    $("#rule-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"deleteRule/"+rule.ruleId;
        app.appOption.ajax.type = "delete";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (_data) {
            $("#deleteRule").modal("hide");
            ruleTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    $("#rule-create-tagType").bind("change",function () {
        var typeGroupVal = $(this).val();
        if(typeGroupVal){
            var typeArr = typeGroupVal.split("VS");
            editRuleVue.tagType1 = app.upperCaseFirstLetter($.trim(typeArr[0]));
            editRuleVue.tagType2 = app.upperCaseFirstLetter($.trim(typeArr[1]));
            app.appOption.ajax.url = app.appOption.url+rule.tagUrl+"findTagByType/"+$.trim(typeArr[0])+"/"+$.trim(typeArr[1]);
            app.appOption.ajax.type = "POST";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                editRuleVue.tagResult1 = result.tagResult1;
                editRuleVue.tagResult2 = result.tagResult2;
            },function (error) {
                console.log(error);
            })
        }
    });
    $("#rule-edit-tagtype").bind("change",function () {
        var typeGroupVal = $(this).val();
        if(typeGroupVal){
            var typeArr = typeGroupVal.split("VS");
            editRuleVue.tagType1 = app.upperCaseFirstLetter($.trim(typeArr[0]));
            editRuleVue.tagType2 = app.upperCaseFirstLetter($.trim(typeArr[1]));
            editRuleVue.ruleInfo.tagName1 = editRuleVue.ruleInfo.tagName2 = "";
            app.appOption.ajax.url = app.appOption.url+rule.tagUrl+"findTagByType/"+$.trim(typeArr[0])+"/"+$.trim(typeArr[1]);
            app.appOption.ajax.type = "POST";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                editRuleVue.tagResult1 = result.tagResult1;
                editRuleVue.tagResult2 = result.tagResult2;
            },function (error) {
                console.log(error);
            })
        }
    });
});

var rule = {
    ruleId:null,
    ruleUrl:"v1/api/rule/",
    tagUrl:"v1/api/tag/",
    create:function () {
        $("#rule-create-form").resetValue().resetValidation();
        $("#addRule").modal("show");
    },
    update:function (ruleId) {
        $("#rule-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"findRuleById/"+ruleId;
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            editRuleVue.tagType1 = app.upperCaseFirstLetter(result.tagType1);
            editRuleVue.tagType2 = app.upperCaseFirstLetter(result.tagType2);
            app.appOption.ajax.url = app.appOption.url+rule.tagUrl+"findTagByType/"+result.tagType1+"/"+result.tagType2;
            app.appOption.ajax.type = "POST";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (_data) {
                editRuleVue.tagResult1 = _data.tagResult1;
                editRuleVue.tagResult2 = _data.tagResult2;

                editRuleVue.ruleInfo.id = result.id;
                editRuleVue.ruleInfo.tagName1 = result.tagName1;
                editRuleVue.ruleInfo.tagName2 = result.tagName2;
                editRuleVue.ruleInfo.tagType1 = result.tagType1;
                editRuleVue.ruleInfo.tagType2 = result.tagType2;
                editRuleVue.ruleInfo.tagTypeGroup = result.tagType1 + " VS " + result.tagType2;
                editRuleVue.ruleInfo.ruleConstraint = result.ruleConstraint;
                $("#editRule").modal("show");
            },function (error) {
                console.log(error);
            })
        },function (error) {
            console.log(error);
        })
    },
    delete:function (ruleId,ruleName) {
        rule.ruleId = ruleId;
        // $("#deleteRule").modal("show");
        app.appOption.alertify._init({
           confirmFn:function (e) {
               app.appOption.ajax.url = app.appOption.url+rule.ruleUrl+"deleteRule/"+rule.ruleId;
               app.appOption.ajax.type = "delete";
               app.appOption.ajax.data = null;
               app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (_data) {
                   // $("#deleteRule").modal("hide");
                   ruleTable.draw();
               },function (error) {
                   console.log(error);
               })
           }
        });
    },
    dealTagType:function (formObj) {
        var tagTypeGroup = formObj.tagTypeGroup;
        var typeArr = tagTypeGroup.split("VS");
        formObj.tagType1 = $.trim(typeArr[0]);
        formObj.tagType2 = $.trim(typeArr[1]);
        return formObj;
    },
    formValidate:function (formObj) {
        return formObj.validate({
            rules:{
                tagTypeGroup:"required",
                tagName1:"required",
                tagName2:"required",
                ruleConstraint:"required"
            },
            messages:{
                tagTypeGroup:editRuleVue.message.validate.require,
                tagName1:editRuleVue.message.validate.require,
                tagName2:editRuleVue.message.validate.require,
                ruleConstraint:editRuleVue.message.validate.require
            },
            errorPlacement:function (error,element) {
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success:function (label) {
                label.parent().removeClass("has-error");
                label.parent().addClass("has-success");
                label.remove();
            }
        });
    }
};

window.rule = rule;
// var addRuleVue = new Vue({
//     el:"#addRule",
//     data:{
//         tagType1:null,
//         tagType2:null,
//         tagResult1:null,
//         tagResult2:null
//     }
// });
var editRuleVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        tagType1:null,
        tagType2:null,
        tagResult1:null,
        tagResult2:null,
        ruleInfo:{
            id:null,
            tagName1:null,
            tagName2:null,
            tagType1:null,
            tagType2:null,
            tagTypeGroup:null,
            ruleConstraint:null
        }
    }
});