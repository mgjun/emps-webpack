/**
 * Created by MENGJUN on 2017/2/14.
 */
var avTable;
$(document).ready( function () {
	avTable = $("#availability-table").dataTable({
		"info":false,
		"searching":false,
		"paging":false,
		"bLengthChange":false,
        language:{
            //     lengthMenu: "_MENU_",
            emptyTable:avVue.message.table.emptyTable,
            zeroRecords:avVue.message.table.zeroRecords,
            paginate: {
                "first":avVue.message.table.first,
                "last":avVue.message.table.last,
                "next":avVue.message.table.next,
                "previous":avVue.message.table.previous
            }
        },
		"columns":[
			{
				"data":"dayOfWeek"
			},
			{
				"data":"fromTime",
				render:function (data,type,row,meta) {
                  return app.timeFormat(row.fromTime);
                },
				"sClass":"text-center"
			},
			{
				"data":"toTime",
                render:function (data,type,row,meta) {
                    return app.timeFormat(row.toTime);
                },
                "sClass":"text-center"
			},
            {
                orderable:false,
                data:"zoneFlag"
            },
            {
                data:"zonesName",
				orderable:false,
				render:function (data, type, row, meta) {
                	if(!row.zonesName) return "";
                	var str = "";
					for(var index in row.zonesName) {
						str += '<div style="border: 1px solid #ccc;">'+row.zonesName[index]+'</div>';
					}
					return str;
                }
            },
			{
				"data":null,
				"orderable":false,
				"searchable":false,
				"render":function (data,type, row, meta) {
					return '<button id="edit-'+meta.row+'" onclick="vehicle.update(\'edit-'+meta.row+'\',\''+meta.row+'\')" class="btn btn-sm btn-app-primary price-show-edit">'+avVue.message.button.edit+'</button>'+
						'<button id="delete-'+meta.row+'" onclick="vehicle.delete(\'delete-'+meta.row+'\')" class="btn btn-sm btn-app-danger price-show-delete">'+avVue.message.button.delete+'</button>';
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

    $(".select2").select2().on("change",function () {
    	var _selectedData = $(this).select2('data');
        vehicle.zonesName = [];
        vehicle.zonesTemp = [];
    	for(var index in _selectedData) {
            vehicle.zonesName.push(_selectedData[index].text);
            vehicle.zonesTemp.push(_selectedData[index].id);
		}
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
    });

    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    });
    $("#addAv").find("input[type='radio']").on('ifChecked',function () {
        // var flag = vehicle.dayOfWeekExist($(this).val(),null);
        avVue.avInfo.dayOfWeek = $(this).val();
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
        // if(flag) {
        //     $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
        //         .append('<label class="error">dayOfWeek can not be same</label>');
			// return;
        // }
        vehicle.triggerTimeValidate($(this).closest("form"));
    });

    $("#editAv").find("input[type='radio']").on('ifChecked',function () {
        // var flag = vehicle.dayOfWeekExist($(this).val(),vehicle.curEditDayOfWeek);
        avVue.avInfo.dayOfWeek = $(this).val();
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
        // if(flag) {
        //     $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
        //         .append('<label class="error">dayOfWeek can not be same</label>');
        //     return;
        // }
        vehicle.triggerTimeValidate($(this).closest("form"));
    });


    /*$(".form_time").timepicker({
		minuteStep: 5,
		showSeconds: false,
		showMeridian: false,
		showInputs: true,
		defaultTime:"current"
	}).bind("change",function () {
        $(this).closest("div").removeClass("has-error");
        $(this).closest("div").addClass("has-success");
        $(this).closest("div").find("label.error").remove();

        var fromTime = $(this).closest("form").find("input[name='fromTime']").val();
        var toTime = $(this).closest("form").find("input[name='toTime']").val();
        var arr = avTable.rows().data();
        if(!vehicle.validateCrossTime(fromTime,toTime,arr)) {
            $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
                .append('<label class="error">availability overlap!</label>');
        }

	});*/

    // $(".form_time").inputmask("hh:mm",{
    //     "placeholder":"hh:mm",
    //     "oncomplete":function () {
    //         vehicle.triggerTimeValidate($(this).closest("form"));
    //     }
    // });

    $("#create-fromTime").TimeWindow({
        deleteElements:2
    }).on("change",function () {
        var _value = $(this).val();
        var startDate = new Date("1970/01/01 "+_value);
        var timeArr = _value.split(":");
        $("#create-toTime").val(((startDate.getHours()+1)<10)?("0"+(startDate.getHours()+1))+":"+timeArr[1] : (startDate.getHours()+1)+":"+timeArr[1]);

        vehicle.formValidate($(this).closest("form")).element($("#create-toTime"))
    });
    $("#create-toTime").TimeWindow({defaultValue:"23:30"});


    $("#edit-fromTime").TimeWindow({
        deleteElements:2
    }).on("change",function () {
        var _value = $(this).val();
        var startDate = new Date("1970/01/01 "+_value);
        if(_value) {
            var timeArr = _value.split(":");
            $("#edit-toTime").val(((startDate.getHours()+1)<10)?("0"+(startDate.getHours()+1))+":"+timeArr[1] : (startDate.getHours()+1)+":"+timeArr[1]);
        }

        vehicle.formValidate($(this).closest("form")).element($("#edit-toTime"))
    });
    $("#edit-toTime").TimeWindow({defaultValue:"23:30"});

	//save create vehicleType
	$("#vehicle-create-save").bind("click",function () {
		var validator = vehicle.formValidate($("#vehicle-create-form"));
		if(!validator.form()) {
			return;
		}
		var vehicleData = $("#vehicle-create-form").serializeObject();
		var avArr = [];
		for(var i=0;avTable.data() && i<avTable.data().length;i++) {
            var avItem = avTable.data()[i];
            if(avItem.zones instanceof Array) {
                avItem.zones = avItem.zones.join(",");
            }
			avArr.push(avItem);
		}
		vehicleData.availability = avArr;
		if(app.appOption.getQueryParam("vehicleId")) {
            app.appOption.ajax.url=app.appOption.url+vehicle.url+"updateVehicle";
            app.appOption.ajax.type="put";
		}else {
            app.appOption.ajax.url=app.appOption.url+vehicle.url+"createVehicle";
            app.appOption.ajax.type="post";
        }
		app.appOption.ajax.data=JSON.stringify(vehicleData);
		app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
			// window.location.href='./vehicleView.html?sspi='+app.appOption.getQueryParam("sspi");
            app.appOption.alertify._init({
                ok:avVue.message.button.yes,
                cancel:avVue.message.button.no,
                hideCancel:true,
                confirmMsg:avVue.message.vehicleCreateSuccessInfo.replace("{vehicleNo}",result.no),
                confirmFn:function (e) {
                    window.history.go(-1);
                }
            });
		},function (error) {
			console.log(error);
		});

	});

	//save create price
	$("#av-create-save").bind("click",function () {
		var validator = vehicle.formValidate($("#av-create-form"));
		if(!validator.form()) {
			return;
		}
		var newRowArr = [];
		var formData = $("#av-create-form").serializeObject();
		formData.zonesName = vehicle.zonesName;
		formData.zonesTemp = vehicle.zonesTemp;
		newRowArr.push(formData);
		avTable.rows.add(newRowArr).draw();
		if(avTable.data().length > 0) {
			$("#vehicle-create-save").attr("disabled",false);
		}
        $("#addAv").modal("hide");
	});


	//edit price
	$("#av-edit-save").bind("click",function () {
		var validator = vehicle.formValidate($("#av-edit-form"));
		if(!validator.form()) {
			return;
		}
        avVue.avInfo.zonesName = vehicle.zonesName;
        avVue.avInfo.zonesTemp = vehicle.zonesTemp;
		avTable.row($("#"+vehicle.clickButtonId).closest("tr")).data(avVue.avInfo).draw();
        $("#editAv").modal("hide");
	});

	//delete price
	$("#av-delete-save").bind("click",function () {
		avTable.row($("#"+vehicle.clickButtonId).parents('tr')).remove().draw();
		if(avTable.data().length <= 0) {
			$("#vehicle-create-save").attr("disabled","disabled");
		}
		$("#deleteAv").modal("hide");
	});

	//load all vehicleTypes
	vehicle.loadAllTypes();
	vehicle.loadAllDrivers(function (result) {
        avVue.drivers = result;
    });
	vehicle.loadAllZones();
	vehicle.findById(app.appOption.getQueryParam("vehicleId"));

});

var vehicle = {
	url:"v1/api/vehicle/",
	typeUrl:"v1/api/vehicleType/",
	driverUrl:"v1/api/driver/",
	clickButtonId:null,
	curEditDayOfWeek:null,
	zonesName:[],
    zonesAddress:[],
	zonesTemp:[],
	editAvInfo:{},
	editRowIndex:-1,
	isCrossTime:false,
	triggerTimeValidate:function (formObj) {
        if(formObj.find("select[name='fromTime']").val()) {
            vehicle.formValidate(formObj).element(formObj.find("select[name='fromTime']"));
        }
        if(formObj.find("select[name='toTime']").val())
            vehicle.formValidate(formObj).element(formObj.find("select[name='toTime']"));
    },
	create:function () {
        this.editAvInfo = {};
        this.editRowIndex = -1;
		$("#av-create-form").resetValue().resetValidation();
        $("#av-create-form").find("select[name='zonesTemp']").val("Select").trigger("change");
		$("#addAv").modal("show");
	},
	update:function (btnId,rowIndex) {
		$("#av-edit-form").resetValidation();
		this.rowIndex = rowIndex;
		this.clickButtonId = btnId;
		var rowData = avTable.row($("#"+btnId).closest("tr")).data();
        //format time
        rowData.fromTime = app.timeFormat(rowData.fromTime);
        rowData.toTime = app.timeFormat(rowData.toTime);

		this.editAvInfo = rowData;
        this.curEditDayOfWeek = rowData.dayOfWeek;
        avVue.avInfo = app.appOption.deepCopy(rowData);
        $("#editAv").find("input[value="+avVue.avInfo.dayOfWeek+"]").iCheck("check");
        $("#editAv").find("select[name='zonesTemp']").val(rowData.zonesTemp).trigger("change");
		$("#editAv").modal("show");
	},
	delete:function (btnId) {
		this.clickButtonId = btnId;
		// $("#deleteAv").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                avTable.row($("#"+vehicle.clickButtonId).parents('tr')).remove().draw();
                if(avTable.data().length <= 0) {
                    $("#vehicle-create-save").attr("disabled","disabled");
                }
            }
        })
	},
	dayOfWeekExist:function (value,currentEditValue) {
		for(var i=0;i<$("#availability-table tbody tr").length;i++) {
			var rowData = avTable.row($("tr")[i+1]).data();
            if(rowData && rowData.dayOfWeek && value == rowData.dayOfWeek && rowData.dayOfWeek != currentEditValue) {
                return true;
            }
		}
		return false;
    },
    // validateCrossTime:function (fromTime,toTime,arr) {
    //     for(var index in arr) {
    //         if(arr[index].dayOfWeek == avVue.avInfo.dayOfWeek) {
    //             if(this.editAvInfo.fromTime == arr[index].fromTime && this.editAvInfo.toTime == arr[index].toTime){
    //             	continue;
		// 		}
    //         	if(fromTime >= arr[index].fromTime && fromTime <= arr[index].toTime) {
    //                 return false;
    //             }else if(toTime && toTime >= arr[index].fromTime && toTime <= arr[index].toTime){
    //                 return false;
		// 		}else{
    //         		if(fromTime <= arr[index].fromTime) {
    //         			if(toTime && toTime > arr[index].toTime) {
    //         				return false;
		// 				}
		// 			}else if(fromTime >= arr[index].toTime) {
    //         			if(toTime && toTime < arr[index].fromTime) {
    //         				return false;
		// 				}
		// 			}
		// 		}
    //         }
    //     }
    //     return true;
    // },
	loadAllTypes:function () {
		app.appOption.ajax.url = app.appOption.url+vehicle.typeUrl+"findAllVehicleType";
		app.appOption.ajax.type = "POST";
		app.appOption.ajax.data = null;
		app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
			avVue.types = result;
		},function (error) {
			console.log(error);
		});
	},
	loadAllDrivers:function (successFn) {
		app.appOption.ajax.url = app.appOption.url+vehicle.driverUrl+"findAllDriver";
		app.appOption.ajax.type = "POST";
		app.appOption.ajax.data = null;
		app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,successFn,function (error) {
			console.log(error);
		});
	},
    loadAllZones:function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/bidJob/findAllZones";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            avVue.zones = result;
        },function (error) {
            console.log(error);
        })
    },
	findById:function (id) {
		if(!id) return;
        app.appOption.ajax.url = app.appOption.url+vehicle.url+"findVehicleAndAvailabilityList/"+id;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            avVue.vehicleInfo = result.vehicleDto;
			if(result.availabilityList) {
                avTable.rows.add(result.availabilityList).draw();
			}
			if(avTable.data().length > 0) {
                $("#vehicle-create-save").attr("disabled",false);
			}

            vehicle.loadAllDrivers(function (driverInfo) {
                var flag = false;
                avVue.drivers = driverInfo;
                for(var index in avVue.drivers) {
                    if(avVue.vehicleInfo.driverId === avVue.drivers[index].id) {
                        flag = true
                    }
                }
                if(!flag) {
                    avVue.vehicleInfo.driverId = '';
                }
            });
        },function (error) {
            console.log(error);
        })
    },
	formValidate:function (obj) {
        return obj.validate({
            rules: {
                no: {
                	required:true,
                    // vehicleNameValidate:locale === "en",
                    remote:{
                        url:app.appOption.url+vehicle.url+"isExistVehicle?sspi="+ app.appOption.getQueryParam("sspi"),
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
                            no:function() {
                                obj.find("input[name='no']").removeData("previousValue");
                                return obj.find("input[name='no']").val();
                            },
                            companyId:function() {
                                obj.find("input[name='companyId']").removeData("previousValue");
                                return obj.find("input[name='companyId']").val();
                            }
                        }
                    }
				},
                typeId: "required",
                fromTime:{
                    required:true,
                    crossTime:{
                        formObj:obj,
                        otherValue:"toTime"
                    }
                },
                toTime:{
                    required:true,
                    laterThan:{
                        formObj:obj,
                        name:"fromTime",
                        type:"select"
                    },
                    crossTime:{
                        formObj:obj,
                        otherValue:"fromTime"
                    }
                },
                // zoneFlag: "required",
                zonesTemp:{
                    required:function() {
                        return obj.find("select[name='zoneFlag']").val() == "allowed";
                    }
                },
                dayOfWeek: {
                    required: true,
                    minlength: 1
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
                driverId:{
                    required:true
                }
            },
            messages: {
                no: {
                	required:avVue.message.validate.require,
                    vehicleNameValidate:avVue.message.validate.vehicleNameValidate,
					remote:avVue.message.validate.dupVehicleNo
				},
                typeId: avVue.message.validate.require,
                fromTime:{
                    required:avVue.message.validate.require,
                    crossTime:avVue.message.validate.availabilityOverlap
                },
                toTime:{
                    required:avVue.message.validate.require,
                    laterThan:avVue.message.validate.availabilityLaterThan,
                    crossTime:avVue.message.validate.availabilityOverlap
                },
                // zoneFlag: avVue.message.validate.require,
                zonesTemp: avVue.message.validate.require,
                dayOfWeek: {
                    required: avVue.message.validate.require,
                    minlength: avVue.message.validate.require
                },
                distancePrice:{
                    required:avVue.message.validate.require,
                    number:avVue.message.validate.number,
                    bigZero:avVue.message.validate.bigZero.replace("{0}","distance price")
                },
                basePrice:{
                    required:avVue.message.validate.require,
                    number:avVue.message.validate.number,
                    bigZero:avVue.message.validate.bigZero.replace("{0}","base price")
                },
                driverId:{
                    required:avVue.message.validate.require
                }
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === avVue.message.validate.availabilityOverlap) {
                    element.closest(".valid-frame").addClass("crossTime");
                }
                element.closest(".valid-frame").addClass("has-error").removeClass("has-success");
                element.closest(".valid-frame").append(error);
            },
            success: function (label) {
                if(label.closest(".valid-frame").hasClass("crossTime")) {
                    var _label = label.closest("form").find(".crossTime").find("label.error");
                    _label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};

window.vehicle = vehicle;
var avVue = new Vue({
    i18n:commonMsg.i18n,
	el:".content",
	data:{
        message:commonMsg.messages,
        avInfo:{
            zonesTemp:[]
        },
		zones:[],
        types:[],
        drivers:[],
        vehicleInfo:{}
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

//validate phone
jQuery.validator.addMethod("crossTime", function (value, element,param) {
    var otherValue = param.formObj.find("select[name='"+param.otherValue+"']").val();
    var arr = avTable.rows().data(),valueFormat = app.timeFormat(value),otherValueFormat = app.timeFormat(otherValue);
    for(var index in arr) {
        if(arr[index].dayOfWeek === avVue.avInfo.dayOfWeek) {
            var compareFromFormat = app.timeFormat(arr[index].fromTime),compareToFormat = app.timeFormat(arr[index].toTime);
            if(vehicle.rowIndex !== -1 && vehicle.rowIndex === index) {
                continue;
            }
            if(valueFormat > compareFromFormat && valueFormat < compareToFormat) {
                return false;
            }else if(otherValue && valueFormat <= compareFromFormat && otherValueFormat > compareFromFormat) {
                return false;
            }else if(otherValue && valueFormat >= compareToFormat && otherValueFormat < compareToFormat) {
                return false;
            }
        }
    }
    return true;
}, avVue.message.validate.availabilityOverlap);

