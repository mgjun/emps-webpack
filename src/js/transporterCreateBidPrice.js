/**
 * Created by MENGJUN on 2017/2/22.
 */
var priceTable;
$(document).ready(function () {
    priceTable = $("#price-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        ordering:false,
        ajax:function (data, callback, settings) {
            data.columns.push({
                data:"transporterBidId",
                name:"",
                searchable:true,
                orderable:false,
                search:{
                    value:app.appOption.getQueryParam("transporterBidId"),
                    regex:false
                }
            });
            app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/viewPrice";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
             	$("#view1").empty();
                $("#view1").append(priceEditVue.message.transporterCreateBidTitleInfo
                                    .replace("{from}",app.appOption.getQueryParam("from"))
                                    .replace("{end}",app.appOption.getQueryParam("end"))
                                    .replace("{vehicleName}",app.appOption.getQueryParam("vehicleName")));
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        columns:[
            {
                data:"dayOfWeek"
            },
            {
                data:"priceMaxM3",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.priceMaxM3);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:"priceMaxKg",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.priceMaxKg);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:"pricePerM3",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.pricePerM3);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:"pricePerKg",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.pricePerKg);
                },
                "sClass":"text-right text-inline"
            },
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    return '<button id="edit-'+meta.row+'" onclick="price.update(\'edit-'+meta.row+'\');" class="btn btn-app-primary">'+priceEditVue.message.button.edit+'</button>' +
                        '<button onclick="price.delete('+row.id+');" class="btn btn-app-danger">'+priceEditVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();
    $(".select2").select2();
    //iCheck for checkbox and radio inputs
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        var $form = $(this).closest("form");
        var $validEl = $form.find("input[name='validDayOfWeek']");
        $validEl.val($(this).val());
        price.formValidate($form).element($validEl);
    });
    
    $("#price-create-save").bind("click",function () {
        var validator = price.formValidate($("#price-create-form"));
        if(!validator.form()) {
            return;
        }
        priceEditVue.priceInfo = $("#price-create-form").serializeObject();
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/createPrice/"+app.appOption.getQueryParam("transporterBidId")+"/"+app.appOption.getQueryParam("vehicleTypeId");
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = JSON.stringify(priceEditVue.priceInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addPrice").modal("hide");
            priceTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    $("#price-edit-save").bind("click",function () {
        var validator = price.formValidate($("#price-edit-form"));
        if(!validator.form()) {
            return;
        }
        priceEditVue.priceInfo = $("#price-edit-form").serializeObject();
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/updateVehicleTypePrice/"+app.appOption.getQueryParam("transporterBidId")+"/"+app.appOption.getQueryParam("vehicleTypeId");
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(priceEditVue.priceInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editPrice").modal("hide");
            priceTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    $("#price-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/deleteVehicleTypePrice/"+price.id;
        app.appOption.ajax.type = "DELETE";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deletePrice").modal("hide");
            priceTable.draw();
        },function (error) {
            console.log(error);
        })
    });


    $("#price-next").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/saveBid/"+app.appOption.getQueryParam("transporterBidId");
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            app.appOption.alertify._init({
                ok:priceEditVue.message.button.ok,
                cancel:priceEditVue.message.button.cancel,
                hideCancel:true,
                confirmMsg:priceEditVue.message.bidSaveSuccessInfo.replace("{bidNo}",result.bidNo),
                confirmFn:function (e) {
                    window.location.href='transporterBidView.html?sspi='+app.appOption.getQueryParam('sspi')
                }
            });
        },function (error) {
            console.log(error);
        });
    })

});
var price = {
    id:null,
    clickButtonId:null,
    url:"v1/api/transporterCreateBidPrice/",
    curEditDayOfWeek:null,
    curDayOfWeek:null,
    create:function () {
        this.curEditDayOfWeek = null;
        $("#price-create-form").resetValue().resetValidation();
        $("#addPrice").find("input[type='radio']").iCheck("uncheck");
        $("#create-vehicleTypeId").val(app.appOption.getQueryParam("vehicleTypeId"));
        $("#addPrice").modal("show");
    },
    update:function (btnId) {
        $("#price-edit-form").resetValidation();
        $("#update-vehicleTypeId").val(app.appOption.getQueryParam("vehicleTypeId"));
        this.clickButtonId = btnId;
        var rowData = priceTable.row($("#"+btnId).closest("tr")).data();
        this.curEditDayOfWeek = rowData.dayOfWeek;
        priceEditVue.priceInfo = app.appOption.deepCopy(rowData);
        $("#editPrice").find("input[value="+priceEditVue.priceInfo.dayOfWeek+"]").iCheck("check");
        $("#editPrice").modal("show");
    },
    delete:function (id) {
        this.id = id;
        // $("#deletePrice").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/deleteVehicleTypePrice/"+price.id;
                app.appOption.ajax.type = "DELETE";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deletePrice").modal("hide");
                    priceTable.draw();
                },function (error) {
                    console.log(error);
                })
            }
        })
    },
    formValidate:function (formObj) {
        return formObj.validate({
            ignore:"",
            rules:{
                priceMaxM3:{
                    required:true,
                    maxlength:14,
                    number:true,
                    bigZero:true
                },
                priceMaxKg:{
                    required:true,
                    maxlength:14,
                    number:true,
                    bigZero:true
                },
                pricePerM3:{
                    required:true,
                    maxlength:14,
                    number:true,
                    bigZero:true
                },
                pricePerKg:{
                    required:true,
                    maxlength:14,
                    number:true,
                    bigZero:true
                },
                validDayOfWeek:{
                    required:true,
                    minlength:1,
                    crossDayOfWeek:true
                }
            },
            messages:{
                priceMaxM3:{
                    required:priceEditVue.message.validate.require,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","price max m³")
                },
                priceMaxKg:{
                    required:priceEditVue.message.validate.require,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","price max kg")
                },
                pricePerM3:{
                    required:priceEditVue.message.validate.require,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","price per m³")
                },
                pricePerKg:{
                    required:priceEditVue.message.validate.require,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","Price per kg")
                },
                validDayOfWeek:{
                    number:priceEditVue.message.validate.number,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","1"),
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","Day Of Week")
                }
            },
            errorPlacement:function (error, element) {
                element.closest(".valid-frame").addClass("has-error");
                element.closest(".valid-frame").removeClass("has-success");
                element.closest(".valid-frame").append(error);
            },
            success:function (label) {
                label.closest(".valid-frame").removeClass("has-error");
                label.closest(".valid-frame").addClass("has-success");
                label.remove();
            }
            
        });
    }
};
// var priceAddVue = new Vue({
//     el:"#addPrice",
//     data:{
//         priceInfo:{}
//     }
// });

window.price = price;
var priceEditVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        priceInfo:{}
    }
});

//validate phone
jQuery.validator.addMethod("crossDayOfWeek", function (value, element,param) {
    for(var i=0;i<$("#price-table tbody tr").length;i++) {
        var rowData = priceTable.row($("tr")[i+1]).data();
        if(rowData && rowData.dayOfWeek && value == rowData.dayOfWeek && rowData.dayOfWeek != price.curEditDayOfWeek) {
            return false;
        }
    }
    return true;
}, "Day of week overlap!");