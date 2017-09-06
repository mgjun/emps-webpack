var $ = require("jquery");
require("../lib/loading-overlay.min.js");
require("../css/font-self.css");
require("../css/pay.css");
$(function(){
    payFailed.changeStatus();
	$('#OK').click(function(){
		window.close();
	})
});

var payFailed = {
    changeStatus:function () {
        app.appOption.ajax.url = app.appOption.url + "v1/api/payments/paypal/payFailure/"+app.appOption.getQueryParam("shipperBidId");
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
			$("#pay-failure-div").removeClass("hide");
        },function (error) {
            console.log(error);
            $("#pay-failure-div").removeClass("hide");
        })
    }
};

window.payFailed = payFailed;
var vm = new Vue({
	i18n:commonMsg.i18n,
	el:".content",
	data:{
	    message:commonMsg.messages
	}
})