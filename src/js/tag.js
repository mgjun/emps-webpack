/**
 * Created by MENGJUN on 2017/2/14.
 */
var tagTable;alert(1);alert(2);
$(document).ready( function () {
    tagTable = $("#tag-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#tag-name-value").val();
            app.appOption.ajax.url = app.appOption.url+tag.tagUrl+"viewTag";
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
                "data":"type"
            },
            {
                "orderable":false,
                "data":"description",
                "sClass":"ellipsis"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="tag.update('+row.id+')" class="btn btn-sm btn-app-primary tag-show-edit">'+editTagVue.message.button.edit+'</button>'+
                        '<button onclick="tag.delete('+row.id+')" class="btn btn-sm btn-app-danger tag-show-delete">'+editTagVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2();

    //save create tag
    $("#tag-create-save").bind("click",function () {
        var validator = tag.formValidate($("#tag-create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+tag.tagUrl+"createTag";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#tag-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            console.log(result);
            $("#addTag").modal("hide");
            tagTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit tag
    $("#tag-edit-save").bind("click",function () {
        var validator = tag.formValidate($("#tag-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+tag.tagUrl+"updateTag";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#tag-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editTag").modal("hide");
            tagTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete tag
    $("#tag-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+tag.tagUrl+"deleteTag/"+tag.tagId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteTag").modal("hide");
            tagTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by tag name
    $("#tag-name-search").bind("click",function () {
        // tag.isNameSearch = true;
        tagTable.draw();
        // $("#tag-name-value").val("");
    });

});

var tag = {
    tagId:null,
    // isNameSearch:false,
    tagUrl:"v1/api/tag/",
    create:function () {
        $("#tag-create-form").resetValue().resetValidation();
        $("#addTag").modal("show");  
    },
    update:function (tagId) {
        $("#tag-edit-form").resetValidation();
        app.appOption.ajax.url = app.appOption.url+tag.tagUrl+"findTagById/"+tagId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:tagId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                editTagVue.tagInfo = result;
            }
            $("#editTag").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (tagId) {
        this.tagId = tagId;
        // $("#deleteTag").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+tag.tagUrl+"deleteTag/"+tag.tagId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteTag").modal("hide");
                    tagTable.draw();
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
                    required:true,
                    remote:{
                        url:app.appOption.url+tag.tagUrl+"isExistTag?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            type:function () {
                                obj.find("select[name='type']").removeData("previousValue");
                                return obj.find("select[name='type']").val();
                            },
                            name:function() {
                                obj.find("input[name='name']").removeData("previousValue");
                                return obj.find("input[name='name']").val();
                            }
                        }
                    }
                },
                type:{
                    required:true,
                    remote:{
                        url:app.appOption.url+tag.tagUrl+"isExistTag?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            type:function () {
                                obj.find("select[name='type']").removeData("previousValue");
                                return obj.find("select[name='type']").val();
                            },
                            name:function() {
                                obj.find("input[name='name']").removeData("previousValue");
                                return obj.find("input[name='name']").val();
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
                    required:editTagVue.message.validate.require,
                    remote:editTagVue.message.validate.dupNameAndType
                },
                type:{
                    required:editTagVue.message.validate.require,
                    remote:editTagVue.message.validate.dupNameAndType
                },
                description:{
                    maxlength:editTagVue.message.validate.maxlength.replace("{0}","100")
                }
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === "duplicated name and type!") {
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
                } else {
                    label.parent().removeClass("has-error").addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};
//editTag vue object
var editTagVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        tagInfo:{
           id:'',
           name:'',
           type:'',
           description:''
        }
    }
});
window.tag = tag;