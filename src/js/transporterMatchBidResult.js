/**
 * Created by MENGJUN on 2017/3/8.
 */
function format ( row ) {
    // `d` is the original data object for the row
    var str = '<table class="table table-bordered">'+
                '<thead>' +
                    '<td>'+bmrVue.message.transporterMatchBidResult.table.jobId+'</td>'+
                    '<td>'+bmrVue.message.transporterMatchBidResult.table.postalCodeOrigin+'</td>'+
                    '<td>'+bmrVue.message.transporterMatchBidResult.table.postalCodeDestination+'</td>'+
                    '<td>'+bmrVue.message.transporterMatchBidResult.table.status+'</td>'+
                    '<td>'+bmrVue.message.table.function+'</td>'+
                '</thead>'+
                '<tbody>';


    for( var i=0;i<row.jobList.length;i++) {
        var job = row.jobList[i];
        str +=  '<tr>' +
                    '<td><a onclick="bmr.viewJob(\''+row.transporterBidId+'\',\''+job.id+'\')">'+job.id+'</a></td>'+
                    '<td>'+job.pickupAddress+'</td>'+
                    '<td>'+job.dropoffAddress+'</td>'+
                    '<td>'+app.appOption.displayStatus(job.status)+'</td>';
        var completeButton = '<button onclick="bmr.complete(1,\''+job.id+'\')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.complete+'</button>';
        var viewImageButton = '<button onclick="bmr.viewImage(\''+job.id+'\')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.pod+'</button>';
        var buttonStr = "";
        if("complete" == job.status){
            buttonStr = buttonStr+viewImageButton;
        }else if("shipper_paid" == job.status) {
            buttonStr = buttonStr+completeButton;
        }
        str+='<td>'+buttonStr+'</td>';
        str += '</tr>';
    }

    str += '</tbody></table>';

    return str;
}
var bmrTable;
$(document).ready(function () {
	bmrTable = $("#mbr-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "order": [[1, 'asc']],
        ajax:function (data, callback, settings) {
            data.columns.push({
                data:"transporterBidId",
                name:"",
                searchable:true,
                orderable:false,
                search:{
                    value:app.appOption.getQueryParam("transporterBidId"),
                    regex:false
                }
            });
            data.columns[1].search.value = $("#bid-no-value").val();
            data.columns[6].search.value = bmr.statusArr.join(",");
            app.appOption.ajax.url = app.appOption.url+bmr.url+"viewMatchJob";
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
                "className":      'details-control text-center',
                "orderable":      false,
                "data":           null,
                "defaultContent": '',
                render:function(data,type,row,meta) {
                    return '<i class="fa fa-plus-square fa-1x color-success"></i>'
                }
            },
           {
               "data":"bidNo",
               "render":function (data, type, row, meta) {
                   return '<a onclick="bmr.jumpToDetail(\''+row.transporterBidId+'\',\''+row.auctionNo+'\',\''+row.jobGroup+'\')">'+row.bidNo+'</a>'
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
                "data":"driverName",
                "orderable":false
            },
//            {
//                "data":"cost",
//                render:function (data, type, row, meta) {
//                    return app.appOption.formatOperation.priceDisplay(row.cost);
//                },
//                "sClass":"text-right text-inline"
//            },
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
            }, 
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    var acceptButton = '<button onclick="bmr.accept(\''+row.transporterBidId+'\',\''+row.auctionNo+'\','+row.driverId+')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.accept+'</button>';
                    var rejectButton = '<button onclick="bmr.reject(\''+row.transporterBidId+'\',\''+row.auctionNo+'\')" class="btn btn-app-danger hide">'+bmrVue.message.button.reject+'</button>';
                    // var completeButton = '<button onclick="bmr.complete('+row.id+','+row.jobId+')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.view+'</button>';
                   // var viewJobButton = '<button onclick="bmr.viewJob('+row.id+',\''+row.jobId+'\')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.viewJob+'</button>';
                    var assignedDriver = '<button onclick="bmr.viewDriver(\''+row.driverId+'\')" class="btn btn-xs btn-app-primary">'+bmrVue.message.button.assignedDriver+'</button>';
                    var str = "";
                    if("match_success" == row.tripStatus){
                        str = str+acceptButton+rejectButton;
                    }
                    if("accept_job" == row.tripStatus && row.driverId) {
                        str = str + assignedDriver;
                    }
                    return  str;

                }
            }
        ]
    })).api();
// Add event listener for opening and closing details
    $('#mbr-table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = bmrTable.row( tr );

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

    $("#search").bind("click",function () {
       bmrTable.draw();
    });

    //初始化显示
    // $(".dropdown-toggle").dropdown('toggle');

    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        bmr.statusArr.push($(this).val());
        bmr.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
        $("#status-display").val(bmr.statusDisplayArr.reverse().join(","));
    }).on("ifUnchecked",function () {
        var index = bmr.statusArr.indexOf($(this).val());
        var displayIndex = bmr.statusDisplayArr.indexOf(app.appOption.displayStatus($(this).val()));
        bmr.statusArr.splice(index,1);
        bmr.statusDisplayArr.splice(displayIndex,1);
        $("#status-display").val(bmr.statusDisplayArr.reverse().join(","));
    });


    $("#transporter-save-images").bind("click",function () {
        app.appOption.fileInput.validate.valid();
        app.appOption.fileInput.upload($("#transporterImages"));
    });
    $("#tImages-cancel").bind("click",function () {
        $("#uploadPics").modal("hide");
    });
    $("#close-job-info").bind("click",function () {
        $("#viewJobInfo").modal("hide");
        $("#showJobImageLoading").removeClass("hide");
        $("#showJobImage").addClass("hide");
    });

    bmr.setDefaultStatus();

    $("#accept-job-save").bind("click",function () {
        var formData = $("#accept-job-form").serializeObject();
        var validator = bmr.formValidate($("#accept-job-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/acceptJob/"+bmr.auctionNo+"/"+bmr.transporterBidId;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = JSON.stringify(formData);
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#acceptJobModal").modal("hide");
            bmrTable.draw();
        },function (error) {
            console.log(error)
        })
    });

    $("#accept-job-cancel").bind("click",function () {
        $("#acceptJobModal").modal("hide");
    })
});

var bmr = {
    url:"v1/api/transporterBid/",
    driverUrl:"v1/api/driver/",
    id:null,
    statusArr:[],
    statusDisplayArr:[],
    auctionNo:null,
    transporterBidId:null,
    viewDriver:function (driverId) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/driver/findDriverById/"+driverId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:driverId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                bmrVue.driverInfo = result;

                var attachFiles = result.attachmentFileDtos,imageArr = [];
                if(attachFiles) {
                    for(var index in attachFiles) {
                        var attach = attachFiles[index];
                        imageArr.push('<img src="data:image/jpeg;base64,'+attach.file+'" class="file-preview-image kv-preview-data max-file-preview-image"/>');
                    }
                }
                $("#viewDriverModal").modal("show");
                $("#edit-rating").raty($.extend({},{
                    number: 5,
                    score:bmrVue.driverInfo.rating,
                    targetType: 'number',
                    cancelOff: 'cancel-off.png',
                    cancelOn: 'cancel-on.png',
                    path:"../plugins/rating/img/",
                    size: 24,
                    starHalf: 'star-half.png',
                    starOff: 'star-off.png',
                    starOn: 'star-on.png',
                    cancel: false,
                    readOnly:true
                }));
                app.appOption.fileInput.destroy($("#driver-attachmentImages"));
                app.appOption.fileInput.init($("#driver-attachmentImages"),{
                    initialPreview: imageArr
                }, false);

                $("#show-portrait").attr("src",app.appOption.url + "getImageByBusinessId/"+result.id+"?sspi="+app.appOption.getQueryParam("sspi"));
            }

        },function (error) {
            console.log(error);
        })

    },
    setDefaultStatus:function () {
        $("input[name='status'].minimal").each(function (index) {
            if($(this).val() == "match_success"
                || $(this).val() == "accept_job"
                || $(this).val() == "shipper_paid"
                || $(this).val() == "wait_payment"
                || $(this).val() == "complete") {
                $(this).iCheck("check");
            }
        });
        bmrTable.draw();
    },
    accept:function (transporterBidId,auctionNo,driverId) {
        $("#accept-job-form").resetValue().resetValidation();
        this.auctionNo = auctionNo;
        this.transporterBidId = transporterBidId;
        app.appOption.ajax.url = app.appOption.url+bmr.driverUrl+"findAllDriver";
		app.appOption.ajax.type = "POST";
		app.appOption.ajax.data = null;
		app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
			bmrVue.drivers = result;
			var flag = false;
            if(bmrVue.drivers) {
                for(var index in bmrVue.drivers) {
                    if(bmrVue.drivers[index].id === driverId) {
                        flag = true;
                    }
                }
            }
            if(!flag) {
                bmrVue.driverInfo.driverId = '';
            }else {
                bmrVue.driverInfo.driverId = driverId ? driverId : '';
            }
		},function (error) {
			console.log(error);
		});
        $("#acceptJobModal").modal("show");
    },
    reject:function (transporterBidId,auctionNo) {
        app.appOption.ajax.url = app.appOption.url+"v1/api/transporterBid/rejectJob/"+auctionNo+"/"+transporterBidId;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            bmrTable.draw();
        },function (error) {
            console.log(error)
        })
    },
    complete:function (id,jobId) {
        this.id = id;
        $("#uploadPics").modal("show");
        app.appOption.fileInput.destroy($("#transporterImages"));
        //file upload settings
        app.appOption.fileInput.init($("#transporterImages"),{
            uploadUrl:app.appOption.url+"v1/api/transporterBid/completeJob/"+bmr.id+"/"+jobId+"?sspi="+app.appOption.getQueryParam('sspi'),//no use
            ajaxSettings:{
                beforeSend:function () {
                    $(".content").loadingOverlay({loadingText:"waiting"});
                },
                complete:function () {
                    $(".content").loadingOverlay("remove");
                },
                success:function (data) {
                    var bootResponse = data;
                    if(bootResponse.code == 1) {
                        $(".file-input").find(".progress").html('<div class="text-center back-error color-white">error</div>');
                        $(".file-preview-loading").removeClass("file-preview-loading");
                        $(".file-uploading").removeClass("file-uploading");
                        toastr.error(data.message);
                    }else{
                        $(".file-input").find(".progress").html('<div class="text-center back-main color-white">success</div>');
                        $(".file-preview-loading").removeClass("file-preview-loading");
                        $(".file-uploading").removeClass("file-uploading");
                        $("#uploadPics").modal("hide");
                        bmrTable.draw();
                        // window.history.go(0);
                    }
                    $("#transporterImages").attr("disabled",false);

                },
                error:function () {
                    $(".file-input").find(".progress").html('<div class="text-center back-error color-white">error</div>');
                    $(".file-preview-loading").removeClass("file-preview-loading");
                    $(".file-uploading").removeClass("file-uploading");
                    $("#transporterImages").attr("disabled",false);
                    toastr.error(data.message);
                }
            }
        },true);
    },
    jumpToDetail:function(transporterBidId,auctionNo,jobGroup){
        window.location.href = "./transporterBidDetail.html?transporterBidId="+transporterBidId+"&auctionNo="+auctionNo+"&jobGroup="+jobGroup+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    viewImage:function(id){
        app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+id+"/completeJob";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                var imageArr,imageUrlArr = [];
                if (result.length == 0) {
                    imageArr = bmrVue.message.noImageFound;
                } else {
                    imageArr = [];
                    for (var index in result) {
                        var imageUrl = app.appOption.url + result[index] + "?sspi=" + app.appOption.getQueryParam("sspi");
                        imageUrlArr.push(imageUrl);
                        imageArr.push(app.appOption.imageOp.getImageStr(index));
                    }
                }
                $("#viewPicture").modal("show");
                app.appOption.fileInput.destroy($("#showImage"));
                app.appOption.fileInput.init($("#showImage"),{
                    initialPreview: imageArr
                },false);
                app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
            }
        },function (error) {
            console.log(error);
            $("#show-image").empty();
        })
    },
    viewJob:function (id,jobId) {
        app.appOption.ajax.url = app.appOption.url + "v1/api/bidJob/findJobByJobId/"+jobId;
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            bmrVue.jobInfo = result;
            $("#viewJobInfo").modal("show");
            app.appOption.fileInput.init($("#showJobImage"),false);
            app.appOption.ajax.url = app.appOption.url + "v1/api/transporterBid/getImageUrl/"+jobId+"/createJob";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = null;
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                $("#showJobImageLoading").addClass("hide");
                $("#showJobImage").removeClass("hide");
                if(result) {
                    var imageArr,imageUrlArr = [];
                    if (result.length == 0) {
                        imageArr = bmrVue.message.noImageFound;
                    } else {
                        imageArr = [];
                        for (var index in result) {
                            var imageUrl = app.appOption.url + result[index] + "?sspi=" + app.appOption.getQueryParam("sspi");
                            imageUrlArr.push(imageUrl);
                            imageArr.push(app.appOption.imageOp.getImageStr(index));
                        }
                    }
                    app.appOption.fileInput.destroy($("#showJobImage"));
                    app.appOption.fileInput.init($("#showJobImage"),{
                        initialPreview: imageArr
                    },false);
                    app.appOption.imageOp.fileinputLoad(imageArr,imageUrlArr);
                }
            },function (error) {
                console.log(error);
                $("#jobInfoImages").empty();
            });
        },function (error) {
           console.log(error);
        });

    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                driverName:"required",
                driverMobile:"required",
                driverId:"required"
            },
            messages:{
                driverName:bmrVue.message.validate.require,
                driverMobile:bmrVue.message.validate.require,
                driverId:bmrVue.message.validate.require
            },
            errorPlacement: function (error, element) {
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                label.parent().removeClass("has-error").addClass("has-success");
                label.remove();
            }
        });
    }
};

window.bmr = bmr;
var bmrVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
       message:commonMsg.messages,
      jobInfo:{},
      drivers:[],
      currentDriverId:null,
      driverInfo:{
          driverName:null,
          driverMobile:null,
          driverId:null
      }
    },
    methods:{
        timeFormat:function (time) {
            return app.timeFormat(time);
        },
        formatPrice:function (price) {
            var priceFormat = app.appOption.formatOperation.priceDisplay(price);
            return  "-" == priceFormat ? 0 : priceFormat;
        },
        displayDriverName:function (driver) {
            if(!driver) return "";
            if(!driver.lastName) return driver.firstName;
            if(!driver.firstName) return driver.lastName;
            return driver.firstName + ' ' + driver.lastName;
        }
    }
});
