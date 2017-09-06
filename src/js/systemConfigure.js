/**
 * Created by MENGJUN on 2017/2/14.
 */
$(document).ready( function () {
    var datatable = $("#datatable").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#countryName-value").val();
            app.appOption.ajax.url = app.appOption.url+obj.objUrl+"/list";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                callback(result);
            },function (error) {
                console.log(error);
            });
            // $.ajax({
            //     type:"POST",
            //     url:app.appOption.url+obj.objUrl+"/list",
            //     data:JSON.stringify(data),
            //     dataType:"json",
            //     contentType:"application/json",
            //     success:function (_data) {
            //         callback(_data.data);
            //     },
            //     error:function (_data) {
            //         alert("error");
            //     }
            // });
        },
        "columns":[
            {
                "data":"countryName"
            },
            {
                "data":"countryCode"
            },
            {
                "data":null,
                "orderable":false,
				"searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="obj.update('+row.id+')" class="btn btn-sm btn-app-primary show-edit">'+editVue.message.button.edit+'</button>'+
                        '<button onclick="obj.delete('+row.id+',\''+row.countryName+'\')" class="btn btn-sm btn-app-danger show-delete">'+editVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2();

    //save create
    $("#create-save").bind("click",function () {
        var validator = obj.formValidate($("#create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+obj.objUrl;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#add").modal("hide");
            datatable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit
    $("#edit-save").bind("click",function () {
        var validator = obj.formValidate($("#edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+obj.objUrl;
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editVue").modal("hide");
            datatable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete 
    $("#delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+obj.objUrl+"/"+obj.objId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteVue").modal("hide");
            datatable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by name
    $("#search").bind("click",function () {
        datatable.draw();
    })
});

var obj = {
    objId:null,
    // isNameSearch:false,
    objUrl:"v1/api/country",
    //duplicated
    getParam:function (data) {
        var param = {};
        param.start = data.start;
        param.length = data.length;
        if(data.order&&data.order.length&&data.order[0]) {
            switch (data.order[0].column) {
                case 0:
                    param.orderColumn = "countryName";break;
                case 1:
                    param.orderColumn = "countryCode";break;
                default:
                    param.orderColumn = "countryName";break;
            }
            param.orderDir = data.order[0].dir;
        }
        return param;
    },
    create:function () {
        obj.resetForm();
		$("input").val("");
		$("#add").modal("show");  
    },
    update:function (id) {
		objId = id;
        obj.resetForm();
        app.appOption.ajax.url = app.appOption.url+obj.objUrl+"/"+objId;
        app.appOption.ajax.type="get";
        app.appOption.ajax.data={id:objId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                editVue.country = result;
            }
            $("#editVue").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (id,name) {
        this.objId = id;
        deleteVue.name = name;
        $("#deleteVue").modal("show");
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                countryName:"required",
                countryCode:"required"
            },
            messages:{
                countryName:editVue.message.validate.require,
                countryCode:editVue.message.validate.require
            },
            errorPlacement: function (error, element) {
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                label.parent().removeClass("has-error");
                label.parent().addClass("has-success");
                label.remove();
            }
        })
    },
    resetForm:function () {
        $(".has-success").removeClass("has-success");
        $(".has-error").removeClass("has-error");
        $("label.error").remove();
        $(".valid").removeClass("valid");
        $(".error").removeClass("error");
    }
};

window.obj = obj;
//edit vue object
var editVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        country:{
           id:'',
           countryName:'',
           countryCode:''
        }
    }
});
var deleteVue = new Vue({
    el:"#deleteVue",
    data:{
        name:null
    }
});
