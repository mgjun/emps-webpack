/**
 * 1.tcb.bidId存在表示更新，不存在新增
 * Created by MENGJUN on 2017/3/1.
 */
var transporterCreateTable;
$(document).ready(function () {
    tcb.bidId = app.appOption.getQueryParam("bidId");
    tcb.vehicleId = app.appOption.getQueryParam("vehicleId");
    transporterCreateTable = $("#transporter-create-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        paging:false,
        order:[ [ 1, 'asc' ]],
        ajax:function (data, callback, settings) {
        	data.columns[2].search.value = $("#vehicle-no-value").val();
            app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/viewVehicle?transporterBidId="+tcb.bidId;
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(!result) return;
                tcb.initVehicleData = app.appOption.deepCopy(result.data);
                callback(result);
                if(!result || !result.data || result.data.length == 0) {
                    app.appOption.alertify._init({
                        ok:tcbVue.message.button.yes,
                        cancel:tcbVue.message.button.no,
                        hideCancel:true,
                        confirmMsg:tcbVue.message.noVehicleInfo,
                        confirmFn:function (e) {
                            window.location.href = "./vehicleCreate.html?sspi="+app.appOption.getQueryParam("sspi");
                        }
                    });
                }
            },function (error) {
                console.log(error);
            });
        },
        columns:[
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    return '<input id="radio-'+row.id+'" name="radio" type="radio" class="checked-row-class minimal"/>';
                },
                sClass:"text-center"
            },
            {
                data:null,
                orderable:false,
                render:function (data, type, row, meta) {
                    return parseInt(meta.row) + 1;
                }
            },
            {
            	orderable:false,
                data:"no"
            },
            {
                orderable:false,
                data:"typeName"
            },
            {
                orderable:false,
                data:null,
            	render:function (data, type, row, meta) {
            		var str = '';
            		if(row.driverDto){
            			str = row.driverDto.firstName + ' ' + row.driverDto.lastName;
            		}
                    return str
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
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    return '<button id="edit_price_'+row.id+'" class="btn btn-app-primary hide editPrice" type="button" onclick="tcb.editPrice(\''+row.id+'\')">'+tcbVue.message.button.editPrice+'</button>';
                }
            }
        ],
        drawCallback:function () {
            tcb.initICheck();
            if(tcb.bidId) {
                if(tcb.bidId != -1) {
                    $(".iradio_square-blue").css("background-color","#eee").css("border-radius","11px");
                    $(".checked-row-class").attr("disabled",true);
                }
                tcb.loadBidInfo(tcb.bidId,function (result) {
                    var selectedVehicle = $("#radio-"+result.vehicleId);
                    var fromTimeObj = $("input[name='vehicleAvailabilityFrom']");
                    var toTimeObj = $("input[name='vehicleAvailabilityEnd']");
                    var formObj = fromTimeObj.closest("form");
                    selectedVehicle.iCheck("check");
                    if(tcb.isLaterThan(result.vehicleAvailabilityFrom)) {
                        fromTimeObj.datepicker("setDate",app.dateFormat(result.vehicleAvailabilityFrom));
                    }else {
                        fromTimeObj.val(app.dateFormat(result.vehicleAvailabilityFrom));
                    }
                    if(tcb.isLaterThan(result.vehicleAvailabilityEnd)) {
                        toTimeObj.datepicker("setDate",app.dateFormat(result.vehicleAvailabilityEnd));
                    }else {
                        toTimeObj.val(app.dateFormat(result.vehicleAvailabilityEnd));
                    }
                    tcb.formValidate(formObj).element(fromTimeObj);
                    tcb.formValidate(formObj).element(toTimeObj);
                });
            }
        }
    })).api();
    $("#vehicle-no-search").bind("click",function () {
    	transporterCreateTable.draw();
    });
    /**
     * bootstrap date plugin
     */
    $(".form_datetime").datepicker({
        format: "yyyy-mm-dd",
        todayHighlight:true,
        todayBtn:"linked",
        autoclose:true,
        startDate:new Date()
    }).bind("change",function () {
        tcb.formValidate($("#tcb-date-form")).element($(this));
        if($(this).attr("name") === "vehicleAvailabilityFrom") {
            var isLaterCurrent = new Date().getTime() <= new Date($(this).val().replace(/-/g,"/").trim()).getTime();
            //设置endtime大于fromtime
            $("input[name='vehicleAvailabilityEnd']").datepicker("setStartDate",isLaterCurrent ? $(this).val():new Date());
            tcb.formValidate($("#tcb-date-form")).element($("input[name='vehicleAvailabilityEnd']"));

        }
    });

    $("#create-bid-save").bind("click",function () {
        var validator = tcb.formValidate($("#tcb-date-form"));
        if(!validator.form()) return;
        var objArr = [];
        for(var i=0;i<tcb.tcbObjArr.length;i++) {
            var obj = {};
            obj.id = tcb.bidId;
            obj.vehicleId = tcb.tcbObjArr[i].id;
            obj.basePrice = tcb.tcbObjArr[i].basePrice;
            obj.distancePrice = tcb.tcbObjArr[i].distancePrice;
            obj.driverId = tcb.tcbObjArr[i].driverDto?tcb.tcbObjArr[i].driverDto.id:"";
            obj.vehicleAvailabilityFrom = $("input[name='vehicleAvailabilityFrom']").val();
            obj.vehicleAvailabilityEnd = $("input[name='vehicleAvailabilityEnd']").val();
            objArr.push(obj);
        }
        if(tcb.bidId == -1 || !tcb.bidId){
            app.appOption.ajax.url = app.appOption.url+tcb.tcbUrl+"createTransporterBid";
            app.appOption.ajax.type = "POST";
        }else if(tcb.bidId != -1 && tcb.bidId) {
            app.appOption.ajax.url = app.appOption.url+tcb.tcbUrl+"updateTransporterBid";
            app.appOption.ajax.type = "PUT";
        }
        app.appOption.ajax.data = JSON.stringify(objArr);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            var tem=[];
            tem=result.split(",");
            location.href = "transporterCreateBidAvailability.html?transporterBidId="+tem[0]+"&vehicleId="+tem[1]+"&vehicleTypeId="+tem[2]+"&from="+tem[3]+"&end="+tem[4]+"&vehicleName="+tem[5]+"&bidNo="+tem[6]+"&sspi="+app.appOption.getQueryParam("sspi");
        },function (error) {
            console.log(error)
        })
    });

    $("#edit-price-save").bind("click",function () {
        var formObj = $("#edit-price-form"),validator = tcb.formValidate(formObj),
            priceObj = formObj.serializeObject(),currentTr = $("#edit_price_"+tcb.currentRowId).closest("tr"),
            radio = $(currentTr.find("td")[0]).find("input[type='radio']"),
            hasChecked = radio.closest("div").hasClass("checked"),rowData = transporterCreateTable.row(currentTr).data();
        if(!validator.form()) return;
        rowData.distancePrice = priceObj.distancePrice;
        rowData.basePrice = priceObj.basePrice;
        var flag = -1;
        if(tcbVue.drivers) {
            for(var index in tcbVue.drivers) {
                if(priceObj.driverId == tcbVue.drivers[index].id) {
                    flag = index;
                    break;
                }
            }
        }
        if(flag === -1) {
            rowData.driverDto = null;
        }else {
            rowData.driverDto = tcbVue.drivers[flag];
        }
        transporterCreateTable.row(currentTr.closest("tr")).data(rowData);
        tcb.initICheck();
        if(hasChecked) {
            $(currentTr.find("td")[0]).find("input[type='radio']").iCheck("check");
        }
        $("#editVehiclePriceModal").modal("hide");
    });
    $("#edit-price-cancel").bind("click",function () {
        $("#editVehiclePriceModal").modal("hide");
    });
});

var tcb = {
    initVehicleData:null,
    bidInfo:{},
    bidId:null,//更新的bidId
    vehicleId:null,//更新的vehicleId
    tcbUrl:"v1/api/transporterBid/",
    vehicleUrl:"v1/api/vehicle/",
    tcbObjArr:[],
    currentRowId:null,
    loadAllDrivers:function (successFn) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/driver/findAllDriver";
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,successFn,function (error) {
            console.log(error);
        });
    },
    editPrice:function (rowId) {
        this.currentRowId = rowId;
        var rowData = transporterCreateTable.row($("#edit_price_"+rowId).closest("tr")).data();
        var formObj = $("#edit-price-form");
        formObj.find("input[name='basePrice']").val(rowData.basePrice);
        formObj.find("input[name='distancePrice']").val(rowData.distancePrice);
        this.loadAllDrivers(function (result) {
           tcbVue.drivers = result;
           if(rowData.driverDto) {
               tcbVue.currentDriverId = rowData.driverDto.id;
           }else {
               tcbVue.currentDriverId = '';
           }
        });
        $("#editVehiclePriceModal").modal("show");
    },
    loadBidInfo:function (bidId,success) {
        app.appOption.ajax.url = app.appOption.url + tcb.tcbUrl + "findById/"+bidId;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,success,function (error) {
            console.log(error);
        })
    },
    initICheck:function () {
        //iCheck for checkbox and radio inputs
        $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square-blue'
        });

        if(tcb.bidId) {
            if (tcb.bidId != -1) {
                $(".iradio_square-blue").css("background-color", "#eee").css("border-radius", "11px");
                $(".checked-row-class").attr("disabled", true);
            }
        }
        $(".checked-row-class").on("ifChecked",function () {
            tcb.tcbObjArr.push(transporterCreateTable.row($(this).closest("tr")).data());
            $(this).closest("tr").find("button.editPrice").removeClass("hide");
            $("#create-bid-save").attr("disabled",false);
        }).on("ifUnchecked",function () {
            var currentRowObj = $(this).closest("tr"),currentRowData = transporterCreateTable.row(currentRowObj).data();
            var index = tcb.tcbObjArr.indexOf(currentRowData);
            tcb.tcbObjArr.splice(index,1);
            var priceButton = $(this).closest("tr").find("button.editPrice");
            if(!priceButton.hasClass("hide")) priceButton.addClass("hide");

            // tcb.resetVehicle(currentRowData.id,function (result) {
            //     var vehicleInfo = result.vehicleDto?result.vehicleDto:{},driver = vehicleInfo ? vehicleInfo.driverDto : {};
            //     $(currentRowObj.find("td")[4]).text((driver?driver.firstName:"") + " " + (driver?driver.lastName:""));
            //     $(currentRowObj.find("td")[5]).text(app.appOption.formatOperation.priceDisplay(vehicleInfo.distancePrice));
            //     $(currentRowObj.find("td")[6]).text(app.appOption.formatOperation.priceDisplay(vehicleInfo.basePrice));
            // });

            if(tcb.tcbObjArr == null || tcb.tcbObjArr.length == 0) {
                $("#create-bid-save").attr("disabled",true);
            }
        });
    },
    resetVehicle:function (vehicleId,successFn) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/vehicle/findVehicleAndAvailabilityList/"+vehicleId;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,successFn,function (error) {
            console.log(error);
        })
    },
    isLaterThan:function (currentDateStr,thanDateObj) {
        if(!currentDateStr) return false;
        if(!thanDateObj) thanDateObj = new Date();
        var currentDate = new Date(currentDateStr.replace(/-/g,"/").trim());
        if(currentDate.getTime() >= thanDateObj.getTime()) return true;
        return false;
    },
    formValidate:function (obj) {
        return obj.validate({
            ignore:"",
            rules:{
                vehicleAvailabilityFrom:{
                    required:true,
                    laterDateThanCurrent:true
                },
                vehicleAvailabilityEnd:{
                    required:true,
                    laterDateThanCurrent:true,
                    laterDate:{
                         formObj:obj,
                         name:"vehicleAvailabilityFrom",
                         type:"input"
                    }
                },
                distancePrice:{
                    required:true,
                    number:true,
                    bigZero:true
                },
                basePrice:{
                    required:true,
                    number:true,
                    bigZero:true
                },
                // driverId:"required"
            },
            messages:{
                vehicleAvailabilityFrom:{
                    required:tcbVue.message.validate.require,
                    laterDateThanCurrent:tcbVue.message.validate.pLaterDateThanCurrent
                },
                vehicleAvailabilityEnd:{
                    required:tcbVue.message.validate.require,
                    laterDateThanCurrent:tcbVue.message.validate.pLaterDateThanCurrent,
                    laterDate:tcbVue.message.validate.transporterCreateLaterDate
                },
                distancePrice:{
                    required:tcbVue.message.validate.require,
                    number:tcbVue.message.validate.number,
                    bigZero:tcbVue.message.validate.bigZero.replace("{0}","distance price")
                },
                basePrice:{
                    required:tcbVue.message.validate.require,
                    number:tcbVue.message.validate.number,
                    bigZero:tcbVue.message.validate.bigZero.replace("{0}","base price")
                }
                // driverId:tcbVue.message.validate.require
            },
            errorPlacement:function (error, element) {
                element.closest(".valid-frame").addClass("has-error").removeClass("has-success").append(error);
            },
            success:function (label) {
                label.closest(".valid-frame").addClass("has-success").removeClass("has-error");
                label.remove();
            }
        });
    }
};

window.tcb = tcb;
var tcbVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        currentDriverId:null,
        drivers:[]
    },
    methods:{
        displayDriverName:function (driver) {
            if(!driver) return "";
            if(!driver.lastName) return driver.firstName;
            if(!driver.firstName) return driver.lastName;
            return driver.firstName + ' ' + driver.lastName;
        }
    }
});