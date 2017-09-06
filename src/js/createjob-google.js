require("https://maps.googleapis.com/maps/api/js?key=AIzaSyCTbD-LfkIk1Ayn9ce2nXfhdqacU2ld38A&language=en");
var shipperCreateJob = require("./shipperCreateJob.js");

var map,markerArray,directionsService,directionsRender,infoWindow;
function initMap() {
    markerArray = [];
    directionsService = new google.maps.DirectionsService;

    map = new google.maps.Map(document.getElementById("map"),{
        center:{lat:1.27828,lng:103.856},
        zoom:13
    });


    directionsRender = new google.maps.DirectionsRenderer({
        map:map
    });
    infoWindow = new google.maps.InfoWindow;
    var currentKeyUpVal;
    $("#pickUpAddress").bind("keyup",function (event) {
        e = event ? event :(window.event ? window.event : null);
        var ev=0;
        ev=e.keyCode||e.which||e.charCode;
        var _$this = $(this);
        if((ev >= 48 && ev <= 57) || (ev <= 105 && ev >= 96)) {
            if (app.isEmpty(_$this.val())) {
                shipperCreateJob.shipperCreateVue.pickUpLocation = "";
                shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
                shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='pickupLocation']"));
            } else if (_$this.val().length == 6 && currentKeyUpVal != _$this.val()) {
                $("body").loadingOverlay({loadingText: shipperCreateJob.shipperCreateVue.message.waiting});
                // shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
                geocoderByPostalCode(_$this.val(), $("input[name='pickupLocation']"), "start");
            } else if(_$this.val().length == 6 && currentKeyUpVal == _$this.val()) {

            }else {
                shipperCreateJob.shipperCreateVue.pickUpLocation = "";
            }
            currentKeyUpVal = _$this.val();
        }
    }).bind("blur",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val()) || _$this.val().length < 6) {
            shipperCreateJob.shipperCreate.validPickPostal = false;
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
        }
    }).bind("change",function () {
        var _$this = $(this);
        if (app.isEmpty(_$this.val())) {
            shipperCreateJob.shipperCreateVue.pickUpLocation = "";
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#pickUpAddress"));
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='pickupLocation']"));
        } else if (_$this.val().length == 6 && currentKeyUpVal != _$this.val()) {
            $("body").loadingOverlay({loadingText: "waiting"});
            // shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
            geocoderByPostalCode(_$this.val(), $("input[name='pickupLocation']"), "start");
        } else if(_$this.val().length == 6 && currentKeyUpVal == _$this.val()) {

        }else {
            shipperCreateJob.shipperCreateVue.pickUpLocation = "";
        }
        currentKeyUpVal = _$this.val();
    });
    var currentDropKeyUpVal;
    $('#dropOffAddress').bind('keyup', function (event) {
        e = event ? event :(window.event ? window.event : null);
        var ev=0;
        ev=e.keyCode||e.which||e.charCode;
        var _$this = $(this);
        if((ev >= 48 && ev <= 57) || (ev <= 105 && ev >= 96)) {
            if(app.isEmpty(_$this.val())) {
                shipperCreateJob.shipperCreateVue.dropOffLocation = "";
                shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
                shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='dropoffLocation']"));
            } else if(_$this.val().length == 6 && currentDropKeyUpVal != _$this.val()){
                $("body").loadingOverlay({loadingText:"waiting"});
                geocoderByPostalCode(_$this.val(),$("input[name='dropoffLocation']"),"end");
            }else if(_$this.val().length == 6 && currentDropKeyUpVal == _$this.val()){

            } else {
                shipperCreateJob.shipperCreateVue.dropOffLocation = "";
            }
            currentDropKeyUpVal = _$this.val();
        }
    }).bind("blur",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val()) || _$this.val().length < 6) {
            shipperCreateJob.shipperCreate.validDropPostal = false;
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
        }
    }).bind("change",function () {
        var _$this = $(this);
        if(app.isEmpty(_$this.val())) {
            shipperCreateJob.shipperCreateVue.dropOffLocation = "";
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("#dropOffAddress"));
            shipperCreateJob.shipperCreate.formValidate($("#shipper-createJob-form")).element($("input[name='dropoffLocation']"));
        } else if(_$this.val().length == 6 && currentDropKeyUpVal != _$this.val()){
            $("body").loadingOverlay({loadingText:"waiting"});
            geocoderByPostalCode(_$this.val(),$("input[name='dropoffLocation']"),"end");
        }else if(_$this.val().length == 6 && currentDropKeyUpVal == _$this.val()){

        } else {
            shipperCreateJob.shipperCreateVue.dropOffLocation = "";
        }
        currentDropKeyUpVal = _$this.val();
    });

    //init page data if edit job
    if(shipperCreateJob.shipperCreateVue.jobId) {
        geocoderByPostalCode(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupAddress,$("input[name='pickupLocation']"),"start");
        geocoderByPostalCode(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffAddress,$("input[name='dropoffLocation']"),"end");

    }

}

/**
 * duplicated
 * @param sLocation
 * @param eLocation
 */
function getDistance(sLocation,eLocation) {
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins:[sLocation],
        destinations:[eLocation],
        travelMode:"DRIVING",
        unitSystem:google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    },function (response, status) {
        if(status != "OK") {
            toastr.error("get distance failed!");
        }else {
            var results = response.rows[0].elements;
            shipperCreateJob.shipperCreateVue.distance = (results[0].distance.value / 1000).toString().length > 7 ? (results[0].distance.value / 1000).toFixed(6) : (results[0].distance.value / 1000);
            shipperCreateJob.shipperCreateVue.duration = (results[0].duration.value / 1000).toString().length > 7 ? (results[0].duration.value / 1000).toFixed(6) : (results[0].duration.value / 1000);
        }
    })
}

function displayRoute(start,end,markerArray,directionsService,directionsRender,infoWindow) {
    //remove all exist markers
    if(markerArray && markerArray.length > 0) {
        for(var i=0;i<markerArray.length;i++) {
            markerArray[i].setMap(null);
        }
    }

    directionsService.route({
        origin:start,
        destination:end,
        travelMode:google.maps.TravelMode.DRIVING
    },function (response,status) {
        if(status == google.maps.DirectionsStatus.OK) {
            directionsRender.setMap(map);
            directionsRender.setDirections(response);
        }else {
            toastr.error(shipperCreateJob.shipperCreateVue.message.directionFailed.replace("{status}",status));
            directionsRender.setMap(null);
        }
    })
}

function addMarker(location, map) {
    var marker = new google.maps.Marker({
        position:location,
        map:map,
        animation:google.maps.Animation.BOUNCE
    });
    return marker;
};
function clearMarker() {
    if(markerArray && markerArray.length > 0) {
        for(var i=0;i<markerArray.length;i++) {
            markerArray[i].setMap(null);
        }
    }
}
var formatAddressStart,formatAddressEnd;
function geocoderByPostalCode(postalCode,obj,startOrEnd) {
    var geocode = new google.maps.Geocoder(),
        isPickup = "start" === startOrEnd,
        $form = $("#shipper-createJob-form"),$pObj = $("#pickUpAddress"),
        $dObj = $("#dropOffAddress");
    if(isPickup) {
        shipperCreateJob.shipperCreateVue.pickUpLocation = "";
        shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
    }else {
        shipperCreateJob.shipperCreateVue.dropOffLocation = "";
        shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = true;
    }
    geocode.geocode( {componentRestrictions:{country:"SG",postalCode:postalCode}} ,function (results, status) {
        $("body").loadingOverlay("remove");
        if(status === google.maps.GeocoderStatus.OK) {
            clearMarker();
            //没有解析到地址
            if(!results || !results[0] || results.length === 0) {
                if(isPickup) {
                    shipperCreateJob.shipperCreate.validPickPostal = false;
                    shipperCreateJob.shipperCreateVue.pickUpLocation = "";
                    shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                }else {
                    shipperCreateJob.shipperCreate.validDropPostal = false;
                    shipperCreateJob.shipperCreateVue.dropOffLocation = "";
                    shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                }
                // obj.val("");
                shipperCreateJob.shipperCreateVue.distance = 0;
                shipperCreateJob.shipperCreateVue.jobPrice = 0;
                directionsRender.setMap(null);
                return;
            }
            //获取解析到的地址的经纬度
            var latlng = {lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
            //设置初始化参数
            if(isPickup) {
                //解析到的地址
                formatAddressStart = results[0].formatted_address;
                //验证通过
                shipperCreateJob.shipperCreate.validPickPostal = true;
                //验证起点postal code
                shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                //设置起始位置经纬度
                shipperCreateJob.shipperCreate.startLocation = latlng;
            }else {
                //解析到的终点地址
                formatAddressEnd = results[0].formatted_address;
                //验证通过
                shipperCreateJob.shipperCreate.validDropPostal = true;
                //验证终点postal code
                shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                //设置终点位置经纬度
                shipperCreateJob.shipperCreate.endLocation = latlng;
            }
            //如果起点终点位置经纬度存在，规划路线
            if(formatAddressStart && formatAddressEnd) {
                //如果解析到起始位置与终点位置，调用api获取距离
                // getDistance(formatAddressStart,formatAddressEnd);
                //calculate distance for the selected two places
                shipperCreateJob.shipperCreate.getDistance($pObj.val(),$dObj.val());
            }else if(app.isEmpty(shipperCreateJob.shipperCreateVue.jobId)){
                var marker;
                if(isPickup) {
                    marker = addMarker({lat:shipperCreateJob.shipperCreate.startLocation.lat,lng:shipperCreateJob.shipperCreate.startLocation.lng},map);
                    map.setCenter({lat:shipperCreateJob.shipperCreate.startLocation.lat,lng:shipperCreateJob.shipperCreate.startLocation.lng});
                    toastr.info(shipperCreateJob.shipperCreateVue.message.inputDestPostalCode);
                }else{
                    marker = addMarker({lat:shipperCreateJob.shipperCreate.endLocation.lat,lng:shipperCreateJob.shipperCreate.endLocation.lng},map);
                    map.setCenter({lat:shipperCreateJob.shipperCreate.endLocation.lat,lng:shipperCreateJob.shipperCreate.endLocation.lng});
                    toastr.info(shipperCreateJob.shipperCreateVue.message.inputSrcPostalCode);
                }
                markerArray.push(marker);
            }else if(!app.isEmpty(shipperCreateJob.shipperCreateVue.jobId)){
                var marker;
                if(isPickup) {
                    marker = addMarker({lat:shipperCreateJob.shipperCreate.startLocation.lat,lng:shipperCreateJob.shipperCreate.startLocation.lng},map);
                    map.setCenter({lat:shipperCreateJob.shipperCreate.startLocation.lat,lng:shipperCreateJob.shipperCreate.startLocation.lng});
                }else {
                    marker = addMarker({lat:shipperCreateJob.shipperCreate.endLocation.lat,lng:shipperCreateJob.shipperCreate.endLocation.lng},map);
                    map.setCenter({lat:shipperCreateJob.shipperCreate.endLocation.lat,lng:shipperCreateJob.shipperCreate.endLocation.lng});
                }
                markerArray.push(marker);
            }
            //处理解析到的地址，如果地址有效，直接使用;否则根据经纬度进行解析
            var preciseResults = getPreciseResults(results);
            if(preciseResults && preciseResults.length > 0) {
                // obj.val(preciseResults[0].formatted_address);
                if(isPickup) {
                    shipperCreateJob.shipperCreateVue.geocode.pickupLocationList = getFormatedAddressArr(results);
                    if(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation) {
                        if(shipperCreateJob.shipperCreateVue.geocode.pickupLocationList.indexOf(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation) == -1) {
                            shipperCreateJob.shipperCreateVue.geocode.pickupLocationList.push(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation);
                        }
                        shipperCreateJob.shipperCreateVue.pickUpLocation = shipperCreateJob.shipperCreateVue.geocode.pickupLocationList[0];
                    }else {
                        shipperCreateJob.shipperCreateVue.pickUpLocation = getFormatedAddressArr(results)[0];
                    }
                }else{
                    shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList = getFormatedAddressArr(results);
                    if(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation) {
                        if(shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList.indexOf(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation) == -1) {
                            shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList.push(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation);
                        }
                        shipperCreateJob.shipperCreateVue.dropOffLocation = shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList[0]
                    }else {
                        shipperCreateJob.shipperCreateVue.dropOffLocation = getFormatedAddressArr(results)[0];
                    }
                }
                if(shipperCreateJob.shipperCreate.startLocation && shipperCreateJob.shipperCreate.endLocation) {
                    displayRoute(
                        shipperCreateJob.shipperCreate.startLocation,
                        shipperCreateJob.shipperCreate.endLocation,
                        markerArray, directionsService, directionsRender, infoWindow);
                }
            }else {
                geocoderByLatLng(latlng,obj,startOrEnd);
            }
        }else {
            clearMarker();
            if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                if(isPickup) {
                    shipperCreateJob.shipperCreate.validPickPostal = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                }else {
                    shipperCreateJob.shipperCreate.validDropPostal = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                }
            }
            obj.val("");
            shipperCreateJob.shipperCreateVue.distance = 0;
            shipperCreateJob.shipperCreateVue.jobPrice = 0;
            directionsRender.setMap(null);
            if(status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                toastr.error(shipperCreateJob.shipperCreateVue.message.geocodeAddressFailed.replace("{status}",status));
            }
        }
    });
};
function geocoderByLatLng(latlng,obj,startOrEnd) {
    var geocode = new google.maps.Geocoder(),
        isPickup = "start" === startOrEnd,
        $form = $("#shipper-createJob-form"),$pObj = $("#pickUpAddress"),$dObj = $("#dropOffAddress"),
        $plObj = $("input[name='pickupLocation']"),$dlObj = $("input[name='dropoffLocation']");
    geocode.geocode( {location:latlng,region:"702"} ,function (results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
            if(results && results.length > 0) {
                var addressResults = dealAddress(results);
                if(!addressResults || addressResults.length === 0) {
                    if(isPickup) {
                        shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = false;
                        shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                        $plObj.focus();
                        $plObj.bind("keyup",function () {
                            shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
                            shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                        });
                    }else {
                        shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = false;
                        shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                        $dObj.focus();
                        $dlObj.bind("keyup",function () {
                            shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = true;
                            shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                        });
                    }
                    return;
                }
                // obj.val(addressResults[0].formatted_address);
                if(isPickup) {
                    shipperCreateJob.shipperCreateVue.geocode.pickupLocationList = getFormatedAddressArr(results)
                    if(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation) {
                        if(shipperCreateJob.shipperCreateVue.geocode.pickupLocationList.indexOf(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation) == -1) {
                            shipperCreateJob.shipperCreateVue.geocode.pickupLocationList.push(shipperCreateJob.shipperCreateVue.updateJobInfo.pickupLocation);
                        }
                        shipperCreateJob.shipperCreateVue.pickUpLocation = shipperCreateJob.shipperCreateVue.geocode.pickupLocationList[0];
                    }else {
                        shipperCreateJob.shipperCreateVue.pickUpLocation = getFormatedAddressArr(results)[0];
                    }
                    Vue.nextTick(function () {
                        shipperCreateJob.shipperCreate.formValidate($form).element($plObj);
                    })
                }else{
                    shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList = getFormatedAddressArr(results);
                    if(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation) {
                        if(shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList.indexOf(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation) == -1) {
                            shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList.push(shipperCreateJob.shipperCreateVue.updateJobInfo.dropoffLocation);
                        }
                        shipperCreateJob.shipperCreateVue.dropOffLocation = shipperCreateJob.shipperCreateVue.geocode.dropoffLocationList[0]
                    }else {
                        shipperCreateJob.shipperCreateVue.dropOffLocation = getFormatedAddressArr(results)[0];
                    }
                    Vue.nextTick(function () {
                        shipperCreateJob.shipperCreate.formValidate($form).element($dlObj);
                    });
                }

                if(shipperCreateJob.shipperCreate.startLocation && shipperCreateJob.shipperCreate.endLocation) {
                    displayRoute(
                        shipperCreateJob.shipperCreate.startLocation,
                        shipperCreateJob.shipperCreate.endLocation,
                        markerArray, directionsService, directionsRender, infoWindow);
                }
            }else{//反向解析失败，提供的经纬度没有解析到地址信息
                if(isPickup) {
                    shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                    $plObj.focus();
                    $plObj.bind("keyup",function () {
                        shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
                        shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                    });
                }else {
                    shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                    $dObj.focus();
                    $dlObj.bind("keyup",function () {
                        shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = true;
                        shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                    });
                }

            }
        }else {
            clearMarker();
            if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                if(isPickup) {
                    shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                    $plObj.focus();
                    $plObj.bind("keyup",function () {
                        shipperCreateJob.shipperCreate.pickGeocodeFailedByLatLng = true;
                        shipperCreateJob.shipperCreate.formValidate($form).element($pObj);
                    });
                }else {
                    shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = false;
                    shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                    $dObj.focus();
                    $dlObj.bind("keyup",function () {
                        shipperCreateJob.shipperCreate.dropGeocodeFailedByLatLng = true;
                        shipperCreateJob.shipperCreate.formValidate($form).element($dObj);
                    });
                }
            }
            obj.val("");
            shipperCreateJob.shipperCreateVue.distance = 0;
            shipperCreateJob.shipperCreateVue.jobPrice = 0;
            directionsRender.setMap(null);
            if(status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                toastr.error(shipperCreateJob.shipperCreateVue.message.geocodeAddressFailed.replace("{status}",status));
            }
        }
    });
};
function geocoderByAddress(address) {
    var geocode = new google.maps.Geocoder();
    geocode.geocode( {address:address,region:"702"} ,function (results, status) {
        if(status = google.maps.GeocoderStatus.OK) {


        }else {
            toastr.error(shipperCreateJob.shipperCreateVue.message.directionFailed.replace("{status}",status));
        }
    });
}
function dealGoogleAddress(result) {
    if(!result || !result.formatted_address) return "";
    var arr = result.formatted_address.split(",");
    if(arr && arr[0]) {
        result.formatted_address = arr[0];
    }
    return result;

}
function getPreciseResults(results) {
    if(!results || results.length == 0) return "";
    var arr = $.map(results,function (b) {
        if(b.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP){
            return dealGoogleAddress(b);
        }
    });
    return arr;
}
function dealAddress(results) {
    if(!results || results.length == 0) return "";
    var arr = $.map(results,function (b) {
        if(b.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP){
            return dealGoogleAddress(b);
        }
    });
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.RANGE_INTERPOLATED){
                return dealGoogleAddress(b);
            }
        });
    }
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.GEOMETRIC_CENTER){
                return dealGoogleAddress(b);
            }
        });
    }
    if(app.isEmpty(arr)) {
        arr = $.map(results,function (b) {
            if(b.geometry.location_type == google.maps.GeocoderLocationType.APPROXIMATE){
                return dealGoogleAddress(b);
            }
        });
    }
    return arr;
}
function getFormatedAddressArr(results) {
    if(!results || results.length == 0) return new Array();
    var widthDuplicated = $.map(results,function (b) {
        if(b.geometry.location_type != google.maps.GeocoderLocationType.APPROXIMATE) {
            return b.formatted_address;
        }
    });
    var newArr = [];
    $.each(widthDuplicated,function (outKey, outVal) {
        var flag = true;
        for(var inkey=outKey+1;inkey<widthDuplicated.length;inkey++) {
            if(outVal == widthDuplicated[inkey]) flag = false;
        }
        if(flag) {
            newArr.push(outVal);
        }
    });
    return newArr;
}
