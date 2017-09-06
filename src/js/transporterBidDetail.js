/**
 * isp 表示shipper 查看transporter详细
 * istb 是transporterBidView 查看transporter详细
 * Created by MENGJUN on 2017/3/22.
 */
$(document).ready(function () {
    // if(app.isEmpty(app.appOption.getQueryParam("bidNo"))) {
        tbd.loadTBD(app.appOption.getQueryParam("transporterBidId"),app.appOption.getQueryParam("auctionNo"),app.appOption.getQueryParam("jobGroup"));
    // }else {
    //     tbd.loadByNo(app.appOption.getQueryParam("bidNo"));
    // }
    if(!app.isEmpty(app.appOption.getQueryParam("isp"))) {
        tbdVue.isp = app.appOption.getQueryParam("isp");
    }
    tbdVue.istb = app.appOption.getQueryParam("istb");
});
var tbd = {
    url:"v1/api/transporterBid/",
    loadTBD:function (tbdId,auctionNo,jobGroup) {
        app.appOption.ajax.url = app.appOption.url+this.url+"findTransporterBidById/"+tbdId+"/"+auctionNo+"/"+jobGroup;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            tbdVue.item = result;
        },function (error) {
            console.log(error);
        })
    },
    loadByNo:function (bidNo) {
        app.appOption.ajax.url = app.appOption.url+this.url+"findTransporterBidByNo/"+bidNo;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            tbdVue.item = result;
        },function (error) {
            console.log(error);
        })
    }
};

window.tbd = tbd;
var tbdVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        item:null,
        transporterBidId:null,
        isp:'false',
        istb:'false'
    },
    methods:{
        showDetail:function (item) {
            this.transporterBidId = item.transporterBid.id;
        },
        hideDetail:function () {
            this.transporterBidId = null;
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
        displayArr:function (arr) {
            if(!arr) {
                return "";
            }
            for(var index in arr) {

            }
        },
        viewImage:function (jobId) {
            app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+jobId+"/completeJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result) {
                    var imageArr,imageUrlArr = [];
                    if(result.length == 0) {
                        imageArr = tbdVue.message.noImageInfo ;
                    }else {
                        imageArr = [];
                        for(var index in result) {
                            var imageUrl = app.appOption.url + result[index]+ "?sspi="+app.appOption.getQueryParam("sspi");
                            imageUrlArr.push(imageUrl);
                            imageArr.push(app.appOption.imageOp.getImageStr(index));
                        }
                    }
                    $("#viewPicture").modal("show");
                    app.appOption.fileInput.destroy($("#showImage"));
                    app.appOption.fileInput.init($("#showImage"),{
                        initialPreview:imageArr
                    },false);
                    app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
                }

            },function (error) {
                console.log(error);
                $("#show-image").empty();
            })
        }
    },
    ready:function () {
        $(".box-body").removeClass("hide");
    }

});
