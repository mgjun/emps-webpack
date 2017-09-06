/**
 * Created by MENGJUN on 2017/2/22.
 */
var avTable;
$(document).ready(function () {
    av.transporterBidId = app.appOption.getQueryParam("transporterBidId");
    avTable = $("#av-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
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
            app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/viewAvailability";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
            	$("#view1").empty();
            	$("#view1").append(avVue.message.transporterCreateBidTitleInfo
                                    .replace("{from}",app.appOption.getQueryParam("from"))
                                    .replace("{end}",app.appOption.getQueryParam("end"))
                                    .replace("{vehicleName}",app.appOption.getQueryParam("vehicleName")));
            	if(app.isEmpty(result)) {
            	    $("#av-table").find("tbody").append(avVue.message.noResultFound);
                }else {
                    callback(result);
                }
            },function (error) {
                console.log(error);
            })
        },
        columns:[
            {
                data:"dayOfWeek"
            },
            {
                data:"fromTime",
                render:function (data,type,row,meta) {
                    return app.timeFormat(row.fromTimeString);
                },
                "sClass":"text-center"
            },
            {
                data:"toTime",
                render:function (data,type,row,meta) {
                    return app.timeFormat(row.toTimeString);
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
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    return '<button id="edit-'+meta.row+'" onclick="av.update(\'edit-'+meta.row+'\',\''+meta.row+'\');" class="btn btn-app-primary">'+avVue.message.button.edit+'</button>' +
                            '<button onclick="av.delete('+row.id+');" class="btn btn-app-danger">'+avVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();
    $(".select2").select2().on("change",function () {
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
    });


    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    });
    $("#addAv").find("input[type='radio']").on('ifChecked',function () {
        // var flag = av.dayOfWeekExist($(this).val(),null);
        avVue.avInfo.dayOfWeek = $(this).val();
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
        // if(flag) {
        //     $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
        //         .append('<label class="error">dayOfWeek can not be same</label>');
        //     return;
        // }
        av.triggerTimeValidate($(this).closest("form"));
    });
    $("#editAv").find("input[type='radio']").on('ifChecked',function () {
        // var flag = av.dayOfWeekExist($(this).val(),av.curEditDayOfWeek);
        avVue.avInfo.dayOfWeek = $(this).val();
        $(this).closest(".valid-frame").removeClass("has-error");
        $(this).closest(".valid-frame").addClass("has-success");
        $(this).closest(".valid-frame").find("label.error").remove();
        // if(flag) {
        //     $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
        //         .append('<label class="error">dayOfWeek can not be same</label>');
        //     return;
        // }
        av.triggerTimeValidate($(this).closest("form"));
    });

    // $(".form_time").timepicker({
    //     minuteStep: 5,
    //     showSeconds: false,
    //     showMeridian: false,
    //     showInputs: true,
    //     defaultTime:"current"
    // }).bind("change",function () {
    //     $(this).closest("div").find("label.error").remove();
    //     $(this).closest("div").addClass("has-success").removeClass("has-error");
    //
    //     var fromTime = $(this).closest("form").find("input[name='fromTime']").val();
    //     var toTime = $(this).closest("form").find("input[name='toTime']").val();
    //     var arr = avTable.rows().data();
    //     if(!av.validateCrossTime(fromTime,toTime,arr)) {
    //         $(this).closest(".valid-frame").addClass("has-error").removeClass("has-success")
    //             .append('<label class="error">availability overlap!</label>');
    //     }
    // });

    // $(".form_time").inputmask("hh:mm",{
    //     "placeholder":"hh:mm",
    //     "oncomplete":function () {
    //         av.triggerTimeValidate($(this).closest("form"));
    //     }
    // });
    $("#create-fromTime").TimeWindow({
        deleteElements:2
    }).on("change",function () {
        var _value = $(this).val();
        var startDate = new Date("1970/01/01 "+_value);
        var timeArr = _value.split(":");
        $("#create-toTime").val(((startDate.getHours()+1)<10)?("0"+(startDate.getHours()+1))+":"+timeArr[1] : (startDate.getHours()+1)+":"+timeArr[1]);

        av.formValidate($(this).closest("form")).element($("#create-toTime"))
    });
    $("#create-toTime").TimeWindow({defaultValue:"23:30"});


    $("#edit-fromTime").TimeWindow({
        deleteElements:2
    }).on("change",function () {
        var _value = $(this).val();
        var startDate = new Date("1970/01/01 "+_value);
        if(_value){
            var timeArr = _value.split(":");
            $("#edit-toTime").val(((startDate.getHours()+1)<10)?("0"+(startDate.getHours()+1))+":"+timeArr[1] : (startDate.getHours()+1)+":"+timeArr[1]);
        }

        av.formValidate($(this).closest("form")).element($("#edit-toTime"))
    });
    $("#edit-toTime").TimeWindow({defaultValue:"23:30"});
    
    $("#av-create-save").bind("click",function () {
        var validator = av.formValidate($("#av-create-form"));
        if(!validator.form()) {
            return;
        }
        avVue.avInfo = $("#av-create-form").serializeObject();
        var zonesTemp = avVue.avInfo.zonesTemp;
        if(!app.isEmpty(zonesTemp) && !(zonesTemp instanceof Array)) {
            avVue.avInfo.zonesTemp = [];
            avVue.avInfo.zonesTemp.push(zonesTemp);
        }
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/createAvailability/"+app.appOption.getQueryParam("transporterBidId")+"/"+app.appOption.getQueryParam("vehicleId");
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = JSON.stringify(avVue.avInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addAv").modal("hide");
            avTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    $("#av-edit-save").bind("click",function () {
        var validator = av.formValidate($("#av-edit-form"));
        if(!validator.form()) {
            return;
        }
        avVue.avInfo = $("#av-edit-form").serializeObject();
        var zonesTemp = avVue.avInfo.zonesTemp;
        if(!app.isEmpty(zonesTemp) && !(zonesTemp instanceof Array)) {
            avVue.avInfo.zonesTemp = [];
            avVue.avInfo.zonesTemp.push(zonesTemp);
        }
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/updateAvailability/"+app.appOption.getQueryParam("transporterBidId")+"/"+app.appOption.getQueryParam("vehicleId");;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(avVue.avInfo);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editAv").modal("hide");
            avTable.draw();
        },function (error) {
            console.log(error);
        })
    });

    $("#av-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/deleteAvailability/"+av.id;
        app.appOption.ajax.type = "DELETE";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteAv").modal("hide");
            avTable.draw();
        },function (error) {
            console.log(error);
        })
    });
    av.loadAllZones();
});

var av = {
    url:"v1/api/transporterCreateBidAvailability/",
    transporterBidId:null,
    clickButtonId:null,
    curEditDayOfWeek:null,
    editAvInfo:{},
    editRowIndex:-1,
    id:null,
    isCrossTime:false,
    backToBid: function() {
        window.location.href = "transporterCreateBid.html?bidId="+av.transporterBidId+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    triggerTimeValidate:function(formObj) {
        if(formObj.find("select[name='fromTime']").val()) {
            av.formValidate(formObj).element(formObj.find("select[name='fromTime']"));
        }
        if(formObj.find("select[name='toTime']").val())
            av.formValidate(formObj).element(formObj.find("select[name='toTime']"));
    },
    create:function () {
        this.editAvInfo = {};
        this.editRowIndex = -1;
        $("#av-create-form").resetValue().resetValidation();
        $("#addAv").find("input[type='radio']").iCheck("uncheck");
        $("#av-create-form").find(".select2").val("Select").trigger("change");
        $("#create-vehicleId").val(app.appOption.getQueryParam("vehicleId"));
        $("#addAv").modal("show");
    },
    update:function (btnId,rowIndex) {
        $("#av-edit-form").resetValidation();
        this.clickButtonId = btnId;
        this.editRowIndex = rowIndex;
        var rowData = avTable.row($("#"+btnId).closest("tr")).data();
        //format time
        rowData.fromTime = app.timeFormat(rowData.fromTimeString);
        rowData.toTime = app.timeFormat(rowData.toTimeString);

        this.editAvInfo = rowData;
        this.curEditDayOfWeek = rowData.dayOfWeek;
        avVue.avInfo = app.appOption.deepCopy(rowData);
        $("#edit-vehicleId").val(app.appOption.getQueryParam("vehicleId"));
        $("#editAv").find("input[value="+avVue.avInfo.dayOfWeek+"]").iCheck("check");
        $("#edit-availability-zones").val(rowData.zonesTemp).trigger("change");
        $("#editAv").modal("show");
    },
    delete:function (id) {
        this.id = id;
        // $("#deleteAv").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/deleteAvailability/"+av.id;
                app.appOption.ajax.type = "DELETE";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteAv").modal("hide");
                    avTable.draw();
                },function (error) {
                    console.log(error);
                })
            }
        })
    },
    dayOfWeekExist:function (value,currentEditValue) {
        for(var i=0;i<$("#av-table tbody tr").length;i++) {
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
    //                 continue;
    //             }
    //             if(fromTime >= arr[index].fromTime && fromTime <= arr[index].toTime) {
    //                 return false;
    //             }else if(toTime && toTime >= arr[index].fromTime && toTime <= arr[index].toTime){
    //                 return false;
    //             }else{
    //                 if(fromTime <= arr[index].fromTime) {
    //                     if(toTime && toTime > arr[index].toTime) {
    //                         return false;
    //                     }
    //                 }else if(fromTime >= arr[index].toTime) {
    //                     if(toTime && toTime < arr[index].fromTime) {
    //                         return false;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return true;
    // },
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
    formValidate:function (formObj) {
        return formObj.validate({
            rules:{
               fromTime:{
                   required:true,
                   // earlyThan:{
                   //     formObj:formObj,
                   //     name:"toTime",
                   //     type:"input"
                   // },
                   crossTime:{
                       formObj:formObj,
                       otherValue:"toTime"
                   }
               },
               toTime:{
                   required:true,
                   laterThan:{
                       formObj:formObj,
                       name:"fromTime",
                       type:"select"
                   },
                   crossTime:{
                       formObj:formObj,
                       otherValue:"fromTime"
                   }
               },
               // zoneFlag:"required",
                zonesTemp:{
                   required:function() {
                       return formObj.find("select[name='zoneFlag']").val() == "allowed";
                   }
                },
               dayOfWeek:"required"
            },
            messages:{
                fromTime:{
                    required:avVue.message.validate.require,
                    // earlyThan:"fromTime must early than toTime",
                    crossTime:avVue.message.validate.availabilityOverlap
                },
                toTime:{
                    required:avVue.message.validate.require,
                    laterThan:avVue.message.validate.availabilityLaterThan,
                    crossTime:avVue.message.validate.availabilityOverlap
                },
                // zoneFlag:avVue.message.validate.require,
                zonesTemp:avVue.message.validate.require,
                dayOfWeek:avVue.message.validate.require
            },
            errorPlacement:function (error, element) {
                if(error[0].textContent === avVue.message.validate.availabilityOverlap) {
                    element.closest(".valid-frame").addClass("crossTime");
                }
                element.closest(".valid-frame").addClass("has-error").removeClass("has-success");
                element.closest(".valid-frame").append(error);
            },
            success:function (label) {
                if(label.closest(".valid-frame").hasClass("crossTime")) {
                    var _label = label.closest("form").find(".crossTime").find("label.error");
                    _label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.closest(".valid-frame").removeClass("has-error").addClass("has-success");
                    label.remove();
                }
            }
        });
    }
};

window.av = av;
var avVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        zones:null,
        avInfo:{},
        vehicleId:null
    }
});

//validate phone
jQuery.validator.addMethod("crossTime", function (value, element,param) {
    var otherValue = param.formObj.find("select[name='"+param.otherValue+"']").val();
    var arr = avTable.rows().data(),valueFormat = app.timeFormat(value),otherValueFormat = app.timeFormat(otherValue),
        viewFrom = app.timeFormat(av.editAvInfo.fromTime),viewEnd = app.timeFormat(av.editAvInfo.toTime);
    for(var index in arr) {
        if(arr[index].dayOfWeek === avVue.avInfo.dayOfWeek) {
            var tempFrom = app.timeFormat(arr[index].fromTimeString),tempEnd = app.timeFormat(arr[index].toTimeString);
            // if(viewFrom === tempFrom && viewEnd === tempEnd){
            //     continue;
            // }
            if(av.editRowIndex !== -1 && av.editRowIndex === index) {
                continue;
            }
            if(valueFormat > tempFrom && valueFormat < tempEnd) {
                return false;
            }else if(otherValue && valueFormat <= tempFrom && otherValueFormat > tempFrom) {
                return false;
            }else if(otherValue && valueFormat >= tempEnd && otherValueFormat < tempEnd) {
                return false;
            }
        }
    }
    return true;
}, "availability overlap!");