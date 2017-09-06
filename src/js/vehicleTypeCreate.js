/**
 * Created by MENGJUN on 2017/2/14.
 */
var priceTable;
$(document).ready( function () {
    priceTable = $("#price-table").dataTable({
        "info":false,
        "searching":false,
        "paging":false,
        "bLengthChange":false,
        "ordering":false,
        language:{
            //     lengthMenu: "_MENU_",
            emptyTable:priceEditVue.message.table.emptyTable,
            zeroRecords:priceEditVue.message.table.zeroRecords,
            paginate: {
                "first":priceEditVue.message.table.first,
                "last":priceEditVue.message.table.last,
                "next":priceEditVue.message.table.next,
                "previous":priceEditVue.message.table.previous
            }
        },
        "columns":[
            {
                "data":"dayOfWeek"
            },
            {
                "data":"priceMaxM3",
                "render":function (data,type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.priceMaxM3);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"priceMaxKg",
                "render":function (data,type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.priceMaxKg);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"pricePerM3",
                "render":function (data,type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.pricePerM3);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"pricePerKg",
                "render":function (data,type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.pricePerKg);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button id="edit-'+meta.row+'" onclick="price.update(\'edit-'+meta.row+'\')" class="btn btn-sm btn-app-primary price-show-edit">'+priceEditVue.message.button.edit+'</button>'+
                        '<button id="delete-'+meta.row+'" onclick="price.delete(\'delete-'+meta.row+'\')" class="btn btn-sm btn-app-danger price-show-delete">'+priceEditVue.message.button.delete+'</button>';
                }
            }
        ],
        "initComplete":function () {
            var button = $(".dataTable tbody tr td button");
            if(button) {
                button.closest("td").css("word-break","keep-all").css("white-space","nowrap");
            }
        }
    }).api();


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

    //save create vehicleType
    $("#vehicleType-create-save").bind("click",function () {
        var validator = price.formValidate($("#vehicleType-create-form"));
        if(!validator.form()) {
            return;
        }
        var vehicleData = $("#vehicleType-create-form").serializeObject();
        var priceInfoArr = [];
        for(var i=0;priceTable.data() && i<priceTable.data().length;i++) {
            priceInfoArr.push(priceTable.data()[i]);
        }
        vehicleData.vehicleTypePriceDtoList = priceInfoArr;
        if(app.appOption.getQueryParam("vehicleTypeId")) {
            app.appOption.ajax.url=app.appOption.url+price.priceUrl+"updateVehicleType";
            app.appOption.ajax.type="PUT";
        }else {
            app.appOption.ajax.url=app.appOption.url+price.priceUrl+"createVehicleType";
            app.appOption.ajax.type="post";
        }
        app.appOption.ajax.data=JSON.stringify(vehicleData);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        	window.location.href='./vehicleTypeView.html?sspi='+app.appOption.getQueryParam("sspi");
        },function (error) {
            console.log(error);
        });
        
    });
    
    //save create price
    $("#price-create-save").bind("click",function () {
        var validator = price.formValidate($("#price-create-form"));
        if(!validator.form()) {
            return;
        }
        var newArr = [];
        newArr.push($("#price-create-form").serializeObject());
        priceTable.rows.add(newArr).draw();
        if(priceTable.data().length > 0) {
            $("#vehicleType-create-save").attr("disabled",false);
        }
        $("#addPrice").modal("hide");
    });


    //edit price
    $("#price-edit-save").bind("click",function () {
        var validator = price.formValidate($("#price-edit-form"));
        if(!validator.form()) {
            return;
        }
        priceEditVue.priceInfo = $("#price-edit-form").serializeObject();
        priceTable.row($("#"+price.clickButtonId).closest("tr")).data(priceEditVue.priceInfo).draw();
        $("#editPrice").modal("hide");
    });
    
    //delete price
    $("#price-delete-save").bind("click",function () {
        priceTable.row($("#"+price.clickButtonId).parents('tr')).remove().draw();
        if(priceTable.data().length <= 0) {
            $("#vehicleType-create-save").attr("disabled","disabled");
        }
        $("#deletePrice").modal("hide");
    });


    price.findById(app.appOption.getQueryParam("vehicleTypeId"));

    // //validate duplicated type,volume and weight
    // $("input[name='type'],input[name='weight']").bind("change",function () {
    //     var currentForm = $(this).closest("form");
    //     price.formValidate(currentForm).element(currentForm.find("input[name='volume']"));
    // });

});

var price = {
    clickButtonId:null,
    priceUrl:"v1/api/vehicleType/",
    curEditDayOfWeek:null,
    create:function () {
        price.curEditDayOfWeek = null;
        $("#price-create-form").resetValue().resetValidation();
        $("#addPrice").find("input[type='radio']").iCheck("uncheck");
        $("#addPrice").modal("show");
    },
    update:function (btnId) {
        $("#price-edit-form").resetValidation();
        this.clickButtonId = btnId;
        var rowData = priceTable.row($("#"+btnId).closest("tr")).data();
        this.curEditDayOfWeek = rowData.dayOfWeek;
        priceEditVue.priceInfo = app.appOption.deepCopy(rowData);
        $("#editPrice").find("input[value="+priceEditVue.priceInfo.dayOfWeek+"]").iCheck("check");
        $("#editPrice").modal("show");
    },
    delete:function (btnId) {
        this.clickButtonId = btnId;
        // $("#deletePrice").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                priceTable.row($("#"+price.clickButtonId).parents('tr')).remove().draw();
                if(priceTable.data().length <= 0) {
                    $("#vehicleType-create-save").attr("disabled","disabled");
                }
            }
        })
    },
    dayOfWeekExist:function (value,currentEditValue) {
        for(var i=0;i<$("#price-table tbody tr").length;i++) {
            var rowData = priceTable.row($("tr")[i+1]).data();
            if(rowData && rowData.dayOfWeek && value == rowData.dayOfWeek && rowData.dayOfWeek != currentEditValue) {
                return true;
            }
        }
        return false;
    },
    findById:function (typeId) {
        if(!typeId) return;
        app.appOption.ajax.url = app.appOption.url+price.priceUrl+"findVehicleTypeAndPriceList/"+typeId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            priceEditVue.vehicleTypeInfo = result.vehicleType;
            if(result.priceList) {
                priceTable.rows.add(result.priceList.data).draw();
                if(result.priceList.data && result.priceList.data instanceof Array
                    && result.priceList.data.length > 0) {
                    $("#vehicleType-create-save").attr("disabled",false);
                }
            }
        },function (error) {
            console.log(error);
        });
    },
    formValidate:function (obj) {
        return obj.validate({
            ignore:"",
            rules:{
                type:{
                    required:true,
                    remote:{
                        url:app.appOption.url+price.priceUrl+"isExistType?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            type:function () {
                                obj.find("input[name='type']").removeData("previousValue");
                                return obj.find("input[name='type']").val();
                            }
                        }
                    }
                },
                weight:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true,
                    remote:{
                        url:app.appOption.url+price.priceUrl+"isExistWeightAndVolume?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            weight:function () {
                                obj.find("input[name='weight']").removeData("previousValue");
                                return obj.find("input[name='weight']").val();
                            },
                            volume:function () {
                                obj.find("input[name='volume']").removeData("previousValue");
                                return obj.find("input[name='volume']").val();
                            }
                        }
                    }
                },
                weightUom:"required",
                volume:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true,
                    remote:{
                        url:app.appOption.url+price.priceUrl+"isExistWeightAndVolume?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            weight:function () {
                                obj.find("input[name='weight']").removeData("previousValue");
                                return obj.find("input[name='weight']").val();
                            },
                            volume:function () {
                                obj.find("input[name='volume']").removeData("previousValue");
                                return obj.find("input[name='volume']").val();
                            }
                        }
                    }
                },
                volumeUom:"required",
                vehicleTypeBasePrice:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                distancePriceGuide:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                weightPriceGuide:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                volumnPriceGuide:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                },
                dimensions:"required",
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
                },
                description:{
                    maxlength:100
                }
            },
            messages:{
                type:{
                    required:priceEditVue.message.validate.require,
                    remote:priceEditVue.message.validate.dupType
                },
                weight:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","weight"),
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    remote:priceEditVue.message.validate.dupWeightAndVolume
                },
                weightUom:priceEditVue.message.validate.require,
                volume:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","volume"),
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    remote:priceEditVue.message.validate.dupWeightAndVolume
                },
                volumeUom:priceEditVue.message.validate.require,
                vehicleTypeBasePrice:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","vehicle type base price")
                },
                distancePriceGuide:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","distance price guide")
                },
                weightPriceGuide:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","weight price guide")
                },
                volumnPriceGuide:{
                    required:priceEditVue.message.validate.require,
                    number:priceEditVue.message.validate.number,
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","volumn price guide")
                },
                dimensions:priceEditVue.message.validate.require,
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
                    bigZero:priceEditVue.message.validate.bigZero.replace("{0}","price per kg")
                },
                validDayOfWeek:{
                    required:priceEditVue.message.validate.require,
                    minlength:priceEditVue.message.validate.maxlength.replace("{0}","14")
                },
                description:{
                    maxlength:priceEditVue.message.validate.maxlength.replace("{0}","100")
                }
            },
            errorPlacement:function (error, element) {
                if(error[0].textContent === priceEditVue.message.validate.dupWeightAndVolume) {
                    element.closest(".valid-frame").addClass("duplicated");
                }
                element.closest(".valid-frame").addClass("has-error");
                element.closest(".valid-frame").removeClass("has-success");
                element.closest(".valid-frame").append(error);
            },
            success:function (label) {
                if(label.closest(".valid-frame").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                    label.remove();
                }
            }

        });
    }
};
window.price = price;
var priceEditVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        vehicleTypeInfo:{},
        priceInfo:{}
    }
});

jQuery.validator.addMethod("crossDayOfWeek", function (value, element,param) {
    for(var i=0;i<$("#price-table tbody tr").length;i++) {
        var rowData = priceTable.row($("tr")[i+1]).data();
        if(rowData && rowData.dayOfWeek && value == rowData.dayOfWeek && rowData.dayOfWeek != price.curEditDayOfWeek) {
            return false;
        }
    }
    return true;
}, priceEditVue.message.validate.dayOfWeekOverlap);
