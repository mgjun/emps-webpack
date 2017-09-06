/**
 * Created by MENGJUN on 2017/2/14.
 */
var bidTable,tableOptions;
$(document).ready( function () {
    tableOptions = {
       order:[[1,'asc']],
        "ajax":function (data,callback,settings) {
            data.columns[1].search.value = $("#bid-no-value").val();
            data.columns[6].search.value = bid.statusArr.join(",");
            app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/viewShipperBid";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            {
                orderable:false,
                "data":"actionNo"
            },
            {
                "data":"bidNo",
                "render":function (data, type, row, meta) {
                    return '<a href="./shipperBidDetail.html?shipperBidNo='+row.bidNo+'&sspi='+app.appOption.getQueryParam('sspi')+'">'+row.bidNo+'</a>'
                }
            },
            {
                orderable:false,
                "data":"bidPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.bidPrice);
                },
                "sClass":"text-right text-inline"
            },   
            {
                orderable:false,
                "data":"finalPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.finalPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                orderable:false,
                "data":"sellingPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.sellingPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                orderable:false,
                "data":"paypalFee",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.paypalFee);
                },
                "sClass":"text-right text-inline"
            },
            {
                orderable:false,
                "data":"status",
                render:function (data, type, row, meta) {
                    return app.appOption.displayStatus(row.status);
                }
            },
            {
                "data":"auctionRunDate",
                "orderable":false,
                render:function (data, type , row , meta) {
                    return app.dateTimeFormat(data);
                },
                "sClass":"text-center"
            },
            {
                orderable:false,
                "data":"scheduleTime",
                render:function (data, type, row, meta) {
                    if(!app.isEmpty(row.scheduleDate)) {
                        return app.dateFormat(row.scheduleDate) + " " + app.timeFormat(row.scheduleTime);
                    }else {
                        return app.timeFormat(row.scheduleTime);
                    }
                },
                sClass:"text-center"
            },

//             {
//                 "data":"scheduleDate",
// /*                render:function (data, type, row, meta) {
//                     return app.dateFormat(row.scheduleDate);
//                 },*/
//                 sClass:"text-center"
//             },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                	 var viewButton = '<button onclick="bid.jumpToDetail(\''+row.bidNo+'\')" class="btn btn-app-primary">'+payBidVue.message.button.view+'</button>';
                    var editButton = '<button onclick="bid.edit(\''+row.id+'\')" class="btn btn-app-primary">'+payBidVue.message.button.edit+'</button>';
                    var deleteButton = '<button onclick="bid.delete('+row.id+',\''+row.bidNo+'\')" class="btn btn-app-danger">'+payBidVue.message.button.delete+'</button>';
                    var rejectButton = '<button onclick="bid.reject('+row.id+')" class="btn btn-app-danger hide">'+payBidVue.message.button.reject+'</button>';
                    var revokeButton = '<button onclick="bid.revoke('+row.id+')" class="btn btn-xs btn-app-danger">'+payBidVue.message.button.revoke+'</button>';
                    var submitButton = '<button onclick="bid.submit('+row.id+')" class="btn btn-app-primary">'+payBidVue.message.button.submit+'</button>';
                    var payButton = '<button onclick="bid.pay('+row.id+',\''+row.bidNo+'\')" class="btn btn-app-primary">'+payBidVue.message.button.pay+'</button>';
                    //var viewResultButton = '<button onclick="window.location.href=\'matchBidResult.html\'" class="btn btn-app-primary">'+payBidVue.message.button.viewResult+'</button>';
                    var str = viewButton;
                    if("draft" == row.status){
                        str += editButton+submitButton+deleteButton;
                    }else if("submitted" == row.status) {
                        str = viewButton+revokeButton;
                    }else if("match_unsuccess" == row.status) {
                    	 str = viewButton;
                    }else if("wait_payment" == row.status){
                        str = str+payButton+rejectButton;
                    }
                    
                    return  str;
                }
            }
        ]
       
    };

    $(".select2").select2();
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        bid.statusArr.push($(this).val());
        bid.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
        $("#status-display").val(bid.statusDisplayArr.reverse().join(","));
    }).on("ifUnchecked",function () {
        var index = bid.statusArr.indexOf($(this).val());
        var displayIndex = bid.statusDisplayArr.indexOf(app.appOption.displayStatus($(this).val()));
        bid.statusArr.splice(index,1);
        bid.statusDisplayArr.splice(displayIndex,1);
        $("#status-display").val(bid.statusDisplayArr.reverse().join(","));
    });

    // $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck("uncheck");

   //save delete bid
   $("#bid-delete-save").bind("click",function () {
       app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/deleteShipperBid/"+bid.bidId;
       app.appOption.ajax.type="delete";
       app.appOption.ajax.data=null;
       app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
           $("#deleteBid").modal("hide");
           bidTable.draw();
       },function (error) {
           console.log(error);
       });
   });
   
   //table additional search
   $("#search").bind("click",function () {
	   bidTable.draw();
   });

   $("#pay-failed").bind("click",function () {
      window.history.go(0);
   });
    $("#pay-success").bind("click",function () {
        window.history.go(0);
    });

    $("#bid-show-add").bind("click",function () {
        bid.create();
    });
    bid.setDefaultStatus();

});

var bid = {
    statusArr:[],
	statusDisplayArr:[],
	bidId:null,
	timeInterval:null,
    setDefaultStatus:function () {
        $("#bid-no-value").val("");
        $("input[name='status'].minimal").each(function (index) {
            if($(this).val() == "draft"
                || $(this).val() == "submitted"
                || $(this).val() == "match_success"
                || $(this).val() == "wait_payment") {
                $(this).iCheck("check");
            }
            var hasChecked = $(this).closest("div").hasClass("checked");
            var temp = bid.statusArr.indexOf($(this).val());
            if(hasChecked && temp === -1) {
                bid.statusArr.push($(this).val());
                bid.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
            }
        });
        bidTable = $("#bid-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,tableOptions)).api();
    },
    delete:function (bidId,bidNo) {
        this.bidId = bidId;
        // $("#deleteBid").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/deleteShipperBid/"+bid.bidId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteBid").modal("hide");
                    bidTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    create:function () {
        window.location.href='shipperCreateBid.html?bidNo=null&sspi='+app.appOption.getQueryParam('sspi')
    },
    edit:function (bidId) {
        window.location.href = "shipperCreateBid.html?bidId="+bidId+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    submit:function (id) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/submitShipperBid/"+id;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        	bidTable.draw();
        },function (error) {
            console.log(error)
        })
    },
    getPayStatus:function (id) {
        app.appOption.ajax.url = app.appOption.url + "v1/api/shipperBid/findPaymentShipperBidStatus/"+id;
        app.appOption.ajax.type = "put";
        app.appOption.ajax.data = "";
        app.appOption.ajax.requestWithStatus(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result.result != "SUCCESS" && result.code == "-77") {//waiting pay
                setTimeout(function () {
                    bid.getPayStatus(id);
                },1000);
            }else if(result.result != "SUCCESS" && result.code == "-88") {//pay failed
                $(".content").loadingOverlay("remove");
                $("#payAlert").modal("hide");
                bidTable.draw();
            }else if(result.result == "SUCCESS") {//pay success
                $(".content").loadingOverlay("remove");
                $("#payAlert").modal("hide");
                bidTable.draw();
            }
        },function (error) {
            console.log(error);
        },"noLoading");
    },
    pay:function (id,bidNo) {
        this.bidId = id;
    	payBidVue.bidNo = bidNo;
        bid.findSystemSettingByKey("PaymentMethod",function (result) {
            if(result) {
                var typeArr = result.value.split("|"),dataArr = [];
                for(var index in typeArr) {
                    if("paypal" == typeArr[index]) {
                        dataArr.push({
                            type:"paypal",
                            imageUrl:"../img/btn_paywith_primary_m.png"
                        })
                    }else if("xfers" == typeArr[index]){
                        dataArr.push({
                            type:"xfers",
                            imageUrl:"../img/xfers_button.png"
                        })

                    }
                }
                payBidVue.payButtons = dataArr;
            }else {
                payBidVue.payButtons = [];
            }
        });
        $("#payAlert").modal({
            backdrop:"static",
            show:true
        });
    },
    payWithPaypal:function (id) {
        $("#paypal-button").empty();
        var w = window.open();
        w.location.href = "./payLoading.html";
        $(".content").loadingOverlay({
            loadingText:payBidVue.message.waiting
        });
        $.ajax({
            url:app.appOption.url + "v1/api/payments/paypal/create/"+id + "?sspi="+app.appOption.getQueryParam("sspi"),
            type:"post",
            data:"",
            dataType:"json",
            success:function (result) {
                if(result.result != 'SUCCESS') {
                    toastr.error(result.message);
                }else {
                    w.location.href = result.data;
                    bid.getPayStatus(id);
                }
            },
            error:function (error) {
                console.log(error);
                $(".content").loadingOverlay("remove");
                toastr.error("request failed!");
            }
        });
    },
    payWithXfers:function (id) {
        $("#paypal-button").empty();
        var w = window.open();
        w.location.href = "./payLoading.html";
        $(".content").loadingOverlay({
            loadingText:payBidVue.message.waiting
        });
        $.ajax({
            url:app.appOption.url + "v1/api/payments/xfers/create/"+id + "?sspi="+app.appOption.getQueryParam("sspi"),
            type:"post",
            data:"",
            dataType:"json",
            success:function (result) {
                if(result.result != 'SUCCESS') {
                    toastr.error(result.message);
                }else {
                    w.location.href = result.data;
                    bid.getPayStatus(id);
                }
            },
            error:function (error) {
                console.log(error);
                $(".content").loadingOverlay("remove");
                toastr.error("request failed!");
            }
        });
    },
    reject:function (id) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/rejectShipperBid/"+id;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        	bidTable.draw();
        },function (error) {
            console.log(error)
        })
    },
	revoke:function (id) {
        app.appOption.alertify._init({
            ok:payBidVue.message.button.yes,
            cancel:payBidVue.message.button.no,
            confirmMsg:payBidVue.message.revokeInfo,
            confirmFn:function () {
                app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/revokeShipperBid/"+id;
                app.appOption.ajax.type = "PUT";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    app.appOption.alertify._init({
                        ok:payBidVue.message.button.yes,
                        cancel:payBidVue.message.button.no,
                        hideCancel:true,
                        confirmMsg:payBidVue.message.revokeSuccess,
                        confirmFn:function () {
                            bidTable.draw();
                        }
                    });
                },function (error) {
                    console.log(error)
                })
            }

        });
    },
	jumpToDetail:function(bidNo){
		window.location.href = "./shipperBidDetail.html?shipperBidNo="+bidNo+"&sspi="+app.appOption.getQueryParam('sspi');
	},
    findSystemSettingByKey:function(type,successFn) {
        app.appOption.ajax.url = app.appOption.url + "v1/api/setting/findSettingByKey/"+type;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,successFn,function (error) {
            console.log(error);
        })
    }

};
window.bid = bid;
var payBidVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        bidNo:null,
        payButtons:[]
    },
    methods:{
        payClick:function (payType) {
            if("paypal" == payType) {
                bid.payWithPaypal(bid.bidId);
            }else if("xfers" == payType) {
                bid.payWithXfers(bid.bidId);
            }
        },
        replaceBidNo:function (str) {
            return str.replace("{bidNo}",this.bidNo);
        }
    }
});