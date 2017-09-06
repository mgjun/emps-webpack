/**
 * Created by MENGJUN on 2017/2/14.
 */
$(document).ready( function () {


    //save edit tag
    $("#edit-save").bind("click",function () {
        var validator = company.formValidate($("#edit-form"));
        if(!validator.form()) {
            return;
        }
        app.appOption.ajax.url = app.appOption.url+company.companyUrl+"update";
        app.appOption.ajax.type="put";
        app.appOption.ajax.data=JSON.stringify($("#edit-form").serializeObject());
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
                company.loadByTenantId();
        	    app.toastr.info("edit company successful");
        },function (error) {
            console.log(error);
        });
    });
    company.loadByTenantId();
});

var company = {
    companyId:null,
    // isNameSearch:false,
    companyUrl:"v1/api/company/",
    loadByTenantId:function () {
        app.appOption.ajax.url = app.appOption.url+company.companyUrl+"findByTenantId";
        app.appOption.ajax.type="get";
        app.appOption.ajax.request(app.appOption.ajax.url,app.appOption.ajax.type,app.appOption.ajax.data,function (result) {
            if(result) {
                editVue.company = result;
            }
        },function (error) {
            console.log(error);
        });
    },
    formValidate:function (obj) {
        return obj.validate({
            rules:{
                companyName:"required",
                companyRegNo:"required",
                contactName:"required",
                email:{
                    required:true,
                    wideEmail:true
                },
                phone:{
                    required:true,
                    mobileValidate:true
                },
                fax:{
                    required:true
                },
                paypalAccount:{
                    required:true
                },
                xfersAccount:{
                    required:true
                }
            },
            messages:{
                companyName:editVue.message.validate.require,
                companyRegNo:editVue.message.validate.require,
                contactName:editVue.message.validate.require,
                email:{
                    required:editVue.message.validate.require,
                    wideEmail:editVue.message.validate.email
                },
                phone:{
                    required:editVue.message.validate.require,
                    mobileValidate:editVue.message.validate.mobile
                },
                fax:{
                    required:editVue.message.validate.require
                },
                paypalAccount:{
                    required:editVue.message.validate.require
                },
                xfersAccount:{
                    required:editVue.message.validate.require
                }
            },
            errorPlacement: function (error, element) {
                element.parent().addClass("has-error");
                element.parent().append(error);
            },
            success: function (label) {
                label.parent().removeClass("has-error");
                label.parent().addClass("has-success");
                label.remove();
            }
        })
    }
};

window.company = company;
//edit vue object
var editVue = new Vue({
    i18n:commonMsg.i18n,
    el:".content",
    data:{
        message:commonMsg.messages,
        company:{
           id:'',
           companyName:'',
           companyRegNo:'',
           contactName:'',
           email:'',
           phone:'',
           fax:'',
           tenantId:'',
           companyType:'',
           paypalAccount:'',
           xfersAccount:'',
           bankName:'',
           bankAccountNo:'',
           payeeName:''
        }
    }
});
