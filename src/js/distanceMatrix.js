/**
 * Created by MENGJUN on 2017/2/14.
 */
var distanceMatrixTable;
$(document).ready( function () {
	distanceMatrix.loadAllZones();
    distanceMatrixTable = $("#distanceMatrix-table").dataTable($.fn.extend(true,{},app.appOption.datatables.defaultOptions,{
        "ajax":function (data,callback,settings) {
            data.columns[0].search.value = $("#distanceMatrix-name-value").val();
            app.appOption.ajax.url = app.appOption.url+distanceMatrix.distanceMatrixUrl+"viewDistanceMatrix";
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
                "data":"destCentralAddress"
            },
            {
                "data":"destCentralPostalcode"
            },
            {
                "data":"distance"
            },
            {
                "data":"srcCentralAddress"
            },
            {
                "data":"srcCentralPostalcode"
            },
            {
                "data":"travelTime",
                "sClass":"text-center"
            },            
            {
                "data":null,
                "orderable":false,
                "searchable":false,
                "render":function (data,type, row, meta) {
                    return '<button onclick="distanceMatrix.update('+row.id+')" class="btn btn-sm btn-app-primary distanceMatrix-show-edit">'+distanceMatrixVue.message.button.edit+'</button>'+
                        '<button onclick="distanceMatrix.delete('+row.id+',\''+row.destCentralAddress+'\')" class="btn btn-sm btn-app-danger distanceMatrix-show-delete">'+distanceMatrixVue.message.button.delete+'</button>';
                }
            }
        ]
    })).api();

    $(".select2").select2().bind("change",function () {
        $(this).parent().find("label.error").remove();
        $(this).parent().addClass("has-success").removeClass("has-error");
    });

    //save create setting
    $("#distanceMatrix-create-save").bind("click",function () {
        var validator = distanceMatrix.formValidate($("#distanceMatrix-create-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url=app.appOption.url+distanceMatrix.distanceMatrixUrl+"createDistanceMatrix";
        app.appOption.ajax.type="post";
        app.appOption.ajax.data=JSON.stringify($("#distanceMatrix-create-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#addDistanceMatrix").modal("hide");
            distanceMatrixTable.draw();
        },function (error) {
            console.log(error);
        });
    });
    
    //save edit setting
    $("#distanceMatrix-edit-save").bind("click",function () {
        var validator = distanceMatrix.formValidate($("#distanceMatrix-edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+distanceMatrix.distanceMatrixUrl+"updateDistanceMatrix";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#distanceMatrix-edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#editDistanceMatrix").modal("hide");
            distanceMatrixTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //save delete setting
    $("#distanceMatrix-delete-save").bind("click",function () {
        app.appOption.ajax.url = app.appOption.url+distanceMatrix.distanceMatrixUrl+"deleteDistanceMatrix/"+distanceMatrix.distanceMatrixId;
        app.appOption.ajax.type="delete";
        app.appOption.ajax.data=null;
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            $("#deleteDistanceMatrix").modal("hide");
            distanceMatrixTable.draw();
        },function (error) {
            console.log(error);
        });
    });

    //search by setting name
    $("#distanceMatrix-name-search").bind("click",function () {
        // setting.isNameSearch = true;
    	distanceMatrixTable.draw();
        // $("#setting-name-value").val("");
    })
});

var distanceMatrix = {
	distanceMatrixId:null,
    // isNameSearch:false,
	distanceMatrixUrl:"v1/api/distanceMatrix/",
    loadAllZones:function () {
        app.appOption.ajax.url = app.appOption.url+"v1/api/bidJob/findAllZones";
        app.appOption.ajax.type = "post";
        app.appOption.ajax.data = "";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
        	distanceMatrixVue.distanceMatrixInfo.zones = result;
        },function (error) {
            console.log(error);
        })
    },	
    create:function () {
        $("#distanceMatrix-create-form").resetValue().resetValidation();
        $("#distanceMatrix-create-form").find(".select2").val("").trigger("change");
        $("#addDistanceMatrix").modal("show");  
    },
    update:function (distanceMatrixId) {
        $("#distanceMatrix-edit-form").resetValidation();
        $("#distanceMatrix-edit-form").find(".select2").val("").trigger("change");
        app.appOption.ajax.url = app.appOption.url+distanceMatrix.distanceMatrixUrl+"findDistanceMatrixById/"+distanceMatrixId;
        app.appOption.ajax.type="post";
        app.appOption.ajax.data={id:distanceMatrixId};
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
            	distanceMatrixVue.distanceMatrixInfo.id = result.id;
            	distanceMatrixVue.distanceMatrixInfo.destCentralAddress = result.destCentralAddress;
            	distanceMatrixVue.distanceMatrixInfo.destCentralPostalcode = result.destCentralPostalcode;
            	distanceMatrixVue.distanceMatrixInfo.destId = result.destId;
            	distanceMatrixVue.distanceMatrixInfo.distance = result.distance;
            	distanceMatrixVue.distanceMatrixInfo.srcCentralAddress = result.srcCentralAddress;
            	distanceMatrixVue.distanceMatrixInfo.srcCentralPostalcode = result.srcCentralPostalcode;
            	distanceMatrixVue.distanceMatrixInfo.srcId = result.srcId;
            	distanceMatrixVue.distanceMatrixInfo.travelTime = result.travelTime;

                $("#edit-srcId").val(result.srcId).trigger("change");
                $("#edit-destId").val(result.destId).trigger("change");
            }
            $("#editDistanceMatrix").modal("show");
        },function (error) {
            console.log(error);
        })
    },
    delete:function (distanceMatrixId,destCentralAddress) {
        this.distanceMatrixId = distanceMatrixId;
        distanceMatrixVue.destCentralAddress = destCentralAddress;
        // $("#deleteDistanceMatrix").modal("show");
        app.appOption.alertify._init({
            confirmFn:function (e) {
                app.appOption.ajax.url = app.appOption.url+distanceMatrix.distanceMatrixUrl+"deleteDistanceMatrix/"+distanceMatrix.distanceMatrixId;
                app.appOption.ajax.type="delete";
                app.appOption.ajax.data=null;
                app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                    // $("#deleteDistanceMatrix").modal("hide");
                    distanceMatrixTable.draw();
                },function (error) {
                    console.log(error);
                });
            }
        })
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                destCentralAddress:"required",
                destCentralPostalcode:{
                    required:true,
                    remote:{
                        url:app.appOption.url+distanceMatrix.distanceMatrixUrl+"isExistDistance?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function() {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            destCentralPostalcode:function() {
                                obj.find("input[name='destCentralPostalcode']").removeData("previousValue");
                                return obj.find("input[name='destCentralPostalcode']").val();
                            },
                            srcCentralPostalcode:function() {
                                obj.find("input[name='srcCentralPostalcode']").removeData("previousValue");
                                return obj.find("input[name='srcCentralPostalcode']").val();
                            }
                        }
                    }
                },
                destId:"required",
                distance:{
                    required:true,
                    number:true
                },
                srcCentralAddress:"required",
                srcCentralPostalcode:{
                    required:true,
                    remote:{
                        url:app.appOption.url+distanceMatrix.distanceMatrixUrl+"isExistDistance?sspi="+ app.appOption.getQueryParam("sspi"),
                        type:"post",
                        dataType:"json",
                        async: false,
                        cache:false,
                        data:{
                            id:function() {
                                obj.find("input[name='id']").removeData("previousValue");
                                var id = obj.find("input[name='id']").val();
                                return !id ? -1 : id;
                            },
                            destCentralPostalcode:function() {
                                obj.find("input[name='destCentralPostalcode']").removeData("previousValue");
                                return obj.find("input[name='destCentralPostalcode']").val();
                            },
                            srcCentralPostalcode:function() {
                                obj.find("input[name='srcCentralPostalcode']").removeData("previousValue");
                                return obj.find("input[name='srcCentralPostalcode']").val();
                            }
                        }
                    }
                },
                srcId:"required",
                travelTime:{
                    required:true,
                    number:true
                }
            },
            messages:{
                destCentralAddress:distanceMatrixVue.message.validate.require,
                destCentralPostalcode:{
                    required:distanceMatrixVue.message.validate.require,
                    remote:distanceMatrixVue.message.validate.dupPostalCode
                },
                destId:distanceMatrixVue.message.validate.require,
                distance:{
                    required:distanceMatrixVue.message.validate.require,
                    number:distanceMatrixVue.message.validate.number
                },
                srcCentralAddress:distanceMatrixVue.message.validate.require,
                srcCentralPostalcode:{
                    required:distanceMatrixVue.message.validate.require,
                    remote:distanceMatrixVue.message.validate.dupPostalCode
                },
                srcId:distanceMatrixVue.message.validate.require,
                travelTime:{
                    required:distanceMatrixVue.message.validate.require,
                    number:distanceMatrixVue.message.validate.number
                }
            },
            errorPlacement: function (error, element) {
                if(error[0].textContent === distanceMatrixVue.message.validate.dupPostalCode) {
                    element.parent().addClass("duplicated");
                }
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                if(label.closest("div").hasClass("duplicated")) {
                    var _label = label.closest("form").find(".duplicated").find("label.error");
                    _label.parent().removeClass("has-error").addClass("has-success");
                    _label.remove();
                }else {
                    label.parent().removeClass("has-error");
                    label.parent().addClass("has-success");
                    label.remove();
                }
            }
        })
    }
};

window.distanceMatrix = distanceMatrix;
//editsetting vue object
var distanceMatrixVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        destCentralAddress:null,
    	distanceMatrixInfo:{
           id:'',
           zones:null,
           destCentralAddress:'',
           destCentralPostalcode:'',
           distance:'',
           destId:'',
           srcCentralAddress:'',
           srcCentralPostalcode:'',
           srcId:'',
           travelTime:''
        }
    }
});
