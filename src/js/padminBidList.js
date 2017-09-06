/**
 * Created by MENGJUN on 2017/2/14.
 */
var refundTable;
$(document).ready( function () {
    refundTable = $("#refund-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
          data.columns[1].search.value = $("#bidNo-code-value").val();
            app.appOption.ajax.url = app.appOption.url+"v1/api/bidJob/viewRefundApplyJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
           {
               "data":"id"
           },                   
            {
        	   
        	   "orderable":false,
                "data":"shipperBidNo"
            },

            {
                "data":"finalPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.finalPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"sellingTotalPrice",
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.sellingTotalPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"cargoDescription"
            }, 
            {
                "data":"status",
                render:function (data, type, row, meta) {
                    return app.appOption.displayStatus(row.status);
                }
            } , 
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
               	 var refundButton = '<button onclick="refundObj.refund('+row.bidId+','+row.id+',\''+row.bidNo+'\','+row.jobPrice+')" class="btn btn-sm btn-app-danger zone-show-delete hide">'+refundVue.message.button.refund+'</button>';
                 
                 var str = "";
                 if("refund_apply" == row.status){
                     str = refundButton;
                 }
                 
                 return  str;
                }
            }
       
        ]
    })).api();

    $(".select2").select2();

    $("#refund-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+refundObj.refundUrl+"refund/"+refundObj.jobId;
        app.appOption.ajax.type="GET";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#refund").modal("hide");
            refundTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#bidNo-code-search").bind("click",function () {
    	refundTable.draw();
    });
});

var refundObj = {
    jobId:null,
    bidId:null,
    refundUrl:"v1/api/payments/paypal/",
    validator:null,
    refund:function (bidId,jobId,bidNo,jobPrice) {
    	this.bidId = bidId;
        this.jobId = jobId;
        refundVue.jobId = jobId;
        refundVue.jobPrice = app.appOption.formatOperation.priceDisplay(jobPrice);
        app.appOption.alertify._init({
            ok:refundVue.message.button.yes,
            cancel:refundVue.message.button.no,
            hideCancel:false,
            confirmMsg:refundVue.refundInfo.replace("{jobId}",refundVue.jobId).replace("{jobPrice}",app.appOption.formatOperation.priceDisplay(refundVue.jobPrice)),
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+refundObj.refundUrl+"refund/"+refundObj.jobId;
                app.appOption.ajax.type="GET";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    app.appOption.alertify._init({
                        ok:refundVue.message.button.yes,
                        cancel:refundVue.message.button.no,
                        hideCancel:true,
                        confirmMsg:refundVue.message.refundSuccess,
                        confirmFn:function (e) {
                            refundTable.draw();
                        }
                    })

                },function (error) {
                    console.log(error);
                });
            }
        });
    }
};
window.refundObj = refundObj;
var refundVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
    	jobId:null,
    	jobPrice:null
    },
    methods:{
        dealLanguages:function (info) {
            return info.replace("{jobId}",this.jobId).replace("{jobPrice}",this.jobPrice);
        }
    }
});
