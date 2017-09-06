var $ = require("jquery");
require("../lib/loading-overlay.min.js");
require("../css/font-self.css");
require("../css/pay.css");
$(document).ready(function () {
    pay.changeStatus();
   $("#paySuccessButton").bind("click",function () {
       window.close();
   })
});

var pay = {
    changeStatus:function () {
        	var url="";
        	if(app.appOption.getQueryParam("PayerID")==null){
        		url=app.appOption.url + "v1/api/payments/xfers/paySuccess/"+app.appOption.getQueryParam("shipperBidId")+"/"+app.appOption.getQueryParam("order_id")+"?sspi="+ app.appOption.getQueryParam("sspi");
        	}else{
        		url=app.appOption.url + "v1/api/payments/paypal/paySuccess/"+app.appOption.getQueryParam("shipperBidId")
                +"/"+app.appOption.getQueryParam("paymentId") + "/" + app.appOption.getQueryParam("PayerID");
        	}

            app.appOption.ajax.url = url;
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = "";
            app.appOption.ajax.requestWithStatus(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result.code == '-98') {
                    window.location.href = "payFailure.html?shipperBidId=" + app.appOption.getQueryParam("shipperBidId");
                }else {
                    $("#pay-success-box").removeClass("hide");
                }
            },function (error) {
                window.location.href = "payFailure.html?shipperBidId=" + app.appOption.getQueryParam("shipperBidId");
            })
        }
};
window.pay = pay;
var payVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
})