var $ = require("jquery");
require("../lib/loading-overlay.min.js");
require("../css/font-self.css");
require("../css/pay.css");
$(document).ready(function () {
   $("body").loadingOverlay({
       loadingText: commonMsg.messages.waiting
   })
});