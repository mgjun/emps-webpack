/**
 * Created by MENGJUN on 2017/3/22.
 */
$(document).ready(function () {
   shipperBD.loadShipperBD(app.appOption.getQueryParam("shipperBidNo"));
});
var shipperBD = {
    url:"v1/api/shipperBid/",
    loadShipperBD:function (bidNo) {
        app.appOption.ajax.url = app.appOption.url+this.url+"findShipperBidByBidNo/"+bidNo;
        app.appOption.ajax.type = "POST";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            shipperBDVue.item = result;
        },function (error) {
            console.log(error);
        })
    }
};

window.shipperBD = shipperBD;
var shipperBDVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        item:null,
        jobCargoDescription:null,
        driverInfo:{}
    },
    methods:{
        isEmpty:function (obj) {
          return app.isEmpty(obj);
        },
        showTransporterBid:function (transporterBidId,jobId) {
            window.location.href = "./transporterBidDetail.html?transporterBidId="+transporterBidId+"&jobId="+jobId+"&isp=true"+"&sspi="+app.appOption.getQueryParam("sspi");
        },
        formatPrice:function (price) {
            return app.appOption.formatOperation.priceDisplay(price)
        },
        timeFormat:function (time) {
            return app.timeFormat(time);
        },
        displayStatus:function (status) {
          return app.appOption.displayStatus(status);
        },
        refund:function (job) {
            app.appOption.alertify._init({
                ok:shipperBDVue.message.button.yes,
                cancel:shipperBDVue.message.button.no,
                hideCancel:false,
                confirmMsg:shipperBDVue.refundInfo.replace("{jobId}",job.id).replace("{jobPrice}",app.appOption.formatOperation.priceDisplay(job.finalPrice+job.sellingTotalPrice)),
                confirmFn:function (e) {
                    app.appOption.ajax.url = app.appOption.url+"v1/api/bidJob/applyRefund/"+job.id;
                    app.appOption.ajax.type = "PUT";
                    app.appOption.ajax.data = "";
                    app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                        app.appOption.alertify._init({
                            ok:shipperBDVue.message.button.yes,
                            cancel:shipperBDVue.message.button.no,
                            hideCancel:true,
                            confirmMsg:shipperBDVue.refundSuccess,
                            confirmFn:function (e) {
                                window.history.go(0);
                            },
                            cancelFn:function (e) {

                            }
                        });
                    },function (error) {
                        console.log(error);
                    })
                },
                cancelFn:function (e) {

                }
            });
        },
        viewImage:function (job) {
            app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+job.id+"/createJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result) {
                    var imageArr,imageUrlArr = [];
                    if(result.length == 0) {
                        imageArr = "No image found for this job!" ;
                    }else {
                        imageArr = [];
                        for(var index in result) {
                            var imageUrl = app.appOption.url + result[index]+ "?sspi="+app.appOption.getQueryParam("sspi");
                            imageUrlArr.push(imageUrl);
                            imageArr.push(app.appOption.imageOp.getImageStr(index));
                        }
                    }


                    shipperBDVue.jobCargoDescription = job.cargoDescription;
                    $("#viewCargoPic").modal("show");
                    app.appOption.fileInput.destroy($("#showCargoPic"));
                    app.appOption.fileInput.init($("#showCargoPic"),{
                        initialPreview:imageArr
                    },false);
                    app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
                }

            },function (error) {
                console.log(error);
            })
        },
        viewDriver:function (job) {
            app.appOption.ajax.url = app.appOption.url+"v1/api/driver/findDriverById/"+job.driver.id;
            app.appOption.ajax.type="post";
            app.appOption.ajax.data={id:job.driver.id};
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result) {
                    shipperBDVue.driverInfo = result;

                    var attachFiles = result.attachmentFileDtos,imageArr = [];
                    if(attachFiles) {
                        for(var index in attachFiles) {
                            var attach = attachFiles[index];
                            imageArr.push('<img src="data:image/jpeg;base64,'+attach.file+'" class="file-preview-image kv-preview-data max-file-preview-image"/>');
                        }
                    }
                    $("#viewDriverModal").modal("show");
                    $("#edit-rating").raty($.extend({},{
                        number: 5,
                        score:shipperBDVue.driverInfo.rating,
                        targetType: 'number',
                        cancelOff: 'cancel-off.png',
                        cancelOn: 'cancel-on.png',
                        path:"../plugins/rating/img/",
                        size: 24,
                        starHalf: 'star-half.png',
                        starOff: 'star-off.png',
                        starOn: 'star-on.png',
                        cancel: false,
                        readOnly:true
                    }));
                    app.appOption.fileInput.destroy($("#driver-attachmentImages"));
                    app.appOption.fileInput.init($("#driver-attachmentImages"),{
                        initialPreview: imageArr
                    }, false);

                    $("#show-portrait").attr("src",app.appOption.url + "getImageByBusinessId/"+result.id+"?sspi="+app.appOption.getQueryParam("sspi"));
                }

            },function (error) {
                console.log(error);
            })
        },
        viewPODImage:function (jobId) {
            app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+jobId+"/completeJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result) {
                    var imageArr,imageUrlArr = [];
                    if(result.length == 0) {
                        imageArr = "no image found for this job!" ;
                    }else {
                        imageArr = [];
                        for(var index in result) {
                            var imageUrl = app.appOption.url + result[index]+ "?sspi="+app.appOption.getQueryParam("sspi");
                            imageUrlArr.push(imageUrl);
                            imageArr.push(app.appOption.imageOp.getImageStr(index));
                        }
                    }
                    $("#viewPODPic").modal("show");
                    app.appOption.fileInput.destroy($("#showPODPic"));
                    app.appOption.fileInput.init($("#showPODPic"),{
                        initialPreview:imageArr
                    },false);
                    app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
                }

            },function (error) {
                console.log(error);
            })
        },
        displayDriverName:function (driver) {
            if(!driver) return "";
            if(!driver.lastName) return driver.firstName;
            if(!driver.firstName) return driver.lastName;
            return driver.firstName + ' ' + driver.lastName;
        }
    },
    ready:function () {

        $(".box-body").removeClass("hide");
    }
});