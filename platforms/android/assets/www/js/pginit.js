var prevPg = '';
var App = {
    "app_loaded": false,
    "testing_on_desktop": true,
    "init": function () {
	console.log("[init]");
 
    	if (document.URL.indexOf("http://") === -1) {
          App.testing_on_desktop = false;
    	}
 
    	$(document).ready(function () {
          console.log("Document finished loading");

	  var deviceReadyDeferred = $.Deferred();
    	  var jqmReadyDeferred    = $.Deferred();
 
          if (App.testing_on_desktop) {
            console.log("PhoneGap finished loading on desktop");
            _onDeviceReady();
	    deviceReadyDeferred.resolve();
          } else {
            document.addEventListener("deviceReady", function () {
                console.log("PhoneGap finished loading on mobile");
                _onDeviceReady();
		deviceReadyDeferred.resolve();
            }, false);
          }
 
          $(document).on("pageinit", function () {
            console.log("JQMMobile finished loading");
	    jqmReadyDeferred.resolve();
          });
 
	  $.when(deviceReadyDeferred, jqmReadyDeferred).then(function () {
            console.log("PhoneGap & JQMobile finished loading");
            App.app_loaded = true;
	  });
        });
 
 	function _onDeviceReady () {
          console.log("in onDeviceReady");
          initPages();
	  PGproxy.navigator.splashscreen.hide();
	  document.addEventListener("backbutton", function(e){
	    e.preventDefault();
	    if($.mobile.activePage.is('#listapp')){
	      console.log('in back button - home page');
	    }
	    else {
	      goToUrl(prevPg);
	    }
	  }, false);
    	}

        function initPages () {
	  console.log("[initPages]");
	  getLocation(true);
	  checkPreAuth();
        }
    },
    "servers": {
       "query": function (url, type, data, callback) { 
         console.log("[query "+url+"]");
         $.ajax(url, {
            "type": type,
            "dataType": "json",
            "data": data,
            "contentType": (type==="GET" ? "application/json" : "application/x-www-form-urlencoded"),
            "success": callback
         });
      },
       "local": {
         "URL":  "http://192.168.1.7:3001/",
         // perform unauthenticated query
         "query": function (action, method, data, callback) { 
	   console.log("app.init [local.query]");
           App.servers.query(App.servers.public.URL+action, method, {"data": data}, callback); }
       },
       "public": {
         "URL":  "http://192.168.1.7:3001/",
         // perform unauthenticated query
         "query": function (action, method, data, callback) { 
	   console.log("[public.query]");
           App.servers.query(App.servers.public.URL+action, method, {"data": data}, callback); }
       }
    }
};

// emulate PhoneGap for testing on Chrome
var PGproxy = {
    "navigator": {
        "connection": function () {
            if (navigator.connection) {
                return navigator.connection;
            } else {
                console.log('navigator.connection');
                return {
                    "type":"WIFI" // Avoids errors on Chrome
                };
            }
        },
        "notification": {
            "vibrate": function (a) {
                if (navigator.notification && navigator.notification.vibrate) {
                    navigator.notification.vibrate(a);
                } else {
                    console.log("navigator.notification.vibrate");
                }
            },
            "confirm": function (a, b, c, d) {
                if (navigator.notification && navigator.notification.confirm) {
                    navigator.notification.confirm(a, b, c, d);
                } else {
                    console.log("navigator.notification.confirm");
                    alert(a);
                }
            },
            "alert": function (a, b, c, d) {
                if (navigator.notification && navigator.notification.alert) {
                    navigator.notification.alert(a, b, c, d);
                } else {
                    console.log("navigator.notification.alert");
                    alert(a);
                }
            }
        },
        "splashscreen": {
            "hide": function () {
                if (navigator.splashscreen) {
                    navigator.splashscreen.hide();
                } else {
                    console.log('navigator.splashscreen.hide');
                }
            }
        }
    }
};
