/**
 * Created by MENGJUN on 2017/3/1.
 */
var bmTable,tableOptions;

$(document).ready(function () {
    tableOptions = {
        ajax:function (data, callback, settings) {
        	data.columns[0].search.value = $("#bid-no-value").val();
        	data.columns[4].search.value = bm.statusArr.join(",");
            app.appOption.ajax.url = app.appOption.url+bm.url+"viewTransporterBid";
            app.appOption.ajax.type = "post";
            app.appOption.ajax.data = JSON.stringify(data);
            app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                // result.recordsFiltered = result.recordsTotal;
                callback(result);
            },function (error) {
                console.log(error);
            })
        },
        columns:[
             {
                 data:"bidNo",
                 render:function (data, type, row, meta) {
                     return '<a onclick="bm.viewBid(\''+row.id+'\')">'+row.bidNo+'</a>'
                 }
             },
            {
                data:null,
                orderable:false,
                sClass:"text-center",
                render:function (date, type, row, meta) {
                    return row.vehicleAvailabilityFrom+" <br/> to <br/> "+row.vehicleAvailabilityEnd;
                }
            },

            {
                data:"bidType"
            },
            {
                data:"vehicleName",
                orderable:false
            },
            {
                data:"status",
                render:function (data, type, row, meta) {
                    return app.appOption.displayStatus(row.status);
                }
            },
            {
                data:null,
                orderable:false,
                searchable:false,
                render:function (data, type, row, meta) {
                    // var editButton = '<button class="btn btn-app-primary">Edit</button>';
                    var deleteButton = '<button onclick="bm.delete('+row.id+')" class="btn btn-xs btn-app-danger">'+bmVue.message.button.delete+'</button>';
                    var editButton = '<button onclick="bm.edit('+row.id+')" class="btn btn-xs btn-app-primary">'+bmVue.message.button.edit+'</button>';
                    var submitButton = '<button onclick="bm.submit('+row.id+')" class="btn btn-xs btn-app-primary">'+bmVue.message.button.submit+'</button>';
                    var revokeButton = '<button onclick="bm.revoke('+row.id+')" class="btn btn-xs btn-app-danger">'+bmVue.message.button.revoke+'</button>';
                    var reSubmitButton = '<button onclick="bm.submit('+row.id+')" class="btn btn-xs btn-app-primary">'+bmVue.message.button.reSubmit+'</button>';
                    var viewResultButton = '<button onclick="bm.viewResult('+row.id+')" class="btn btn-xs btn-app-primary">'+bmVue.message.button.viewResult+'</button>';
                    // var viewDetailButton = '<button onclick="bm.viewBid(\''+row.id+'\')" class="btn btn-xs btn-app-primary">'+bmVue.message.button.viewBid+'</button>';
                    var str = "";
                    if("draft" == row.status){
                        str = editButton+submitButton+deleteButton;
                    }else if("submitted" == row.status) {
                        str = viewResultButton+revokeButton;
                    }else if("match_unsuccess" == row.status) {
                        str = reSubmitButton;
                    }else if("match_success" == row.status) {
                        str = viewResultButton;
                    }
                    return  str;

                }
            }
        ]
    };


    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function () {
        bm.statusArr.push($(this).val());
        bm.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
        $("#status-display").val(bm.statusDisplayArr.reverse().join(","));
    }).on("ifUnchecked",function () {
        var index = bm.statusArr.indexOf($(this).val());
        var displayIndex = bm.statusDisplayArr.indexOf(app.appOption.displayStatus($(this).val()));
        bm.statusArr.splice(index,1);
        bm.statusDisplayArr.splice(displayIndex,1);
        $("#status-display").val(bm.statusDisplayArr.reverse().join(","));
    });


    $("#search").bind("click",function () {
    	bmTable.draw();
    });
    
    $("#create-capacity-button").bind("click",function () {
        location.href = "transporterCreateBid.html?sspi="+app.appOption.getQueryParam("sspi");
    });

    $("#bm-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+bm.url+"deleteTransporterBid/"+bm.id;
        app.appOption.ajax.type = "DELETE";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteBm").modal("hide");
            bmTable.draw();
        },function (error) {
            console.log(error)
        })
    });

    bm.setDefaultStatus();
});
var bm = {
    url:"v1/api/transporterBid/",
    id:null,
    statusArr:[],
    statusDisplayArr:[],
    setDefaultStatus:function () {
        $("input[name='status'].minimal").each(function (index) {
            if($(this).val() == "draft"
                || $(this).val() == "submitted"
                || $(this).val() == "match_success"
                || $(this).val() == "wait_payment") {
                $(this).iCheck("check");
            }
            var hasChecked = $(this).closest("div").hasClass("checked");
            var temp = bm.statusArr.indexOf($(this).val());
            if(hasChecked && temp === -1) {
                bm.statusArr.push($(this).val());
                bm.statusDisplayArr.push(app.appOption.displayStatus($(this).val()));
            }
        });
        bmTable = $("#bm-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,tableOptions)).api();
    },
    delete:function (id) {
        this.id = id;
        // $("#deleteBm").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+bm.url+"deleteTransporterBid/"+bm.id;
                app.appOption.ajax.type = "DELETE";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteBm").modal("hide");
                    bmTable.draw();
                },function (error) {
                    console.log(error)
                })
            }
        })
    },
    edit:function (id) {
        window.location.href = "transporterCreateBid.html?bidId="+id+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    submit:function (id) {
        app.appOption.ajax.url = app.appOption.url+bm.url+"submitTransporterBid/"+id;
        app.appOption.ajax.type = "PUT";
        app.appOption.ajax.data = null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            bmTable.draw();
        },function (error) {
            console.log(error)
        })
    },
    revoke:function (id) {
        app.appOption.alertify._init({
            ok: bmVue.message.button.yes,
            cancel:bmVue.message.button.no,
            confirmMsg:bmVue.message.revokeInfo,
            confirmFn:function () {
                app.appOption.ajax.url = app.appOption.url+bm.url+"revokeTransporterBid/"+id;
                app.appOption.ajax.type = "PUT";
                app.appOption.ajax.data = null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    app.appOption.alertify._init({
                        ok:bmVue.message.button.yes,
                        cancel:bmVue.message.button.no,
                        hideCancel:true,
                        confirmMsg:bmVue.message.revokeSuccess,
                        confirmFn:function () {
                            bmTable.draw();
                        }
                    });
                },function (error) {
                    console.log(error)
                })
            }

        });

    },
    viewResult:function (id) {
        window.location.href = "./transporterMatchBidResult.html?transporterBidId="+id+"&sspi="+app.appOption.getQueryParam("sspi");
    },
    viewBid:function (id) {
        window.location.href = "./transporterBidDetail.html?transporterBidId="+id+"&jobId=-1&istb=true&sspi="+app.appOption.getQueryParam("sspi");
    }
};

window.bm = bm;
var bmVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages
    }
});