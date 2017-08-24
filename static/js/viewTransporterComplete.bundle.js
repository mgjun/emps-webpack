webpackJsonp([1],{

/***/ 6:
/***/ (function(module, exports) {

/*
 * Created by MENGJUN on 2017/3/8.
 */
window.onload = function() {
    $("input[type='radio'].minimal").iCheck({
        radioClass: 'iradio_square-blue'
    }).on("ifChecked",function() {
        alertify.set({
               labels : {
                   ok: "YES",
                   cancel: "NO"
               }
           });
           alertify.confirm("The deletion is permanent. Confirm to delete?", function (e) {
               if(e) {
                   
               }else {
                   
               }
           });
    });
    alert($(".box-title").text());
}

/***/ })

},[6]);