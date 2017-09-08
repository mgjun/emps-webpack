var apiLink = require("exports-loader?emps_api_url!./apiLink.js");
var emps_api_url = apiLink.emps_api_url;
require("./jquery.jsonp.js");

var path = require("path");
var Vue = require("./vue.js");
var VueI18n = require("./vue-i18n.js");



function getQueryParam(name) {
    if(!name) return null;

    var _search = decodeURI(window.location.search);
    if(!_search) {
        return null;
    }
    _search = _search.substring(1,_search.length);
    if(_search.indexOf("&") != -1) {
        var paramArr = _search.split("&");
        for(var i=0;i<paramArr.length;i++) {
            if(paramArr[i].split("=")[0] == name) {
                return paramArr[i].split("=")[1];
            }
        }

    }else {
        if(_search.split("=")[0] == name) {
            return _search.split("=")[1];
        }
    }
    return null;
};
function deepCopy(obj) {
    // var o,i,j,k;
    // if(typeof(obj)!="object" || obj===null)return obj;
    // if(obj instanceof(Array)) {
    //     o=[];
    //     i=0;j=obj.length;
    //     for(;i<j;i++) {
    //         if(typeof(obj[i])=="object" && obj[i]!=null) {
    //             o[i]=arguments.callee(obj[i]);
    //         }
    //         else {
    //             o[i]=obj[i];
    //         }
    //     }
    // }
    // else {
    //     o={};
    //     for(i in obj) {
    //         if(typeof(obj[i])=="object" && obj[i]!=null) {
    //             o[i]=arguments.callee(obj[i]);
    //         }
    //         else {
    //             o[i]=obj[i];
    //         }
    //     }
    // }

    // return o;
    return JSON.parse(JSON.stringify(obj));
}

function load(type,callback) {
    // path.resolve(__dirname,"./static/messages/") + "/" + url+"?sspi="+getQueryParam("sspi"),
    $.ajax({
        url:path.resolve(__dirname,"./static/messages/") + "/message_" + type+"?sspi="+getQueryParam("sspi"),
        type:"get",
        data:"",
        dataType:'json',
        async:false,
        success:callback,
        error:function (error) {
            alert("request json error");
            console.log(error);
        }
    });
}
var locale;
function getLocale() {
    $.ajax({
        url : emps_api_url+"/getLocale?sspi="+getQueryParam("sspi"),
        type:"get",
        data:"",
        dataType:"json",
        async:false,
        success:function (result) {
            locale = result.result;
        },
        error:function (error) {
            console.log(error);
        }
    })
}
var messageEn,messageZh;
load("en",function (result) {
    if(result && result.responseText) {
        messageEn = JSON.parse(result);
    }
    else{
        messageEn = result;
    }
});
load("zh",function (result) {
    if(result && result.responseText) {
        messageZh = JSON.parse(result.responseText);
    }
    else{
        messageZh = result;
    }

});
// getLocale();
Vue.use(VueI18n);
var i18n = new VueI18n({
    locale: 'en',
    messages:{
        en: {
            message: messageEn
        },
        zh: {
            message: messageZh
        }
    }
});
// var tempArr = [];
var messages = getLocaleData();
function getLocaleData() {
    return i18n.messages['en'].message
}
module.exports = {
    messages:messages,
    i18n:i18n,
    getQueryParam:getQueryParam,
    deepCopy:deepCopy
}


