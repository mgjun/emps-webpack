/**
 * Created by MENGJUN on 2017/3/8.
 */
function doUpload() {
    var formData = new FormData($( "#testFile-form" )[0]);
    $.ajax({
        url: app.appOption.url + "v1/api/auction/sendMsg?sspi=" + app.appOption.getQueryParam("sspi"),
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function (returndata) {
            app.toastr.info(returndata);
        },
        error: function (returndata) {
            app.toastr.error(returndata);
        }
    });
}
var auctionTable;
$(document).ready(function () {
	auctionTable = $("#auction-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
	    order:[],
        ajax:function (data,callback,settings) {
            app.appOption.ajax.url = app.appOption.url + auctionResult.url + "viewAuctionManagementResult";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                callback(result);
            },function (error) {
                console.log(error);
            })
        },
        columns:[
            {
                orderable:false,
                data:"auctionNo"
            },
            {
                orderable:false,
                data:"noOfBids"
            },
            {
                orderable:false,
                data:"successfulBids"
            },
            {
                orderable:false,
                data:"unsuccessfulBids"
            },
            {
                orderable:false,
                data:"status",
                render:function (data, type, row, meta) {
                    if("Sent" == row.status) {
                        return '<span class="span-error">'+row.status+'</span>';
                    }else if("Completed" == row.status) {
                        if(0 < parseInt(row.successfulBids)) {
                            return '<span class="span-success">'+row.status+'</span>';
                        }else if(0 == parseInt(row.successfulBids)) {
                            return '<span class="span-info">'+row.status+'</span>';
                        }
                    }
                }
            },
            {
                orderable:false,
                data:"startDate",
                render:function (data,type,row,meta) {
                    return app.dateTimeFormat(data);
                },
                "sClass":"text-center"
            },
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    var viewResultButton = '<button onclick="auctionResult.viewResult(\''+row.id+'\')" class="btn btn-app-primary">'+vm.message.auctionMatchResult.button.viewResult+'</button>';
                    // var deleteButton = '<button onclick="auctionResult.delete(\''+row.id+'\')" class="btn btn-app-danger">delete</button>';
                    return viewResultButton;
                }
            }
        ]
    })).api();
	//save create setting
	$("#sendMsg").bind("click",function () {
	    app.appOption.ajax.url= app.appOption.url + auctionResult.url+"sendMsgTest";
	    app.appOption.ajax.type="post";
	    app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {

	    	auctionTable.draw();
	    },function (error) {
	        console.log(error);
	    });
	});
	//save create setting
	// $("#deleteAuction").bind("click",function () {
	//     app.appOption.ajax.url= app.appOption.url + auctionResult.url+"deleteAuction";
	//     app.appOption.ajax.type="post";
	//     app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
    //
	//     	auctionTable.draw();
	//     },function (error) {
	//         console.log(error);
	//     });
	// });
});

var auctionResult = {
    url: "v1/api/auction/",
    viewResult: function (id) {
        app.appOption.ajax.url = app.appOption.url + "v1/api/auction/view/" + id;
        app.appOption.ajax.type = "get";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#viewResult").modal("show");
            $("#result-content").text(result.returnMsg);
        },function (error) {
            console.log(error);
        })
    },
    delete:function (id) {
        app.appOption.alertify._init({
            confirmFn:function () {
                app.appOption.ajax.url = app.appOption.url + "v1/api/auction/deleteSendAuction";
                app.appOption.ajax.type = "post";
                app.appOption.ajax.data = "";
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    auctionTable.draw();
                },function (error) {
                    console.log(error);
                })
            }
        });

    }
};
window.auctionResult = auctionResult;
var vm = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
});