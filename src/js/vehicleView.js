/**
 * Created by MENGJUN on 2017/2/14.
 */
var vehicleTable;
$(document).ready( function () {
    vehicleTable  = $("#vehicle-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#vehicle-type-value").val();
            app.appOption.ajax.url = app.appOption.url+vehicle.url+"viewVehicle";
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
                "data":"no"
            },
            {
                "data":"typeName",
                "orderable":false
            },
            {
                "data":"availability",
                "orderable":false,
                "render":function (data,type,row,meta) {
                    var avArr = row.availability;
                    var resultStr = "";
                    for(var i=0;i<avArr.length;i++) {
                        var dayOfWeekArr = avArr[i].dayOfWeek.split(",");
                        for(var j=0;j<dayOfWeekArr.length;j++) {
                            if(!app.isEmpty(dayOfWeekArr[j])) {
                                resultStr+='<div>' +
                                    '<div class="col-sm-4">'+dayOfWeekArr[j]+'</div>' +
                                    '<div class="col-sm-6">['+app.timeFormat(avArr[i].fromTime)+' - '+app.timeFormat(avArr[i].toTime)+']</div>' +
                                    '</div>';
                            }
                        }
                    }
                    return resultStr;
                }
            },
            {
                data:"driverDto.id",
                orderable:false,
                render:function (data, type, row, meta) {
                    if(row.driverDto) {
                        return row.driverDto.firstName + ' ' + row.driverDto.lastName;
                    }
                    return "";
                }
            },
            {
                data:"distancePrice",
                orderable:false,
                "sClass":"text-right",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.distancePrice)
                }
            },
            {
                data:"basePrice",
                orderable:false,
                "sClass":"text-right",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.basePrice)
                }
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="vehicle.update('+row.id+')" class="btn btn-sm btn-app-primary tag-show-edit">'+veEditVue.message.button.edit+'</button>'+
                        '<button onclick="vehicle.delete('+row.id+')" class="btn btn-sm btn-app-danger tag-show-delete">'+veEditVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    //save edited vehicle
    $("#vehicle-edit-save").bind("click",function () {
        var validator = vehicle.formValidate($("#vehicle-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+vehicle.url+"updateVehicle";
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(veEditVue.vehicleInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editVehicle").modal("hide");
            vehicleTable.draw();
        },function (error) {
            console.log(error);
        })
    });
    
    //save delete vehicle
    $("#vehicle-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+vehicle.url+"deleteVehicle/"+vehicle.id;
        app.appOption.ajax.type = "DELETE";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteVehicle").modal("hide");
            vehicleTable.draw();
        },function (error) {
            console.log(error);
        })
    });
    
    $("#vehicle-type-search").bind("click",function () {
       vehicleTable.draw(); 
    });
    //load all vehicleTypes
    vehicle.loadAllTypes();
});
var vehicle = {
    url:"v1/api/vehicle/",
    typeUrl:"v1/api/vehicleType/",
    rowNum:null,
    id:null,
    update:function (id) {
        // $("#vehicle-edit-form").resetValidation();
        // this.rowNum = parseInt(rowNum)+1;
        // veEditVue.vehicleInfo = vehicleTable.row($("tr")[this.rowNum]).data();
        // $("#editVehicle").modal("show");
        location.href = "./vehicleCreate.html?vehicleId="+id+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    delete:function (id) {
        this.id = id;
        // $("#deleteVehicle").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+vehicle.url+"deleteVehicle/"+vehicle.id;
                app.appOption.ajax.type = "DELETE";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteVehicle").modal("hide");
                    vehicleTable.draw();
                },function (error) {
                    console.log(error);
                })
            }
        })
    },
    loadAllTypes:function () {
        app.appOption.ajax.url = app.appOption.url+vehicle.typeUrl+"findAllVehicleType";
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            veEditVue.types = result;
            console.log(result);
        },function (error) {
            console.log(error);
        });
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                type:"required",
                no:{
                    required:true
                }
            },
            messages:{
                type:veEditVue.message.validate.require,
                no:veEditVue.message.validate.require
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
window.vehicle = vehicle;
var veEditVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        vehicleInfo:{
            id:null,
            no:null,
            typeId:null,
            typeName:null,
            availability:null
        },
        types:null
    }
});


