/**
 * 1.如果bidVue.bidId存在，进行更新;不存在创建
 * 2.bid.bidVersion用于控制job是否在这个bid中
 * 3.bid.canNotCancel如果存在表示已操作job，不能对bid进行回退操作(duplicated)
 * Created by MENGJUN on 2017/2/14.
 */
var bidJobTable;
$(document).ready( function () {
    //get bid id from url param
    bidVue.bidId = app.appOption.getQueryParam("bidId") == "null" ? null : app.appOption.getQueryParam("bidId");
    //generate bid version
    if(app.appOption.getQueryParam("bv")) {
        bid.bidVersion = app.appOption.getQueryParam("bv") == "null" ? null : app.appOption.getQueryParam("bv");
    }else {
        bid.getBidVersion();
    }

    //if operated job,can not cancel
    bid.canNotCancel = app.appOption.getQueryParam("hasOperatedJob");


    bidJobTable= $("#job-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        paging:false,
        ordering:false,
        "ajax":function (data,callback,settings) {
            data.columns.push({
                data:"createFlag",
                name:"",
                searchable:true,
                orderable:false,
                search:{
                    value:bid.bidVersion,
                    regex:false
                }
            });
            data.columns.push({
                data:"bidId",
                name:"",
                searchable:true,
                orderable:false,
                search:{
                    value:bidVue.bidId,
                    regex:false
                }
            });
            app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/viewBidJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                if(result.data.length > 0) {
                    $("#bid-create-save").attr("disabled",false);
                }else{
                    $("#bid-create-save").attr("disabled",true);
                }
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            {
                "data":"id",
                orderable:false,
                render:function (data, type, row, meta) {
                    if(row.id < 0) return "-";
                    return row.id;
                }
            },
            {
                orderable:false,
                "data":"pickupAddress"
            },
            {
                orderable:false,
                "data":"dropoffAddress"
            },
            {
                "data":"jobPrice",
                orderable:false,
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.jobPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"sellingTotalPrice",
                orderable:false,
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.sellingTotalPrice);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data, type, row, meta) {
                    return '<button type="button" id="btn-'+row.id+'" class="btn btn-app-primary" onclick="bid.showDetail(\''+row.id+'\')">'+bidVue.message.button.view+'</button>' +
                        '<button type="button" id="btn-'+row.id+'" class="btn btn-app-primary" onclick="bid.edit(\''+row.id+'\')">'+bidVue.message.button.edit+'</button>'+
                        '<button type="button" id="btn-'+row.id+'" class="btn btn-app-danger" onclick="bid.delete(\''+row.id+'\')">'+bidVue.message.button.delete+'</button>';
                }
            }
        ],
        drawCallback:function (settings) {
            //计算价格
            bidVue.bidPrice = 0;
            bidVue.additionalServicePrice = 0;
            var _data = this.api().rows( {page:'current'} ).data();
            for(var index=0;index < _data.length;index++) {
                bidVue.bidPrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(bidVue.bidPrice,2) + Math.formatFloat(_data[index].jobPrice,2));
                bidVue.additionalServicePrice = app.appOption.formatOperation.priceFormat(Math.formatFloat(bidVue.additionalServicePrice,2) + Math.formatFloat(_data[index].sellingTotalPrice,2));
            }

            //如果job出现变化，不能进行取消操作
            // if(bid.canNotCancel) {
            //     $("#bid-cancel-button").addClass("hide");
            // }
        }
    })).api();

    // if(app.isEmpty(bidVue.bidId)) {
    //     bidJobTable.column(0).visible(false);
    // }

    $("#bid-create-save").bind("click",function () {
        var validator = bid.formValidate($("#bid-create-form"));
        if(!validator.form()) {
            return;
        }
        var jobArr = [];
        bidJobTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            jobArr.push(this.data());
        });
        var bidObj = $("#bid-create-form").serializeObject();
        // bidObj.bidJobDtoList = jobArr;
        bidObj.bidJobDtoList = null;
        if(bidVue.bidId) {
            app.appOption.ajax.url = app.appOption.url+bid.url+"updateShipperBid";
            app.appOption.ajax.type = "put";
        }else {
            app.appOption.ajax.url = app.appOption.url+bid.url+"createShipperBid";
            app.appOption.ajax.type = "POST";
        }
        app.appOption.ajax.data = JSON.stringify(bidObj);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            // var cancelStr = app.isEmpty(bidVue.bidId) ? "Create More" : "Continue";
            app.appOption.alertify._init({
                ok:bidVue.message.button.yes,
                cancel:bidVue.message.button.no,
                hideCancel:true,
                confirmMsg:bidVue.message.bidSaveSuccessInfo.replace("{bidNo}",result.bidNo),
                confirmFn:function (e) {
                    window.location.href = "./shipperBidsView.html?sspi="+app.appOption.getQueryParam("sspi");
                },
                cancelFn:function (e) {
                    window.location.href = app.isEmpty(bidVue.bidId) ?
                        "./shipperCreateBid.html?sspi="+app.appOption.getQueryParam("sspi") :
                        "./shipperCreateBid.html?bidId="+bidVue.bidId+"&sspi="+app.appOption.getQueryParam("sspi");
                }
            });
        },function (error) {
            console.log(error);
        })
    });


    $("#add-job").bind("click",function () {
        window.location.href='shipperCreateJob.html?sspi='+app.appOption.getQueryParam('sspi') + "&bv=" + bid.bidVersion + "&bidId="+bidVue.bidId;
    });
    // if($("#job-table").find("tr").length>1) {
    //     $("#bid-create-save").attr("disabled",false);
    // }

    //delete job
    $("#job-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+"/v1/api/bidJob/deleteBidJob/"+bid.jobId;
        app.appOption.ajax.type = "delete";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteJobModal").modal("hide");
            bidJobTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    // if bidNo exist,load bid info by bidNo
    // if(app.appOption.getQueryParam("bidNo")) {
    //     bid.loadBidByBidNo(app.appOption.getQueryParam("bidNo"));
    // }
});

var bid = {
    url:"v1/api/shipperBid/",
    jobUrl:"v1/api/bidJob",
    bidVersion:null,
    canNotCancel:null,
    jobId:null,
    loadBidByBidNo:function (bidNo) {
        app.appOption.ajax.url = app.appOption.url + bid.url + "findShipperBidByBidNo/"+bidNo;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                bidJobTable.rows.add(result.bidJobDtoList);
            }
        },function (error) {
            console.log(error);
        })
    },
    backToBidView:function () {
      window.location.href = "./shipperBidsView.html?sspi="+app.appOption.getQueryParam("sspi");
    },
    edit:function (id) {
        window.location.href='shipperCreateJob.html?sspi='+app.appOption.getQueryParam('sspi') + "&bv=" + bid.bidVersion + "&bidId="+bidVue.bidId + "&jobId="+id;
    },
    delete:function (jobId) {
        this.jobId = jobId;
        // $("#deleteJobModal").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/deleteBidJob/"+bid.jobId;
                app.appOption.ajax.type = "delete";
                app.appOption.ajax.data = "";
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteJobModal").modal("hide");
                    bidJobTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (formObj) {
        return formObj.validate({
            rules:{
                bidPrice:{
                    required:true,
                    number:true,
                    maxlength:14,
                    bigZero:true
                }
            },
            messages:{
                bidPrice:{
                    required:bidVue.message.validate.require,
                    number:bidVue.message.validate.number,
                    maxlength:bidVue.message.validate.maxlength.replace("{0}","14"),
                    bigZero:bidVue.message.validate.bigZero.replace("{0}","bid Price")
                }
            },
            errorPlacement:function (error, element) {
                element.closest("div").addClass("has-error").removeClass("has-success").append(error);
            },
            success:function (label) {
                label.closest("div").addClass("has-success").removeClass("has-error");
                label.remove();
            }
        });
    },
    showDetail:function (id) {
        // app.appOption.ajax.url = app.appOption.url+"/v1/api/bidJob/findPackageByJobId/"+id;
        // app.appOption.ajax.type = "post";
        // app.appOption.ajax.data = "";
        // app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        //     console.log(result);
        //     bidVue.jobPackageDetail = result;
            bidVue.currentJob = bidJobTable.row($("#btn-"+id).closest("tr")).data();
            $("#showDetailModal").modal("show");
        // },function (error) {
        //     console.log(error);
        // });
    },
    getBidVersion:function () {
        app.appOption.ajax.url = app.appOption.url + bid.jobUrl + "/getUUID";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = JSON.stringify({
                shipperBidId:app.isEmpty(bidVue.bidId) ? null : bidVue.bidId
        });
        app.appOption.ajax.asyncRequest(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            bid.bidVersion = result;
        },function (error) {
            console.log(error);
        })
    }
};
window.bid = bid;
var bidVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        bidId:null,
        bidInfo:{},
        jobPackageDetail:{},
        currentJob:{},
        bidPrice:0,
        additionalServicePrice:0,
        totalPrice:0
    },
    computed:{
        countTotalPrice:function () {
            return app.appOption.formatOperation.priceFormat(Math.formatFloat(this.bidPrice,2) + Math.formatFloat(this.additionalServicePrice,2));
        }
    }
});



