var auctionTable;
$(document).ready(function () {
	auctionTable = $("#auction-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
	    order:[],
        dom: 'Bfrtip',
        buttons: [
            {
                text: vm.message.viewTransporterComplete.button.exportExcel,
                extend:"excel",
                className:"btn btn-app-primary pull-left margin-bottom",
                customizeData:function (data) {
                    btExtend.exportObj.customerExportData(data,{
                        header:[vm.message.auctionProfitReport.table.auctionNo,
                                vm.message.auctionProfitReport.table.shipperTotal,
                                vm.message.auctionProfitReport.table.transporterTotal,
                                vm.message.auctionProfitReport.table.profitAmount,
                                vm.message.auctionProfitReport.table.margin],
                        subHeader:[],
                        fieldNames:["auctionNo","shipperTotal","transporterTotal","auctionProfit","profitMargin"],
                        subFieldNames:[],
                        subRowList:null,
                        ajaxParams:{
                            url:"v1/api/auction/viewAuctionProfitReport",
                            type:"post",
                            data:auctionProfit.searchData
                        }
                    });
                },
                action:function (e,dt,button,config) {
                    btExtend.exportObj.excelAction(this,e,dt,button,config);
                },
                exportOptions: {
                    modifier: {
                        page: 'all'
                    }
                }
            },
            {
                text: vm.message.viewTransporterComplete.button.exportPdf,
                extend:"pdf",
                className:"btn btn-app-primary pull-left margin-left-15 margin-bottom",
                customizeData:function (data) {
                    btExtend.exportObj.customerExportData(data,{
                        header:[vm.message.auctionProfitReport.table.auctionNo,
                            vm.message.auctionProfitReport.table.shipperTotal,
                            vm.message.auctionProfitReport.table.transporterTotal,
                            vm.message.auctionProfitReport.table.profitAmount,
                            vm.message.auctionProfitReport.table.margin],
                        subHeader:[],
                        fieldNames:["auctionNo","shipperTotal","transporterTotal","auctionProfit","profitMargin"],
                        subFieldNames:[],
                        subRowList:null,
                        ajaxParams:{
                            url:"v1/api/auction/viewAuctionProfitReport",
                            type:"post",
                            data:auctionProfit.searchData
                        }
                    });
                },
                action:function (e,dt,button,config) {
                    btExtend.exportObj.pdfAction(this,e,dt,button,config);
                },
                exportOptions: {
                    modifier: {
                        page: 'all'
                    }
                }
            }
        ],
        ajax:function (data,callback,settings) {
        	 data.columns[0].search.value = $("#auction-no-value").val();
        	 auctionProfit.searchData = data;
            app.appOption.ajax.url = app.appOption.url + "v1/api/auction/viewAuctionProfitReport";
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
                data:"shipperTotal"
            },
            {
                orderable:false,
                data:"transporterTotal"
            },
            {
                orderable:false,
                data:"auctionProfit"
            },
            {
                orderable:false,
                data:"profitMargin"
            }
        ]
    })).api();
    $("#search").bind("click",function () {
    	auctionTable.draw();
    });
});

var auctionProfit = {
    searchData:{}
};
window.auctionProfit = auctionProfit;
var vm = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
})
