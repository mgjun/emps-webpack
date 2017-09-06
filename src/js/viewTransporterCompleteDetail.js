/**
 * Created by MENGJUN on 2017/3/1.
 */
$(document).ready(function () {
    vtcDetail.bidId = app.appOption.getQueryParam("bidId");
    vtcDetail.auctionNo = app.appOption.getQueryParam("auctionNo");
    vtcDetail.status = app.appOption.getQueryParam("status");
    vtcDetailVue.payStatus = app.appOption.getQueryParam("status");
    vtcDetail.loadInfo(vtcDetail.bidId,vtcDetail.auctionNo);
});

var vtcDetail = {
    bidId:null,
    auctionNo:null,
    status:null,
    url:"v1/api/transporterBid/",
    loadInfo:function (bidId,auctionNo) {
        app.appOption.ajax.url = app.appOption.url + vtcDetail.url + "viewTranBidOfCompleteJobDetail/"+bidId+"/"+auctionNo;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            vtcDetailVue.item = result;
        },function (error) {
            console.log(error);
        })
    }
};
window.vtcDetail = vtcDetail;
var vtcDetailVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        payStatus:null,
        item:null,
        jobInfo:{}
    },
    methods:{
        formatPrice:function (price) {
            var priceFormat = app.appOption.formatOperation.priceDisplay(price);
            return  "-" == priceFormat ? 0 : priceFormat;
        },
        timeFormat:function (time) {
            return timeFormat(time);
        },
        viewJob:function (jobId) {
            app.appOption.ajax.url = app.appOption.url + "v1/api/bidJob/findJobByJobId/"+jobId;
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = "";
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                vtcDetailVue.jobInfo = result;
                app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+jobId+"/createJob";
                app.appOption.ajax.type = "post";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    if(result) {
                        var imageArr,imageUrlArr = [];
                        if (result.length == 0) {
                            imageArr = vtcDetailVue.message.noImageInfo;
                        } else {
                            imageArr = [];
                            for (var index in result) {
                                var imageUrl = app.appOption.url + result[index] + "?sspi=" + app.appOption.getQueryParam("sspi");
                                imageUrlArr.push(imageUrl);
                                imageArr.push(app.appOption.imageOp.getImageStr(index));
                            }
                        }
                        $("#viewJobInfo").modal("show");
                        app.appOption.fileInput.destroy($("#showJobImage"));
                        app.appOption.fileInput.init($("#showJobImage"),{
                            initialPreview: imageArr
                        },false);
                        app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr)
                    }
                },function (error) {
                    console.log(error);
                    $("#jobInfoImages").empty();
                });
            },function (error) {
                console.log(error);
            });
        },
        viewImage:function(jobId){
            app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+jobId+"/completeJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result) {
                    var imageArr,imageUrlArr = [];
                    if (result.length == 0) {
                        imageArr = vtcDetailVue.message.noImageInfo;
                    } else {
                        imageArr = [];
                        for (var index in result) {
                            var imageUrl = app.appOption.url + result[index] + "?sspi=" + app.appOption.getQueryParam("sspi");
                            imageUrlArr.push(imageUrl);
                            imageArr.push(app.appOption.imageOp.getImageStr(index));
                        }
                    }
                    $("#viewPicture").modal("show");
                    app.appOption.fileInput.destroy($("#showImage"));
                    app.appOption.fileInput.init($("#showImage"),{
                        initialPreview: imageArr
                    },false);
                    app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr)
                }
            },function (error) {
                console.log(error);
                $("#show-image").empty();
            })
        },
        pay:function () {
            app.appOption.ajax.url = app.appOption.url + vtcDetail.url + "platformPaid/"+vtcDetail.auctionNo+"/"+vtcDetail.bidId;
            app.appOption.ajax.type = "put";
            app.appOption.ajax.data = "";
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                vtcDetailVue.payStatus = "platform_paid";
            },function (error) {
                console.log(error);
            })
        }
    }
});