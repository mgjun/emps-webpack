/**
 * Created by MENGJUN on 2017/2/14.
 */
var bidTable,tableOptions;
$(document).ready( function () {
    tableOptions = {
       order:[[1,'asc']],
        "ajax":function (data,callback,settings) {
            data.columns.push({
                data:"createdBy",
                name:"",
                searchable:true,
                orderable:false,
                search:{
                    value:$("#shipper-query-value").val(),
                    regex:false
                }
            });
            data.columns[0].search.value = $("#bid-no-value").val();
            data.columns[3].search.value = bid.statusArr.join(",");
            data.columns[5].search.value = $("#pickup-start-time").val() + "~" + $("#pickup-end-time").val();
            app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/platformViewShipperBid";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            //    {
            //        data:null,
            //        orderable:false,
            //        searchable:false,
            //        render:function (data, type, row, meta) {
            //            return '<input id="checkbox-'+row.id+'" name="checkbox" type="checkbox" class="checked-row-class minimal"/>';
            //        },
            //        sClass:"text-center"
            //    },
            // {
            //     orderable:false,
            //     "data":"actionNo"
            // },
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
            // {
            //     orderable:false,
            //     "data":"finalPrice",
            //     render:function (data, type, row, meta) {
            //         return app.appOption.formatOperation.priceDisplay(row.finalPrice);
            //     },
            //     "sClass":"text-right text-inline"
            // },
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
            // {
            //     "data":"auctionResultDate",
            //     "sClass":"text-center"
            // },
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
            }
        ],
        drawCallback:function () {
        	bid.initICheck();
        }
    };

    $(".select2").select2();
    $(".form_datetime").datepicker({
        format: "yyyy-mm-dd",
        todayHighlight:true,
        todayBtn:"linked",
        autoclose:true
    });

    $("input[name='status']").iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        bid.statusArr.push($(this).val());
        bid.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
        $("#status-display").val(bid.statusDisplayArr.join(","));
    }).on("ifUnchecked",function () {
        var index = bid.statusArr.indexOf($(this).val());
        var displayIndex = bid.statusDisplayArr.indexOf(app.appOption.displayStatus($(this).val()));
        bid.statusArr.splice(index,1);
        bid.statusDisplayArr.splice(displayIndex,1);
        $("#status-display").val(bid.statusDisplayArr.join(","));
    });

   //table additional search
   $("#search").bind("click",function () {
	   bidTable.draw();
   });
   $("#bid-send-email").bind("click",function () {
       bid.sendEmail();
   });
    bid.setDefaultStatus();

});

var bid = {
    statusArr:[],
    tcbObjArr:[],
    statusDisplayArr:[],
    bidId:null,
    timeInterval:null,
    setDefaultStatus:function () {
        $("#bid-no-value").val("");
        $("input[name='status'].minimal").each(function (index) {
            if($(this).val() == "match_unsuccess"
                || $(this).val() == "shipper_reject") {
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
    initICheck:function () {
        //iCheck for checkbox and radio inputs
        $(".checked-row-class").iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square-blue'
        }).on("ifChecked",function () {
            bid.tcbObjArr.push(bidTable.row($(this).closest("tr")).data());
            $("#bid-send-email").attr("disabled",false);
        }).on("ifUnchecked",function () {
            var index = bid.tcbObjArr.indexOf(bidTable.row($(this).closest("tr")).data());
            bid.tcbObjArr.splice(index,1);
            if(bid.tcbObjArr == null || bid.tcbObjArr.length == 0) {
                $("#bid-send-email").attr("disabled",true);
            }
        });
    },
    sendEmail:function () {
        app.appOption.alertify._init({
            ok:vm.message.button.yes,
            cancel:vm.message.button.no,
            confirmMsg:vm.message.sendEmailConfirm,
            confirmFn:function () {
                var objArr = [];
                for(var i=0;i<bid.tcbObjArr.length;i++) {
                    var obj = {};
                    obj.id = bid.tcbObjArr[i].id;
                    objArr.push(obj);
                };
                app.appOption.ajax.url = app.appOption.url+"v1/api/shipperBid/platformSendShipperEmail";
                app.appOption.ajax.type = "post";
                app.appOption.ajax.data = JSON.stringify(objArr);
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    app.appOption.alertify._init({
                        ok:vm.message.button.yes,
                        cancel:vm.message.button.no,
                        hideCancel:true,
                        confirmMsg:vm.message.sendEmailSuccess,
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
    }

};

window.bid = bid;

var vm = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
});4