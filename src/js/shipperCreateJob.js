/**
 * 1.shipperCreateVue.bidVersion 表示创建/修改的job属于某个bid
 * 2.shipperCreateVue.bidId 不为空表示bid的更新，否则这个job属于的bid为创建
 * 3.shipperCreateVue.jobId 不为空表示job的更新，否则表示job的创建
 * Created by MENGJUN on 2017/2/16.
 */

$(document).ready(function () {
    shipperCreateVue.bidVersion = app.appOption.getQueryParam("bv");
    shipperCreateVue.bidId = app.appOption.getQueryParam("bidId");
    shipperCreateVue.jobId = app.appOption.getQueryParam("jobId");

    $(".ul-width").css("width",$(".ul-width").closest(".input-group").width());

    $("#additional-services").bind("click",function () {
        $("#additional-popover").css("top",$(this).offset().top + $(this).outerHeight())
                                .css("left",$(this).offset().left);
        $("#additional-popover").toggleClass("hide");
    });

    $(document).click(function(e){
        //if click out of popup or transporterDate element,hide all popup
        if(!$(e.target).hasClass("showDetail") && $(e.target).closest(".pop-item").length === 0) {
            $(".pop-item").addClass("hide");
        }

    });
    $(".pop-item .close-button").bind("click",function () {
        $(this).closest(".pop-item").addClass("hide");
        $(this).closest(".parent-detail").find("i.fa").addClass("fa-plus").removeClass("fa-minus");
    });

    //iCheck for checkbox and radio inputs
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).bind("ifChecked",function () {
        $(this).closest(".valid-frame").find("label.error").remove();
        $(this).closest(".valid-frame").addClass("has-success").removeClass("has-error");
    });

    /**
     * init popover
     */
    $("[data-toggle='tooltip']").tooltip();


    /**
     * bootstrap date plugin
     */
    $(".form_datetime").datepicker({
        format: "dd-mm-yyyy",
        todayHighlight:true,
        todayBtn:"linked",
        autoclose:true,
        showOnFocus:true,
        startDate:new Date()
    }).bind("change",function () {
        $(this).closest(".valid-frame").find("label.error").remove();
        $(this).closest(".valid-frame").addClass("has-success").removeClass("has-error");

        var formObj = $("#shipper-createJob-form");
        var validator = shipperCreate.formValidate(formObj);
        var value = $(this).val(),date = new Date(),
        $pfromTime = formObj.find("select[name='pickupFromTime']").val(),
        shouldChange = $pfromTime < ((date.getHours()+3) + ":" + date.getMinutes()),
        isCurrentDate = value && value.split("-")
                            && parseInt(value.split("-")[0]) == date.getDate()
                            && parseInt(value.split("-")[1]) == (date.getMonth() + 1)
                            && parseInt(value.split("-")[2]) == date.getFullYear();
        if(shouldChange && isCurrentDate) {
            formObj.find("select[name='pickupFromTime']").val((date.getMinutes() < 30 ? (date.getHours()+3)+":" + "30" :  (date.getHours()+4) +":"+ "00"));
            formObj.find("select[name='pickupEndTime']").val((date.getMinutes() < 30 ? (date.getHours()+4)+":" + "30" :  (date.getHours()+5) +":"+ "00"));
            formObj.find("select[name='dropoffFromTime']").val((date.getMinutes() < 30 ? (date.getHours()+5)+":" + "30" :  (date.getHours()+6) +":"+ "00"));
            formObj.find("select[name='dropoffEndTime']").val((date.getMinutes() < 30 ? (date.getHours()+6)+":" + "30" :  (date.getHours()+7) +":"+ "00"));
        }

        if($(this).val()) {
            validator.element(formObj.find("input[name='transporterDate']"));
        }

        if(formObj.find("select[name='pickupFromTime']").val()) {
            validator.element(formObj.find("select[name='pickupFromTime']"));
            validator.element(formObj.find("select[name='pickupEndTime']"));
            validator.element(formObj.find("select[name='dropoffFromTime']"));
            validator.element(formObj.find("select[name='dropoffEndTime']"));
        }

        shipperCreateVue.transportDate = $(this).val();
        // validator.element(formObj.find("select[name='pickupFromTime']"));
    });
    shipperCreate.findSystemSettinByKey();


    /**
     * bootstrap time plugin
     */
    // $(".form_time").timepicker({
    //     minuteStep: 5,
    //     showSeconds: false,
    //     showMeridian: false,
    //     showInputs: true,
    //     defaultTime:"current"
    // }).on("change",function () {
    //     var formObj = $("#shipper-createJob-form");
    //     var validator = shipperCreate.formValidate(formObj);
    //     validator.element($(this));
    // });

    // $(".form_time").inputmask("hh:mm", {"placeholder": "hh:mm"});
    // // $("#pickUpAddress,#dropOffAddress").inputmask("9",{"repeat":6});
    // $(".form_time").on('focus',function () {
    //     var formObj = $("#shipper-createJob-form");
    //     var validator = shipperCreate.formValidate(formObj);
    //     var _valid = validator.element(formObj.find("input[name='transporterDate']"));
    // }).on("change",function () {
    //     var formObj = $("#shipper-createJob-form");
    //     var validator = shipperCreate.formValidate(formObj);
    //     if(formObj.find("input[name='pickupFromTime']").val()) {
    //         validator.element(formObj.find("input[name='pickupFromTime']"));
    //     }
    //     if(formObj.find("input[name='pickupEndTime']").val()) {
    //         validator.element(formObj.find("input[name='pickupEndTime']"));
    //     }
    //     if(formObj.find("input[name='dropoffFromTime']").val()) {
    //         validator.element(formObj.find("input[name='dropoffFromTime']"));
    //     }
    //     if(formObj.find("input[name='dropoffEndTime']").val()) {
    //         validator.element(formObj.find("input[name='dropoffEndTime']"));
    //     }
    // });


    // $("input[name='transporterDate']").bind("change",function () {
    //     $(this).closest(".valid-frame").find("label.error").remove();
    //     $(this).closest(".valid-frame").addClass("has-success").removeClass("has-error");
    //     //if data have changed,trigger time validate again
    //     var formObj = $("#shipper-createJob-form");
    //     var validator = shipperCreate.formValidate(formObj);
    //     validator.element(formObj.find("input[name='transporterDate']"));
    //     if(formObj.find("input[name='pickupFromTime']").val()) {
    //         validator.element(formObj.find("input[name='pickupFromTime']"));
    //         validator.element(formObj.find("input[name='pickupEndTime']"));
    //         validator.element(formObj.find("input[name='dropoffFromTime']"));
    //         validator.element(formObj.find("input[name='dropoffEndTime']"));
    //     }
    // });

    /**
     * select2 plugin
     */
    $(".select2").select2().bind("change",function () {
        $(this).closest(".valid-frame").find("label.error").remove();
        $(this).closest(".valid-frame").addClass("has-success").removeClass("has-error");
    });
    /**
     * bootstrap file input plugin for image upload
     */
    app.appOption.fileInput.init($("#jobImages"),{
        uploadUrl:shipperCreate.detemineUrl(),
        uploadExtraData:function() {
            var formData = $("#shipper-createJob-form").serializeObject();
            var ids = [];
            var sellingPrices = [];
            var costPrices = [];
            if(shipperCreateVue.selectedAddtionalSettings) {
                for(var index in shipperCreateVue.selectedAddtionalSettings) {
                    ids.push(shipperCreateVue.selectedAddtionalSettings[index].additionalId);
                    sellingPrices.push(shipperCreateVue.selectedAddtionalSettings[index].sellingPrice);
                    costPrices.push(shipperCreateVue.selectedAddtionalSettings[index].costPrice);
                }
            }
            formData.additionalSettingsDtoIds = ids;
            formData.additionalSettingsDtoSellingPrices = sellingPrices;
            formData.additionalSettingsDtoCostPrices = costPrices;

            formData.transporterDate = formData.transporterDate.split(/-/g)[2]+"-"+formData.transporterDate.split(/-/g)[1]+"-"+formData.transporterDate.split(/-/g)[0];
            //bid更新
            if(!app.isEmpty(shipperCreateVue.bidId)) formData.bidId = shipperCreateVue.bidId;
            //job更新
            if(!app.isEmpty(shipperCreateVue.jobId)) formData.jobId = shipperCreateVue.jobId;
            return formData;
        },
        ajaxSettings:{
            beforeSend:function () {
                $(".content").loadingOverlay({loadingText:"waiting"});
            },
            complete:function () {
                $(".content").loadingOverlay("remove");
            },
            success:function (result) {
                if(result.result == "SUCCESS") {
                    app.appOption.fileInput.progressSuccess();
                    window.location.href = './shipperCreateBid.html?bv=' + shipperCreateVue.bidVersion + '&bidId='+app.appOption.getQueryParam("bidId")+'&sspi='+app.appOption.getQueryParam("sspi")+'&hasOperatedJob=true';
                }else {
                    app.appOption.fileInput.progressFailure();
                    app.toastr.error(result.message);
                }

            },
            error:function (error) {
                app.appOption.fileInput.progressFailure();
                app.toastr.error("request failed");
            }
        }
    },true);


    $("input[name='pickupLocation'],input[name='dropoffLocation']").bind("blur",function () {
        shipperCreate.formValidate($("#shipper-createJob-form")).element($(this));
    })

    /**
     * saved the created job
     */
    $("#job-create-save").bind("click",function () {
        var $formObj = $("#shipper-createJob-form");
        //validate weight
        if(shipperCreateVue.weightInfo.volumn == 0 ||
            shipperCreateVue.weightInfo.weight == 0){
            shipperCreateVue.weightValidationHide = false;
        }
        var validator = shipperCreate.formValidate($formObj);
        var $formValid = !validator.form();
        //validate file
        app.appOption.fileInput.validate.valid();
        var postalValid = !shipperCreate.validDropPostal && !shipperCreate.validPickPostal;
        if($formValid || postalValid) {
            return;
        }

        app.appOption.fileInput.upload($("#jobImages"));//发送上传请求
    });



    $("#additional-hide").bind("click",function () {
       $("#additional-service") .addClass("hide");
    });

    // shipperCreate.loadAllZones();
    // shipperCreate.findAllVehicleTypes();
    if(!shipperCreateVue.jobId) {
        shipperCreate.loadAllPackages();
        initMap();
    }else {
        shipperCreate.edit.init(shipperCreateVue.jobId);
    }
});
var shipperCreate = {
    url:"v1/api/bidJob/",
    startLocation:null,
    endLocation:null,
    validPickPostal:true,
    validDropPostal:true,
    pickGeocodeFailedByLatLng:true,
    dropGeocodeFailedByLatLng:true,
    timeCount:0,
    findSystemSettinByKey:function() {
      app.appOption.ajax.url = app.appOption.url + "v1/api/setting/findSettingByKey/transportDatePlus";
      app.appOption.ajax.type = "post";
      app.appOption.ajax.data = "";
      app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
          if(result) {
              var date = new Date();
              date.setDate(date.getDate()+(parseInt(result.value) - 1));
              $(".form_datetime").datepicker("setEndDate",date);
          }
      },function (error) {
          console.log(error);
      })
    },
    downloadPdf:function () {
        $("#service-guidelines").attr("href",app.appOption.url+"v1/api/setting/downloadPdfFile?sspi="+app.appOption.getQueryParam("sspi"));
    },
    detemineUrl:function () {
      if(!app.isEmpty(shipperCreateVue.jobId)) {
          return app.appOption.url+"v1/api/shipperBid/editJob?sspi="+app.appOption.getQueryParam('sspi');
      }else {
          return app.appOption.url+"v1/api/shipperBid/saveJob?sspi="+app.appOption.getQueryParam('sspi');
          // return app.appOption.url+"v1/api/bidJob/createBidJob?sspi="+app.appOption.getQueryParam('sspi');
      }
    },
    loadAllZones:function () {
        app.appOption.ajax.url = app.appOption.url+shipperCreate.url+"findAllZones";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            shipperCreateVue.zones = result;
        },function (error) {
            console.log(error);
        })
    },
    loadAllPackages:function () {
      app.appOption.ajax.url = app.appOption.url + "v1/api/package/findAllPackage";
      app.appOption.ajax.type = "post";
      app.appOption.ajax.data = "";
      app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
          if(result && result.length > 0){
              shipperCreateVue.initAllPackages = result;
              for(var index in shipperCreateVue.initAllPackages) {
                  shipperCreateVue.initAllPackages[index].quantity = 0;
              }
          }

          shipperCreate.edit.setPackage();
          $(".package-wrapper").removeClass("hide");
      },function (error) {
          console.log(error);
      })
    },
    getLocation:function (zoneId) {//get location info of the zone
        var zoneArr = shipperCreateVue.zones;
        for(var i=0;i<zoneArr.length;i++) {
            if(zoneId == zoneArr[i].id) {
                return {lat:parseFloat(zoneArr[i].latitude),lng:parseFloat(zoneArr[i].longitude)};
            }
        }
        return null;
    },
    findAllVehicleTypes:function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/vehicleType/findAllVehicleType";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            shipperCreateVue.vehicleTypes = result;
            shipperCreateVue.searchedTypes = result;
        },function (error) {
            console.log(error);
        })
    },
    backToBid:function () {
        window.location.href = "shipperCreateBid.html?bidId="+shipperCreateVue.bidId+"&bv="+shipperCreateVue.bidVersion+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    edit:{
        init:function (id) {
          $("body").loadingOverlay({loadingText:"waiting"});
          app.appOption.ajax.url = app.appOption.url + "v1/api/shipperBid/findJobByJobId/"+id;
          app.appOption.ajax.type = "post";
          app.appOption.ajax.data = "";
          app.appOption.ajax.asyncRequest(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
              shipperCreateVue.updateJobInfo = result;

              //load packages if all packages is empty
              if(app.isEmpty(shipperCreateVue.initAllPackages) || shipperCreateVue.initAllPackages.length == 0) {
                  shipperCreate.loadAllPackages();
              }

              shipperCreateVue.distance = shipperCreateVue.updateJobInfo.distance;
              shipperCreateVue.dropOffLocation = shipperCreateVue.updateJobInfo.dropoffLocation;
              shipperCreateVue.pickUpLocation = shipperCreateVue.updateJobInfo.pickupLocation;

              shipperCreate.edit.setTransportDate();

              shipperCreateVue.updateJobInfo.dropoffEndTime = timeFormat(shipperCreateVue.updateJobInfo.dropoffEndTime);
              shipperCreateVue.updateJobInfo.dropoffFromTime = timeFormat(shipperCreateVue.updateJobInfo.dropoffFromTime);
              shipperCreateVue.updateJobInfo.pickupEndTime = timeFormat(shipperCreateVue.updateJobInfo.pickupEndTime);
              shipperCreateVue.updateJobInfo.pickupFromTime = timeFormat(shipperCreateVue.updateJobInfo.pickupFromTime);
              shipperCreateVue.weightInfo.volumn = shipperCreateVue.updateJobInfo.volume;
              shipperCreateVue.weightInfo.volumnUom = shipperCreateVue.updateJobInfo.volumeUom;
              shipperCreateVue.weightInfo.weight = shipperCreateVue.updateJobInfo.weight;
              shipperCreateVue.weightInfo.weightUom = shipperCreateVue.updateJobInfo.weightUom;
              shipperCreateVue.jobPrice = shipperCreateVue.updateJobInfo.jobPrice;

              shipperCreate.edit.setVehicleType();

              // shipperCreate.edit.setPackage();

              shipperCreate.edit.setJobImages();
              // shipperCreateVue.geocode.pickupLocationList.push(shipperCreateVue.updateJobInfo.pickupLocation);
              // shipperCreateVue.geocode.dropoffLocationList.push(shipperCreateVue.updateJobInfo.dropoffLocation);

              $("body").loadingOverlay("remove");
              var $tObj = $("input[name='transporterDate']");
              Vue.nextTick(function () {
                  var transportDateObj = new Date(dateFormat(shipperCreateVue.updateJobInfo.transporterDate));
                  if(transportDateObj < new Date()) {
                      $tObj.val(app.appOption.reverseDateStr(dateFormat(shipperCreateVue.updateJobInfo.transporterDate)));
                  }else {
                      $tObj.datepicker("setDate",transportDateObj);
                  }
                  shipperCreate.formValidate($tObj.closest("form")).form();
                  google.initMap();
              });

          },function (error) {
              console.log(error);
          })
      },
        setTransportDate:function () {
            shipperCreateVue.transportDate = dateFormat(shipperCreateVue.updateJobInfo.transporterDate);
        },
        setVehicleType:function () {
            shipperCreateVue.vehicleTypeInfo = Object.assign({}, shipperCreateVue.vehicleTypeInfo,
                { type: shipperCreateVue.updateJobInfo.vehicleTypeName,
                    id: shipperCreateVue.updateJobInfo.vehicleTypeId});
        },
        setPackage:function () {
            if(app.isEmpty(shipperCreateVue.updateJobInfo.jobPackageDtoList)) return;
            if(app.isEmpty(shipperCreateVue.initAllPackages)) return;
            shipperCreateVue.selectedPackages = shipperCreateVue.updateJobInfo.jobPackageDtoList;
            for(var index in shipperCreateVue.initAllPackages) {
                for(var temp in shipperCreateVue.selectedPackages) {
                    if(shipperCreateVue.selectedPackages[temp].packageId == shipperCreateVue.initAllPackages[index].id) {
                        shipperCreateVue.initAllPackages[index] = Object.assign({}, shipperCreateVue.initAllPackages[index],
                            { quantity: shipperCreateVue.selectedPackages[temp].quantity});
                        shipperCreateVue.initAllPackages.splice(index, 1, shipperCreateVue.initAllPackages[index]);
                    }
                }
            }
        },
        setJobImages:function () {
            var jobImageList = shipperCreateVue.updateJobInfo.jobImageDtoList;
            var initConfigArr = [];
            var imageArr = [],imageUrlArr = [];
            if(jobImageList) {
                for(var index in jobImageList) {
                    var jobImageInfo = jobImageList[index];
                    if(jobImageInfo.id > 0) {
                        var imageUrl = app.appOption.url + "getImage/"+jobImageInfo.id+ "?sspi="+app.appOption.getQueryParam("sspi");
                        imageUrlArr.push(imageUrl);
                        imageArr.push(app.appOption.imageOp.getImageStr(index,{
                            height:"60px",
                            width:"60px"
                        }));
                        // arr.push('<img src="'+app.appOption.url+'getImage/'+jobImageInfo.id+'" class="file-preview-image kv-preview-data min-file-preview-image"/>');
                    }else {
                        imageArr.push('<img src="data:image/jpeg;base64,'+jobImageInfo.image+'" class="file-preview-image kv-preview-data min-file-preview-image"/>');
                    }
                    var config = new Object();
                    config.url=app.appOption.url + "v1/api/shipperBid/deleteImageOfJob/"+shipperCreateVue.updateJobInfo.id+"/"+shipperCreateVue.bidVersion+"/"+jobImageInfo.id+"?sspi="+app.appOption.getQueryParam("sspi");
                    // config.key=jobImageInfo.id;
                    initConfigArr.push(config);
                }
            }
            app.appOption.fileInput.fileCounts = imageArr.length;
            if(app.appOption.fileInput.fileCounts === 0) {
                app.appOption.fileInput.refresh($("#jobImages"),{initialPreview: imageArr,initialPreviewConfig:initConfigArr,minFileCount : 1});
            }else {
                app.appOption.fileInput.refresh($("#jobImages"),{initialPreview: imageArr,initialPreviewConfig:initConfigArr,minFileCount : 0});
            }
            app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
        }
    },
    getJobPrice:function(volume,weight,distance,transportDate){//get job price while distance,weight or volume has changed
    	var vehicleTypeId=shipperCreateVue.vehicleTypeInfo.id;
        var data = {
            volume:volume,
            weight:weight,
            distance:distance,
            vehicleTypeId:vehicleTypeId,
            transportDate:transportDate
        };
        //send ajax to get jobPrice
        app.appOption.ajax.url = app.appOption.url + "v1/api/bidJob/getJobPrice";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = JSON.stringify(data);
        app.appOption.ajax.requestWithStatus(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result.result == "SUCCESS") {
                shipperCreateVue.jobPrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(result.data,2));
            }
            // else if(result.code == -1) {
            //     app.toastr.error("No match of the vehicleType! Please split cargo to another job.");
            // }
            else {
                app.toastr.error(result.message);
            }
        },function (error) {
            console.log(error);
        })
    },
    defaultPickUpLocation:function (postalId) {
        for (var index in shipperCreateVue.zones) {
            if(postalId == shipperCreateVue.zones[index].id) {
                shipperCreateVue.pickUpLocation = shipperCreateVue.zones[index].address;
                $("input[name='pickupLocation']").closest(".valid-frame")
                                                    .addClass("has-success").removeClass("has-error")
                                                    .find("label.error").remove();
            }
        }
    },
    defaultDropOffLocation:function (postalId) {
        for (var index in shipperCreateVue.zones) {
            if(postalId == shipperCreateVue.zones[index].id) {
                shipperCreateVue.dropOffLocation = shipperCreateVue.zones[index].address;
                $("input[name='dropoffLocation']").closest(".valid-frame")
                                                    .addClass("has-success").removeClass("has-error")
                                                    .find("label.error").remove();
            }
        }
    },
    getDistance:function(pickupPostalCode,dropoffPostalCode) {
        app.appOption.ajax.url = app.appOption.url + "v1/api/bidJob/getDistance/"+pickupPostalCode+"/"+dropoffPostalCode;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            shipperCreateVue.distance = (parseFloat(result) / 1000).toString().length > 7 ? (parseFloat(result) / 1000).toFixed(6) : (parseFloat(result) / 1000);
        },function (error) {
            console.log(error);
        })
    },
    inputNumberOnly:function (event) {
        e = event ? event :(window.event ? window.event : null);
        var ev=0;
        ev=e.keyCode||e.which||e.charCode;
        if(ev >= 48 && ev <= 57) return true;
        if(ev == 8 || ev == 46) return true;
        if(ev >= 37 && ev <= 40) return true;
        if(ev >= 96 && ev <= 105) return true;
        return false;
    },
    formValidate:function (formObj) {
        return formObj.validate({
            ignore:"",
            rules:{
                pickupLocation:"required",
                dropoffLocation:"required",
                pickupFromTime:{
                    required:true,
                    jobLaterHours:{
                        formObj:formObj,
                        hours:3
                    }
                },
                pickupEndTime:{
                    required:true,
                    jobLaterThan:{
                        formObj:formObj,
                        name:"pickupFromTime",
                        type:"select"
                    }
                },
                pickupAddress:{
                    required:true,
                    digits:true,
                    sgPostal:"pickup",
                    geocodeFailedByLatLng:'pickup'
                },
                pickupPostalcode:"required",
                dropoffFromTime:{
                    required:true,
                    jobLaterThan:{
                        formObj:formObj,
                        name:"pickupEndTime",
                        type:"select"
                    }
                },
                dropoffEndTime:{
                    required:true,
                    jobLaterThan:{
                        formObj:formObj,
                        name:"dropoffFromTime",
                        type:"select"
                    }
                },
                dropoffAddress:{
                    required:true,
                    digits:true,
                    sgPostal:"dropoff",
                    geocodeFailedByLatLng:'dropoff'
                },
                dropoffPostalcode:"required",
                weight:{
                    required:true,
                    maxlength:14
                },
                weightUom:"required",
                volume:{
                    required:true,
                    maxlength:14
                },
                volumeUom:"required",
                quantity:"required",
                vehicleTypeId:"required",
                senderContactName:"required",
                senderContactMobile:{
                    required:true,
                    mobileValidate:true
                },
                recipientContactName:"required",
                recipientContactMobile:{
                    required:true,
                    mobileValidate:true
                },
                transporterDate:{
                    required:true,
                    laterDate:true
                },
                cargoDescription:{
                    maxlength:100
                }
            },
            messages:{
                pickupLocation:shipperCreateVue.message.validate.require,
                dropoffLocation:shipperCreateVue.message.validate.require,
                pickupFromTime:{
                    required:shipperCreateVue.message.validate.require,
                    jobLaterHours:shipperCreateVue.message.validate.jobLaterHour
                },
                pickupEndTime:{
                    required:shipperCreateVue.message.validate.require,
                    jobLaterThan:shipperCreateVue.message.validate.jobLaterThan.replace("{begin}",shipperCreateVue.message.shipperCreateJob.form.pickupEndTime).replace("{end}",shipperCreateVue.message.shipperCreateJob.form.pickupStartTime)
                },
                pickupAddress:{
                    required:shipperCreateVue.message.validate.require,
                    digits:shipperCreateVue.message.validate.digits
                },
                dropoffFromTime:{
                    required:shipperCreateVue.message.validate.require,
                    jobLaterThan:shipperCreateVue.message.validate.jobLaterThan.replace("{begin}",shipperCreateVue.message.shipperCreateJob.form.dropoffStartTime).replace("{end}",shipperCreateVue.message.shipperCreateJob.form.pickupEndTime)
                },
                dropoffEndTime:{
                    required:shipperCreateVue.message.validate.require,
                    jobLaterThan:shipperCreateVue.message.validate.jobLaterThan.replace("{begin}",shipperCreateVue.message.shipperCreateJob.form.dropoffEndTime).replace("{end}",shipperCreateVue.message.shipperCreateJob.form.dropoffStartTime)
                },
                dropoffAddress:{
                    required:shipperCreateVue.message.validate.require,
                    digits:shipperCreateVue.message.validate.digits
                },
                weight:{
                    required:shipperCreateVue.message.validate.require,
                    maxlength:shipperCreateVue.message.validate.maxlength.replace("{0}","14")
                },
                weightUom:shipperCreateVue.message.validate.require,
                volume:{
                    required:shipperCreateVue.message.validate.require,
                    maxlength:shipperCreateVue.message.validate.maxlength.replace("{0}","14")
                },
                volumeUom:shipperCreateVue.message.validate.require,
                quantity:shipperCreateVue.message.validate.require,
                vehicleTypeId:shipperCreateVue.message.validate.require,
                senderContactName:shipperCreateVue.message.validate.require,
                senderContactMobile:{
                    required:shipperCreateVue.message.validate.require,
                    mobileValidate:shipperCreateVue.message.validate.mobile
                },
                recipientContactName:shipperCreateVue.message.validate.require,
                recipientContactMobile:{
                    required:shipperCreateVue.message.validate.require,
                    mobileValidate:shipperCreateVue.message.validate.mobile
                },
                transporterDate:{
                    required:shipperCreateVue.message.validate.require,
                    laterDate:shipperCreateVue.message.validate.jobLaterDate
                },
                cargoDescription:{
                    maxlength:shipperCreateVue.message.validate.maxlength.replace("{0}","100")
                }
            },
            errorPlacement:function (error, element) {
                element.closest(".valid-frame").addClass("has-error").removeClass("has-success").append(error);
            },
            success:function (label) {
                label.closest(".valid-frame").addClass("has-success").removeClass("has-error");
                label.remove();
            }
        })
    }
};


var shipperCreateVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        pickFromInitTimeData:[
            "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
            "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
            "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
            "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
            "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
            "20:00","20:30"
        ],
        pickEndInitTimeData:[
            "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
            "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
            "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
            "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
            "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
            "20:00","20:30","21:00","21:30"
        ],
        dropoffFromInitTimeData:[
            "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
            "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
            "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
            "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
            "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
            "20:00","20:30","21:00","21:30","22:00","22:30"
        ],
        dropoffEndInitTimeData:[
            "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
            "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
            "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
            "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
            "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
            "20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30"
        ],
        geocode:{
            pickupLocationList:[],
            dropoffLocationList:[]
        },
        updateJobInfo:{
            pickupFromTime:"08:00",
            pickupEndTime:"09:00",
            dropoffFromTime:"10:00",
            dropoffEndTime:"11:00"
        },//field for job update info
        bidId:null,
        jobId:null,
        bidVersion:null,
        distance:null,//distance from origin place to destination place
        duration:null,//suggested spending times from origin place to destination place
        initAllPackages:[],//vehicle packages array
        currentPackage:{},//current package
        zones:null,//zones array
        additionalSettings:[],// additional service for vehicle type
        selectedAddtionalSettings:[],//the selected additional settings
        totalPrice:0,//total price
        jobPrice:0,//total job price
        asTotalPrice:0,//total addtional price
        showPopItemId:null,
        selectedPackages:[],
        vehicleTypeInfo:{},
        weightInfo:{//weight and volume info from backend
            volumn:0,
            weight:0,
            volumnUom:null,
            weightUom:null
        },
        transportDate:null,
        weightValidationHide:true,//hide whether selected the cargo weight or not.hide:if selected exccept init
        pickUpLocation:"",
        dropOffLocation:""
    },
    methods:{
        formatPrice:function (price) {
            return "S$ " + app.appOption.formatOperation.priceFormat(price);
        },
        timeChange:function (time,isStart,isPickup) {
            var timeArr = time.split(":");
            var startDate = new Date("1970/01/01 "+time);
            if(isStart) {
              if(isPickup) {
                  this.updateJobInfo.pickupEndTime = (startDate.getHours() + 1) < 10 ? "0"+(startDate.getHours() + 1)+":"+timeArr[1] : (startDate.getHours() + 1)+":"+timeArr[1];
                  this.updateJobInfo.dropoffFromTime = (startDate.getHours() + 2) < 10 ? "0"+(startDate.getHours() + 2)+":"+timeArr[1] : (startDate.getHours() + 2)+":"+timeArr[1];
                  this.updateJobInfo.dropoffEndTime = (startDate.getHours() + 3) < 10 ? "0"+(startDate.getHours() + 3)+":"+timeArr[1] : (startDate.getHours() + 3)+":"+timeArr[1];
                  Vue.nextTick(function () {
                      shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='pickupEndTime']"));
                      shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='dropoffFromTime']"));
                      shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='dropoffEndTime']"));
                  })
              }else {
                  this.updateJobInfo.dropoffEndTime = (startDate.getHours() + 1) < 10 ? "0"+(startDate.getHours() + 1)+":"+timeArr[1] : (startDate.getHours() + 1)+":"+timeArr[1];
                  Vue.nextTick(function () {
                      shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='pickupEndTime']"));
                      shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='dropoffEndTime']"));
                  })
              }
          }else {
                if(isPickup) {
                    this.updateJobInfo.dropoffFromTime = (startDate.getHours() + 1) < 10 ? "0"+(startDate.getHours() + 1)+":"+timeArr[1] : (startDate.getHours() + 1)+":"+timeArr[1];
                    this.updateJobInfo.dropoffEndTime = (startDate.getHours() + 2) < 10 ? "0"+(startDate.getHours() + 2)+":"+timeArr[1] : (startDate.getHours() + 2)+":"+timeArr[1];
                    Vue.nextTick(function () {
                        shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='pickupFromTime']"));
                        shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='dropoffFromTime']"));
                        shipperCreate.formValidate($("#shipper-createJob-form")).element($("select[name='dropoffEndTime']"));
                    })
                }
          }
        },
        displaySelectedAddress:function (address,isPick) {
            if(isPick) {
                shipperCreateVue.pickUpLocation = address;
            }else {
                shipperCreateVue.dropOffLocation = address;
            }
        },
        showPackageDetail:function (item) {
            this.currentPackage = item;
            $(".package-popover").removeClass("hide").attr("id","pop-"+item.id)
                .css("top",$("#package-"+this.currentPackage.id).offset().top + $("#package-"+this.currentPackage.id).outerHeight()).css("left",$("#package-"+this.currentPackage.id).offset().left);
        },
        movePop:function() {
            $("#additional-popover").css("top",$("#additional-services").offset().top + $("#additional-services").outerHeight()).css("left",$("#additional-services").offset().left);
            if(this.currentPackage && this.currentPackage.id) {
                $("#pop-"+this.currentPackage.id).css("top",$("#package-"+this.currentPackage.id).offset().top + $("#package-"+this.currentPackage.id).outerHeight()).css("left",$("#package-"+this.currentPackage.id).offset().left);
            }
        },
        getVehicleType:function (item) {
            var flag = true;
            for(var index in this.selectedPackages) {
                if(this.selectedPackages[index].packageId == item.id) {
                    if(item.quantity == 0) {
                        this.selectedPackages.splice(index,1);
                    }else {
                        this.weightValidationHide = true;
                        this.selectedPackages[index].quantity = item.quantity;
                    }
                    flag = false;
                }
            }
            if(flag){
                this.weightValidationHide = true;//hide validation if some weight cargo strategies have selected
                this.selectedPackages.push({"packageId":item.id,"quantity":item.quantity});
            }
            if(this.selectedPackages.length == 0) {
                this.weightValidationHide = false;
                this.vehicleTypeInfo = {};
                shipperCreateVue.weightInfo = {
                                                volumn:0,
                                                weight:0,
                                                volumnUom:"m³",
                                                weightUom:"kg"
                                            };
                return;
            }
            app.appOption.ajax.url = app.appOption.url+"v1/api/bidJob/findVehicleType";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(this.selectedPackages);
            app.appOption.ajax.requestWithStatus(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result.result == "FAILURE") {
                    shipperCreateVue.vehicleTypeInfo = {};
                    shipperCreateVue.weightInfo = {
                        volumn:0,
                        weight:0,
                        volumnUom:"m³",
                        weightUom:"kg"
                    };
                    if(result.message) {
                        app.appOption.ajax.dealErrorMsg(result.message);
                    }else {
                        app.toastr.error(shipperCreateVue.message.systemError);
                    }
                }else {
                    shipperCreateVue.vehicleTypeInfo = result.data.vehicleType;
                    // shipperCreateVue.asTotalPrice = 0;
                    shipperCreateVue.selectedAddtionalSettings = [];
                    shipperCreateVue.weightInfo = result.data.weightInfo;
                }
            },function (error) {
                console.log(error);
            })
        },
    },
    computed:{
        countTotalPrice:function () {//count total price(additional and job)
            return app.appOption.formatOperation.priceFormat(Math.formatFloat(this.jobPrice,2)+Math.formatFloat(this.asTotalPrice,2));
        }
    }
});

shipperCreateVue.$watch("pickUpLocation",function (newValue, oldValue) {
    shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='pickupLocation']"));
});

shipperCreateVue.$watch("dropOffLocation",function (newValue, oldValue) {
    shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='dropoffLocation']"));
})

shipperCreateVue.$watch("currentPackage",function (newValue, oldValue) {
    if(shipperCreateVue.currentPackage) {
        $("#package-popover").toggleClass("hide");
    }
});

/**
 * watch vehicleTypeInfo
 * if it changed,load additional services for this newValue
 */
shipperCreateVue.$watch('vehicleTypeInfo',function (newValue, oldValue) {
    if(newValue.id == null) {
        shipperCreateVue.additionalSettings = [];
        return;
    }
    if(newValue.id === oldValue.id) return;
    app.appOption.ajax.url = app.appOption.url+"v1/api/additionalSettings/findAdditionalByTypeId/"+newValue.id;
    app.appOption.ajax.type = "post";
    app.appOption.ajax.data = "";
    app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        shipperCreateVue.additionalSettings = result;
        shipperCreateVue.asTotalPrice = 0;
    },function (error) {
        console.log(error);
    })
});


/**
 * watch distance
 * if changed,get job price from backend
 */
shipperCreateVue.$watch('distance',function (newValue, oldValue) {
    if(shipperCreateVue.weightInfo.volumn == 0 ||
        shipperCreateVue.weightInfo.weight == 0 ||
        shipperCreateVue.distance == null ||
        app.isEmpty(shipperCreateVue.transportDate)){
        shipperCreateVue.jobPrice = 0;
        return;
    }
    shipperCreate.getJobPrice(
        shipperCreateVue.weightInfo.volumn,shipperCreateVue.weightInfo.weight,shipperCreateVue.distance,shipperCreateVue.transportDate);
});

shipperCreateVue.$watch('additionalSettings',function (newValue, oldValue) {
    if(shipperCreateVue.additionalSettings) {
        for(var index in shipperCreateVue.additionalSettings) {
            shipperCreateVue.additionalSettings[index].sellingPrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(shipperCreateVue.additionalSettings[index].sellingPrice,2));
        }
    }
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).bind("ifChecked",function () {
        shipperCreateVue.asTotalPrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(shipperCreateVue.asTotalPrice,2)+Math.formatFloat($(this).val(),2));
        if(shipperCreateVue.additionalSettings) {
            for(var index in shipperCreateVue.additionalSettings) {
                if(shipperCreateVue.additionalSettings[index].additionalId == $(this).attr("id")) {
                    shipperCreateVue.selectedAddtionalSettings.push(shipperCreateVue.additionalSettings[index]);
                }
            }
        }
    }).bind("ifUnchecked",function () {
        shipperCreateVue.asTotalPrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(shipperCreateVue.asTotalPrice,2)-Math.formatFloat($(this).val(),2));
        if(shipperCreateVue.additionalSettings) {
            for(var index in shipperCreateVue.additionalSettings) {
                if(shipperCreateVue.additionalSettings[index].additionalId == $(this).attr("id")) {
                    var _removeIndex = shipperCreateVue.selectedAddtionalSettings.indexOf(shipperCreateVue.additionalSettings[index]);
                    shipperCreateVue.selectedAddtionalSettings.splice(_removeIndex,1);
                }
            }
        }
        if(shipperCreateVue.asTotalPrice < 0) {
            shipperCreateVue.asTotalPrice = 0;
        }
    });

    if(shipperCreateVue.updateJobInfo && shipperCreateVue.updateJobInfo.jobAdditionalDtoList) {
        var updateAdditionalArr = shipperCreateVue.updateJobInfo.jobAdditionalDtoList;
        for(var temp in updateAdditionalArr) {
            $("input[id='"+updateAdditionalArr[temp].additionalId+"'].minimal").iCheck("check");
        }
    }
});
/**
 * watch weightInfo
 */
shipperCreateVue.$watch('weightInfo',function (newValue, oldValue) {
    if(shipperCreateVue.weightInfo.volumn == 0 ||
        shipperCreateVue.weightInfo.weight == 0 ||
        shipperCreateVue.distance == null ||
        app.isEmpty(shipperCreateVue.transportDate)){
        shipperCreateVue.jobPrice = 0;
        return;
    }
    shipperCreate.getJobPrice(
        shipperCreateVue.weightInfo.volumn,shipperCreateVue.weightInfo.weight,shipperCreateVue.distance,shipperCreateVue.transportDate);
});
/**
 * watch transpoterDate
 */
shipperCreateVue.$watch("transportDate",function (newValue, oldValue) {
    if(shipperCreateVue.weightInfo.volumn == 0 ||
        shipperCreateVue.weightInfo.weight == 0 ||
        shipperCreateVue.distance == null ||
        app.isEmpty(shipperCreateVue.transportDate)){
        shipperCreateVue.jobPrice = 0;
        return;
    }
    shipperCreate.getJobPrice(
        shipperCreateVue.weightInfo.volumn,shipperCreateVue.weightInfo.weight,shipperCreateVue.distance,shipperCreateVue.transportDate);
});



jQuery.validator.addMethod("sgPostal", function (value, element,param) {
        if(param == "pickup") {
            return shipperCreate.validPickPostal;
        }else if(param == "dropoff"){
            return shipperCreate.validDropPostal;
        }
    }, shipperCreateVue.message.validate.invalidPostalCode);
jQuery.validator.addMethod("geocodeFailedByLatLng", function (value, element,param) {
    if(param == "pickup") {
        return shipperCreate.pickGeocodeFailedByLatLng;
    }else if(param == "dropoff"){
        return shipperCreate.dropGeocodeFailedByLatLng;
    }
}, shipperCreateVue.message.validate.noAddressFound);

var map,markerArray,directionsService,directionsRender,infoWindow;
function initMap() {
    markerArray = [];
    directionsService = new google.maps.DirectionsService;

    map = new google.maps.Map(document.getElementById("map"),{
        center:{lat:1.27828,lng:103.856},
        zoom:13
    });


    directionsRender = new google.maps.DirectionsRenderer({
        map:map
    });
    infoWindow = new google.maps.InfoWindow;
    var currentKeyUpVal;
    $("#pickUpAddress").bind("keyup",function (event) {
        e = event ? event :(window.event ? window.event : null);
        var ev=0;
        ev=e.keyCode||e.which||e.charCode;
        var _$this = $(this);
        if((ev >= 48 && ev <= 57) || (ev <= 105 && ev >= 96)) {
            if (app.isEmpty(_$this.val())) {
                shipperCreateVue.pickUpLocation = "";
                shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
                shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='pickupLocation']"));
            } else if (_$this.val().length == 6 && currentKeyUpVal != _$this.val()) {
                $("body").loadingOverlay({loadingText: shipperCreateVue.message.waiting});
                // shipperCreate.pickGeocodeFailedByLatLng = true;
                geocoderByPostalCode(_$this.val(), $("input[name='pickupLocation']"), "start");
            } else if(_$this.val().length == 6 && currentKeyUpVal == _$this.val()) {

            }else {
                shipperCreateVue.pickUpLocation = "";
            }
            currentKeyUpVal = _$this.val();
        }
    }).bind("blur",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val()) || _$this.val().length < 6) {
            shipperCreate.validPickPostal = false;
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
        }
    }).bind("change",function () {
        var _$this = $(this);
        if (app.isEmpty(_$this.val())) {
            shipperCreateVue.pickUpLocation = "";
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='pickupLocation']"));
        } else if (_$this.val().length == 6 && currentKeyUpVal != _$this.val()) {
            $("body").loadingOverlay({loadingText: "waiting"});
            // shipperCreate.pickGeocodeFailedByLatLng = true;
            geocoderByPostalCode(_$this.val(), $("input[name='pickupLocation']"), "start");
        } else if(_$this.val().length == 6 && currentKeyUpVal == _$this.val()) {

        }else {
            shipperCreateVue.pickUpLocation = "";
        }
        currentKeyUpVal = _$this.val();
    });
    var currentDropKeyUpVal;
    $('#dropOffAddress').bind('keyup', function (event) {
        e = event ? event :(window.event ? window.event : null);
        var ev=0;
        ev=e.keyCode||e.which||e.charCode;
        var _$this = $(this);
        if((ev >= 48 && ev <= 57) || (ev <= 105 && ev >= 96)) {
            if(app.isEmpty(_$this.val())) {
                shipperCreateVue.dropOffLocation = "";
                shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
                shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='dropoffLocation']"));
            } else if(_$this.val().length == 6 && currentDropKeyUpVal != _$this.val()){
                $("body").loadingOverlay({loadingText:"waiting"});
                geocoderByPostalCode(_$this.val(),$("input[name='dropoffLocation']"),"end");
            }else if(_$this.val().length == 6 && currentDropKeyUpVal == _$this.val()){

            } else {
                shipperCreateVue.dropOffLocation = "";
            }
            currentDropKeyUpVal = _$this.val();
        }
    }).bind("blur",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val()) || _$this.val().length < 6) {
            shipperCreate.validDropPostal = false;
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
        }
    }).bind("change",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val())) {
            shipperCreateVue.dropOffLocation = "";
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
            shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='dropoffLocation']"));
        } else if(_$this.val().length == 6 && currentDropKeyUpVal != _$this.val()){
            $("body").loadingOverlay({loadingText:"waiting"});
            geocoderByPostalCode(_$this.val(),$("input[name='dropoffLocation']"),"end");
        }else if(_$this.val().length == 6 && currentDropKeyUpVal == _$this.val()){

        } else {
            shipperCreateVue.dropOffLocation = "";
        }
        currentDropKeyUpVal = _$this.val();
    });

    //init page data if edit job
    if(shipperCreateVue.jobId) {
        geocoderByPostalCode(shipperCreateVue.updateJobInfo.pickupAddress,$("input[name='pickupLocation']"),"start");
        geocoderByPostalCode(shipperCreateVue.updateJobInfo.dropoffAddress,$("input[name='dropoffLocation']"),"end");

    }

}

/**
 * duplicated
 * @param sLocation
 * @param eLocation
 */
function getDistance(sLocation,eLocation) {
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins:[sLocation],
        destinations:[eLocation],
        travelMode:"DRIVING",
        unitSystem:google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    },function (response, status) {
        if(status != "OK") {
            app.toastr.error("get distance failed!");
        }else {
            var results = response.rows[0].elements;
            shipperCreateVue.distance = (results[0].distance.value / 1000).toString().length > 7 ? (results[0].distance.value / 1000).toFixed(6) : (results[0].distance.value / 1000);
            shipperCreateVue.duration = (results[0].duration.value / 1000).toString().length > 7 ? (results[0].duration.value / 1000).toFixed(6) : (results[0].duration.value / 1000);
        }
    })
}

function displayRoute(start,end,markerArray,directionsService,directionsRender,infoWindow) {
    //remove all exist markers
    if(markerArray && markerArray.length > 0) {
        for(var i=0;i<markerArray.length;i++) {
            markerArray[i].setMap(null);
        }
    }

    directionsService.route({
        origin:start,
        destination:end,
        travelMode:google.maps.TravelMode.DRIVING
    },function (response,status) {
        if(status == google.maps.DirectionsStatus.OK) {
            directionsRender.setMap(map);
            directionsRender.setDirections(response);
        }else {
            app.toastr.error(shipperCreateVue.message.directionFailed.replace("{status}",status));
            directionsRender.setMap(null);
        }
    })
}

function addMarker(location, map) {
    var marker = new google.maps.Marker({
        position:location,
        map:map,
        animation:google.maps.Animation.BOUNCE
    });
    return marker;
};
function clearMarker() {
    if(markerArray && markerArray.length > 0) {
        for(var i=0;i<markerArray.length;i++) {
            markerArray[i].setMap(null);
        }
    }
}
var formatAddressStart,formatAddressEnd;
function geocoderByPostalCode(postalCode,obj,startOrEnd) {
    var geocode = new google.maps.Geocoder(),
        isPickup = "start" === startOrEnd,
        $form = $("#shipper-createJob-form"),$pObj = $("#pickUpAddress"),
        $dObj = $("#dropOffAddress");
    if(isPickup) {
        shipperCreateVue.pickUpLocation = "";
        shipperCreate.pickGeocodeFailedByLatLng = true;
    }else {
        shipperCreateVue.dropOffLocation = "";
        shipperCreate.dropGeocodeFailedByLatLng = true;
    }
    geocode.geocode( {componentRestrictions:{country:"SG",postalCode:postalCode}} ,function (results, status) {
        $("body").loadingOverlay("remove");
        if(status === google.maps.GeocoderStatus.OK) {
            clearMarker();
            //没有解析到地址
            if(!results || !results[0] || results.length === 0) {
                if(isPickup) {
                    shipperCreate.validPickPostal = false;
                    shipperCreateVue.pickUpLocation = "";
                    shipperCreate.formValidate($form).element($pObj);
                }else {
                    shipperCreate.validDropPostal = false;
                    shipperCreateVue.dropOffLocation = "";
                    shipperCreate.formValidate($form).element($dObj);
                }
                // obj.val("");
                shipperCreateVue.distance = 0;
                shipperCreateVue.jobPrice = 0;
                directionsRender.setMap(null);
                return;
            }
            //获取解析到的地址的经纬度
            var latlng = {lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
            //设置初始化参数
            if(isPickup) {
                //解析到的地址
                formatAddressStart = results[0].formatted_address;
                //验证通过
                shipperCreate.validPickPostal = true;
                //验证起点postal code
                shipperCreate.formValidate($form).element($pObj);
                //设置起始位置经纬度
                shipperCreate.startLocation = latlng;
            }else {
                //解析到的终点地址
                formatAddressEnd = results[0].formatted_address;
                //验证通过
                shipperCreate.validDropPostal = true;
                //验证终点postal code
                shipperCreate.formValidate($form).element($dObj);
                //设置终点位置经纬度
                shipperCreate.endLocation = latlng;
            }
            //如果起点终点位置经纬度存在，规划路线
            if(formatAddressStart && formatAddressEnd) {
                //如果解析到起始位置与终点位置，调用api获取距离
                // getDistance(formatAddressStart,formatAddressEnd);
                //calculate distance for the selected two places
                shipperCreate.getDistance($pObj.val(),$dObj.val());
            }else if(app.isEmpty(shipperCreateVue.jobId)){
                var marker;
                if(isPickup) {
                    marker = addMarker({lat:shipperCreate.startLocation.lat,lng:shipperCreate.startLocation.lng},map);
                    map.setCenter({lat:shipperCreate.startLocation.lat,lng:shipperCreate.startLocation.lng});
                    app.toastr.info(shipperCreateVue.message.inputDestPostalCode);
                }else{
                    marker = addMarker({lat:shipperCreate.endLocation.lat,lng:shipperCreate.endLocation.lng},map);
                    map.setCenter({lat:shipperCreate.endLocation.lat,lng:shipperCreate.endLocation.lng});
                    app.toastr.info(shipperCreateVue.message.inputSrcPostalCode);
                }
                markerArray.push(marker);
            }else if(!app.isEmpty(shipperCreateVue.jobId)){
                var marker;
                if(isPickup) {
                    marker = addMarker({lat:shipperCreate.startLocation.lat,lng:shipperCreate.startLocation.lng},map);
                    map.setCenter({lat:shipperCreate.startLocation.lat,lng:shipperCreate.startLocation.lng});
                }else {
                    marker = addMarker({lat:shipperCreate.endLocation.lat,lng:shipperCreate.endLocation.lng},map);
                    map.setCenter({lat:shipperCreate.endLocation.lat,lng:shipperCreate.endLocation.lng});
                }
                markerArray.push(marker);
            }
            //处理解析到的地址，如果地址有效，直接使用;否则根据经纬度进行解析
            var preciseResults = getPreciseResults(results);
            if(preciseResults && preciseResults.length > 0) {
                // obj.val(preciseResults[0].formatted_address);
                if(isPickup) {
                    shipperCreateVue.geocode.pickupLocationList = getFormatedAddressArr(results);
                    if(shipperCreateVue.updateJobInfo.pickupLocation) {
                        if(shipperCreateVue.geocode.pickupLocationList.indexOf(shipperCreateVue.updateJobInfo.pickupLocation) == -1) {
                            shipperCreateVue.geocode.pickupLocationList.push(shipperCreateVue.updateJobInfo.pickupLocation);
                        }
                        shipperCreateVue.pickUpLocation = shipperCreateVue.geocode.pickupLocationList[0];
                    }else {
                        shipperCreateVue.pickUpLocation = getFormatedAddressArr(results)[0];
                    }
                }else{
                    shipperCreateVue.geocode.dropoffLocationList = getFormatedAddressArr(results);
                    if(shipperCreateVue.updateJobInfo.dropoffLocation) {
                        if(shipperCreateVue.geocode.dropoffLocationList.indexOf(shipperCreateVue.updateJobInfo.dropoffLocation) == -1) {
                            shipperCreateVue.geocode.dropoffLocationList.push(shipperCreateVue.updateJobInfo.dropoffLocation);
                        }
                        shipperCreateVue.dropOffLocation = shipperCreateVue.geocode.dropoffLocationList[0]
                    }else {
                        shipperCreateVue.dropOffLocation = getFormatedAddressArr(results)[0];
                    }
                }
                if(shipperCreate.startLocation && shipperCreate.endLocation) {
                    displayRoute(
                        shipperCreate.startLocation,
                        shipperCreate.endLocation,
                        markerArray, directionsService, directionsRender, infoWindow);
                }
            }else {
                geocoderByLatLng(latlng,obj,startOrEnd);
            }
        }else {
            clearMarker();
            if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                if(isPickup) {
                    shipperCreate.validPickPostal = false;
                    shipperCreate.formValidate($form).element($pObj);
                }else {
                    shipperCreate.validDropPostal = false;
                    shipperCreate.formValidate($form).element($dObj);
                }
            }
            obj.val("");
            shipperCreateVue.distance = 0;
            shipperCreateVue.jobPrice = 0;
            directionsRender.setMap(null);
            if(status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                app.toastr.error(shipperCreateVue.message.geocodeAddressFailed.replace("{status}",status));
            }
        }
    });
};
function geocoderByLatLng(latlng,obj,startOrEnd) {
    var geocode = new google.maps.Geocoder(),
        isPickup = "start" === startOrEnd,
        $form = $("#shipper-createJob-form"),$pObj = $("#pickUpAddress"),$dObj = $("#dropOffAddress"),
        $plObj = $("input[name='pickupLocation']"),$dlObj = $("input[name='dropoffLocation']");
    geocode.geocode( {location:latlng,region:"702"} ,function (results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
            if(results && results.length > 0) {
                var addressResults = dealAddress(results);
                if(!addressResults || addressResults.length === 0) {
                    if(isPickup) {
                        shipperCreate.pickGeocodeFailedByLatLng = false;
                        shipperCreate.formValidate($form).element($pObj);
                        $plObj.focus();
                        $plObj.bind("keyup",function () {
                            shipperCreate.pickGeocodeFailedByLatLng = true;
                            shipperCreate.formValidate($form).element($pObj);
                        });
                    }else {
                        shipperCreate.dropGeocodeFailedByLatLng = false;
                        shipperCreate.formValidate($form).element($dObj);
                        $dObj.focus();
                        $dlObj.bind("keyup",function () {
                            shipperCreate.dropGeocodeFailedByLatLng = true;
                            shipperCreate.formValidate($form).element($dObj);
                        });
                    }
                    return;
                }
                // obj.val(addressResults[0].formatted_address);
                if(isPickup) {
                    shipperCreateVue.geocode.pickupLocationList = getFormatedAddressArr(results)
                    if(shipperCreateVue.updateJobInfo.pickupLocation) {
                        if(shipperCreateVue.geocode.pickupLocationList.indexOf(shipperCreateVue.updateJobInfo.pickupLocation) == -1) {
                            shipperCreateVue.geocode.pickupLocationList.push(shipperCreateVue.updateJobInfo.pickupLocation);
                        }
                        shipperCreateVue.pickUpLocation = shipperCreateVue.geocode.pickupLocationList[0];
                    }else {
                        shipperCreateVue.pickUpLocation = getFormatedAddressArr(results)[0];
                    }
                    Vue.nextTick(function () {
                        shipperCreate.formValidate($form).element($plObj);
                    })
                }else{
                    shipperCreateVue.geocode.dropoffLocationList = getFormatedAddressArr(results);
                    if(shipperCreateVue.updateJobInfo.dropoffLocation) {
                        if(shipperCreateVue.geocode.dropoffLocationList.indexOf(shipperCreateVue.updateJobInfo.dropoffLocation) == -1) {
                            shipperCreateVue.geocode.dropoffLocationList.push(shipperCreateVue.updateJobInfo.dropoffLocation);
                        }
                        shipperCreateVue.dropOffLocation = shipperCreateVue.geocode.dropoffLocationList[0]
                    }else {
                        shipperCreateVue.dropOffLocation = getFormatedAddressArr(results)[0];
                    }
                    Vue.nextTick(function () {
                        shipperCreate.formValidate($form).element($dlObj);
                    });
                }

                if(shipperCreate.startLocation && shipperCreate.endLocation) {
                    displayRoute(
                        shipperCreate.startLocation,
                        shipperCreate.endLocation,
                        markerArray, directionsService, directionsRender, infoWindow);
                }
            }else{//反向解析失败，提供的经纬度没有解析到地址信息
                if(isPickup) {
                    shipperCreate.pickGeocodeFailedByLatLng = false;
                    shipperCreate.formValidate($form).element($pObj);
                    $plObj.focus();
                    $plObj.bind("keyup",function () {
                        shipperCreate.pickGeocodeFailedByLatLng = true;
                        shipperCreate.formValidate($form).element($pObj);
                    });
                }else {
                    shipperCreate.dropGeocodeFailedByLatLng = false;
                    shipperCreate.formValidate($form).element($dObj);
                    $dObj.focus();
                    $dlObj.bind("keyup",function () {
                        shipperCreate.dropGeocodeFailedByLatLng = true;
                        shipperCreate.formValidate($form).element($dObj);
                    });
                }

            }
        }else {
            clearMarker();
            if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                if(isPickup) {
                    shipperCreate.pickGeocodeFailedByLatLng = false;
                    shipperCreate.formValidate($form).element($pObj);
                    $plObj.focus();
                    $plObj.bind("keyup",function () {
                        shipperCreate.pickGeocodeFailedByLatLng = true;
                        shipperCreate.formValidate($form).element($pObj);
                    });
                }else {
                    shipperCreate.dropGeocodeFailedByLatLng = false;
                    shipperCreate.formValidate($form).element($dObj);
                    $dObj.focus();
                    $dlObj.bind("keyup",function () {
                        shipperCreate.dropGeocodeFailedByLatLng = true;
                        shipperCreate.formValidate($form).element($dObj);
                    });
                }
            }
            obj.val("");
            shipperCreateVue.distance = 0;
            shipperCreateVue.jobPrice = 0;
            directionsRender.setMap(null);
            if(status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                app.toastr.error(shipperCreateVue.message.geocodeAddressFailed.replace("{status}",status));
            }
        }
    });
};
function geocoderByAddress(address) {
    var geocode = new google.maps.Geocoder();
    geocode.geocode( {address:address,region:"702"} ,function (results, status) {
        if(status = google.maps.GeocoderStatus.OK) {


        }else {
            app.toastr.error(shipperCreateVue.message.directionFailed.replace("{status}",status));
        }
    });
}
function dealGoogleAddress(result) {
    if(!result || !result.formatted_address) return "";
    var arr = result.formatted_address.split(",");
    if(arr && arr[0]) {
        result.formatted_address = arr[0];
    }
    return result;

}
function getPreciseResults(results) {
    if(!results || results.length == 0) return "";
    var arr = $.map(results,function (b) {
        if(b.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP){
            return dealGoogleAddress(b);
        }
    });
    return arr;
}
function dealAddress(results) {
    if(!results || results.length == 0) return "";
    var arr = $.map(results,function (b) {
        if(b.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP){
            return dealGoogleAddress(b);
        }
    });
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.RANGE_INTERPOLATED){
                return dealGoogleAddress(b);
            }
        });
    }
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.GEOMETRIC_CENTER){
                return dealGoogleAddress(b);
            }
        });
    }
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.APPROXIMATE){
                return dealGoogleAddress(b);
            }
        });
    }
    return arr;
}
function getFormatedAddressArr(results) {
    if(!results || results.length == 0) return new Array();
    var widthDuplicated = $.map(results,function (b) {
        if(b.geometry.location_type != google.maps.GeocoderLocationType.APPROXIMATE) {
            return b.formatted_address;
        }
    });
    var newArr = [];
    $.each(widthDuplicated,function (outKey, outVal) {
        var flag = true;
        for(var inkey=outKey+1;inkey<widthDuplicated.length;inkey++) {
            if(outVal == widthDuplicated[inkey]) flag = false;
        }
        if(flag) {
            newArr.push(outVal);
        }
    });
    return newArr;
}


window.shipperCreate = shipperCreate;
window.shipperCreateVue = shipperCreateVue;