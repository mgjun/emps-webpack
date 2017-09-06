/**
 * Created by MENGJUN on 2017/2/14.
 */
var vehicleTypeTable;
$(document).ready( function () {
    vehicleTypeTable = $("#vehicleType-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#vehicle-type-value").val();
            app.appOption.ajax.url = app.appOption.url+vehicleType.url+"viewVehicleTypeInfo";
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
                "data":"type"
            },
            {
                "data":"weight",
                "render":function (data,type, row, meta) {
                    return row.weight+"("+row.weightUom+")";
                }
            },
            {
                "data":"volume",
                "render":function (data,type, row, meta) {
                    return row.volume+"("+row.volumeUom+")";
                }
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
                    return '<button onclick="vehicleType.update('+row.id+')" class="btn btn-sm btn-app-primary vt-show-edit">'+vehicleEditVue.message.button.edit+'</button>'+
                        '<button onclick="vehicleType.delete('+row.id+')" class="btn btn-sm btn-app-danger vt-show-delete">'+vehicleEditVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    
    $("#vehicle-type-search").bind("click",function () {
        vehicleTypeTable.draw();
    });

    //save edit vehicleType
    $("#vehicleType-edit-save").bind("click",function () {
        var validator = vehicleType.formValidate($("#vehicleType-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+vehicleType.url+"updateVehicleType";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify(vehicleEditVue.vehicleInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editVehicleType").modal("hide");
            vehicleTypeTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete vehicleType
    $("#vehicleType-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+vehicleType.url+"deleteVehicleType/"+vehicleType.id;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteVehicleType").modal("hide");
            vehicleTypeTable.draw();
        },function (error) {
            console.log(error);
        });
    });


});

var vehicleType = {
    id:null,
    rowNum:null,
    url:"v1/api/vehicleType/",
    update:function (id) {
        // $("#vehicletype-edit-form").resetValidation();
        // this.rowNum = parseInt(rowNum+1);
        // vehicleEditVue.vehicleInfo = vehicleTypeTable.row($("tr")[this.rowNum]).data();
        // $("#editVehicleType").modal("show");
        location.href = "./vehicleTypeCreate.html?vehicleTypeId="+id+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    delete:function (id) {
        this.id = id;
        // $("#deleteVehicleType").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+vehicleType.url+"deleteVehicleType/"+vehicleType.id;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteVehicleType").modal("hide");
                    vehicleTypeTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                type:"required",
                weight:"required",
                volume:"required",
                weightUom:"required",
                volumeUom:"required"
            },
            messages:{
                category:vehicleEditVue.message.validate.require,
                item:vehicleEditVue.message.validate.require,
                tags:vehicleEditVue.message.validate.require,
                price:vehicleEditVue.message.validate.require,
                priceUnit:vehicleEditVue.message.validate.require
            },
            errorPlacement: function (error, element) {
                element.closest("div").addClass("has-error");
                element.closest("div").append(error);
            },
            success: function (label) {
                label.closest("div").removeClass("has-error");
                label.closest("div").addClass("has-success");
                label.remove();
            }
        })
    }
};
window.vehicleType = vehicleType;
var vehicleEditVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        vehicleInfo:{
            id:null,
            type:null,
            weight:null,
            weightUom:null,
            volume:null,
            volumeUom:null,
            description:null
        }
    }
});


