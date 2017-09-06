/**
 * Created by MENGJUN on 2017/3/8.
 */
function format ( row ) {
    // `d` is the original data object for the row
    var str = '<table class="table table-bordered sub-table">'+
        '<thead>' +
        '<td>'+vm.message.viewTransporterComplete.table.shipperBidNo+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.shipper+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.jobId+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.postalCodeOrigin+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.postalCodeDestination+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.distance+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.weight+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.volume+'</td>'+
        '<td>'+vm.message.viewTransporterComplete.table.status+'</td>'+
        '</thead>'+
        '<tbody>';

    if(row && row.jobList) {
        for( var i=0;i<row.jobList.length;i++) {
            var job = row.jobList[i];
            job.companyName = job.companyName?job.companyName:'';
            str +=  '<tr>' +
                '<td>'+job.shipperBidNo+'</td>'+
                '<td>'+job.companyName+'</td>'+
                '<td>'+job.id+'</td>'+
                '<td>'+job.pickupAddress+'</td>'+
                '<td>'+job.dropoffAddress+'</td>'+
                '<td>'+job.distance+'</td>'+
                '<td>'+job.weight+'</td>'+
                '<td>'+job.volume+'</td>'+
                '<td>'+app.appOption.displayStatus(job.status)+'</td>';
            str += '</tr>';
        }
    }else {
        str += '<tr>No available data found</tr>';
    }
    str += '</tbody></table>';

    return str;
}
var viewCompleteTable,tableOptions;
$(document).ready(function () {
    tableOptions = {
        "order": [[1, 'asc']],
        // paging:false,
        // "lengthMenu": [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
        dom: 'Bfrtip',
        buttons: [
            {
                text: vm.message.viewTransporterComplete.button.exportExcel,
                extend:"excel",
                className:"btn btn-app-primary pull-left margin-left-15 margin-bottom",
                customizeData:function (data) {
                    btExtend.exportObj.customerExportData(data,{
                        header:[vm.message.viewTransporterComplete.table.companyName,vm.message.viewTransporterComplete.table.transporterBidNo,
                            vm.message.viewTransporterComplete.table.auctionNo,vm.message.viewTransporterComplete.table.vehicleNo,
                            vm.message.viewTransporterComplete.table.finalCost,vm.message.viewTransporterComplete.table.status],
                        subHeader:[vm.message.viewTransporterComplete.table.shipperBidNo,vm.message.viewTransporterComplete.table.shipper,
                            vm.message.viewTransporterComplete.table.jobId, vm.message.viewTransporterComplete.table.postalCodeOrigin,
                            vm.message.viewTransporterComplete.table.postalCodeDestination,vm.message.viewTransporterComplete.table.distance,
                            vm.message.viewTransporterComplete.table.weight,vm.message.viewTransporterComplete.table.volume,
                            vm.message.viewTransporterComplete.table.status],
                        fieldNames:["companyName","bidNo","auctionNo","vehicleName","finalCost","tripStatus"],
                        subFieldNames:["shipperBidNo","companyName","id","pickupAddress","dropoffAddress",
                            "distance","weight","volume","status"],
                        subRowList:"jobList",
                        ajaxParams:{
                            url:"v1/api/transporterBid/viewCompleteTransporterBidReport",
                            type:"post",
                            data:viewComplete.searchData
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
                        header:[vm.message.viewTransporterComplete.table.companyName,vm.message.viewTransporterComplete.table.transporterBidNo,
                            vm.message.viewTransporterComplete.table.auctionNo,vm.message.viewTransporterComplete.table.vehicleNo,
                            vm.message.viewTransporterComplete.table.finalCost,vm.message.viewTransporterComplete.table.status],
                        subHeader:[vm.message.viewTransporterComplete.table.shipperBidNo,vm.message.viewTransporterComplete.table.shipper,
                            vm.message.viewTransporterComplete.table.jobId, vm.message.viewTransporterComplete.table.postalCodeOrigin,
                            vm.message.viewTransporterComplete.table.postalCodeDestination,vm.message.viewTransporterComplete.table.distance,
                            vm.message.viewTransporterComplete.table.weight,vm.message.viewTransporterComplete.table.volume,
                            vm.message.viewTransporterComplete.table.status],
                        fieldNames:["companyName","bidNo","auctionNo","vehicleName","finalCost","tripStatus"],
                        subFieldNames:["shipperBidNo","companyName","id","pickupAddress","dropoffAddress",
                            "distance","weight","volume","status"],
                        subRowList:"jobList",
                        ajaxParams:{
                            url:"v1/api/transporterBid/viewCompleteTransporterBidReport",
                            type:"post",
                            data:viewComplete.searchData
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
        ajax:function (data, callback, settings) {
            data.columns[7].search.value = viewComplete.statusFilterValue;
            viewComplete.searchData = data;
            app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/viewCompleteTransporterBidReport";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                viewComplete.tableData = result.data;
                callback(result);
            },function (error) {
                console.log(error);
            });
        },
        "columns":[
            {
                "className":      'details-control text-center',
                "orderable":      false,
                "data":           null,
                "defaultContent": '',
                render:function(data,type,row,meta) {
                    return '<i class="fa fa-plus-square fa-1x color-success"></i>'
                }
            },
            {
                className:"text-center",
                "orderable":      false,
                "data":           null,
                render:function(data,type,row,meta) {
                    return '<input id="select_'+meta.row+'" type="checkbox" class="checked-row-class minimal select-item" value="'+meta.row+'"/>';
                }
            },
            {
                "data":"companyName",
                "orderable":false
            },
            {
                "data":"bidNo",
                "render":function (data, type, row, meta) {
                    return '<a onclick="viewComplete.jumpToDetail(\''+row.transporterBidId+'\',\''+row.auctionNo+'\',\''+row.jobGroup+'\')">'+row.bidNo+'</a>'
                },
                "orderable":false
            },
            {
                "data":"auctionNo",
                orderable:false
            },
            {
                "data":"vehicleName",
                "orderable":false
            },
            {
                "data":"finalCost",
                orderable:false,
                render:function (data, type, row, meta) {
                    return app.appOption.formatOperation.priceDisplay(row.finalCost);
                },
                "sClass":"text-right text-inline"
            },
            {
                "data":"tripStatus",
                "searchable":false,
                "orderable":false,
                render:function (data, type, row, meta) {
                    return app.appOption.displayStatus(row.tripStatus);
                }
            }
        ],
        drawCallback:function () {
            $('#select-all').iCheck("uncheck");
            viewComplete.initICheck();
        }
    };

// Add event listener for opening and closing details
    $('#mbr-table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = viewCompleteTable.row( tr );

        if ( row.child.isShown() ) {
            row.child.hide();
            tr.removeClass('shown');
            $(this).find("i").addClass("fa-plus-square").removeClass("fa-minus-square");
        }
        else {
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
            $(this).find("i").addClass("fa-minus-square").removeClass("fa-plus-square");
        }
    } );

    viewComplete.setDefaultFilter();

    $('#select-all').iCheck({
        checkboxClass: 'icheckbox_square-blue'
    }).on("ifChecked",function () {
        if($(".select-item").length <= 0) {
            $("#pay-button").attr("disabled","disabled");
        }else {
            if(viewComplete.statusFilterValue === "complete") {
                $("#pay-button").attr("disabled",false);
            }
        }
        $(".select-item").iCheck("check");
    }).on("ifUnchecked",function () {
        $("#pay-button").attr("disabled","disabled");
        $(".select-item").iCheck("uncheck");
    });

    $(".status-filter").iCheck({
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        viewComplete.statusFilterValue = $(this).val();
        viewCompleteTable.draw();
    });


});

var viewComplete = {
    searchData:{},
    tableData:{},
    statusFilterValue:null,
    selectedRowIndex:[],
    setDefaultFilter:function () {
        debugger;
        $("input[name='tripStatus'].minimal").each(function (index) {
            if($(this).val() == "complete") {
                $(this).iCheck("check");
                viewComplete.statusFilterValue = $(this).val();
            }
        });
        viewCompleteTable = $("#mbr-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,tableOptions)).api();
    },
    initICheck:function () {
        var self = this;
        $('.select-item').iCheck({
            checkboxClass: 'icheckbox_square-blue'
        }).on("ifChecked",function () {
            if(viewComplete.statusFilterValue === "complete") {
                $("#pay-button").attr("disabled", false);
                self.selectedRowIndex.push($(this).val());
            }
        }).on("ifUnchecked",function () {
            var index = self.selectedRowIndex.indexOf($(this).val());
            if(index !== -1) {
                self.selectedRowIndex.splice(index,1);
            }
            if(self.selectedRowIndex.length <= 0) {
                $("#pay-button").attr("disabled","disabled");
            }
        });
    },
    pay:function () {
        var self = this,data = [];
        for(var selectedIndex in self.selectedRowIndex) {
           var rowSelector = $("#select_"+self.selectedRowIndex[selectedIndex]).closest("tr"),
               row = viewCompleteTable.row(rowSelector).data();
           data.push({
               "auctionNo":row.auctionNo,
               "transporterBidId":row.transporterBidId
           });
        }
        app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/platformPaid";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = JSON.stringify(data);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            viewCompleteTable.draw();
        },function (error) {
            console.log(error);
        })
    },
    jumpToDetail:function(transporterBidId,auctionNo,jobGroup){
        window.location.href = "./transporterBidDetail.html?transporterBidId="+transporterBidId+"&auctionNo="+auctionNo+"&jobGroup="+jobGroup+"&sspi="+app.appOption.getQueryParam("sspi");
    }
};

window.viewComplete = viewComplete;

var vm = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
})