// Modified code from https://github.com/Pushwoosh/phonegap-build-sample-app
function pushNotifications() {
  try {
    var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
    if (device.platform == "Android") {
      registerPushwooshAndroid();
    }
    if (device.platform == "iPhone" || device.platform == "iOS") {
      registerPushwooshIOS();
    }
  } catch(e) {
    PGproxy.navigator.notification.alert(e, function() {}, 'Post Data', 'Done');
  }
}

function registerPushwooshAndroid() {
  var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
  //set push notifications handler
  document.addEventListener('push-notification',
    function(event) {
      var title = event.notification.title;
      var userData = event.notification.userdata;
      //dump custom data to the console if it exists
      if (typeof(userData) != "undefined") {
        console.warn('user data: ' + JSON.stringify(userData));
      }
      alert(title);
    }
  );

  //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
  pushNotification.onDeviceReady({
    projectid: API_KEYS["google"]["project_id"],
    appid : API_KEYS["pushwoosh"]["app_id"]
  });

  //register for push notifications
  pushNotification.registerDevice(
    function(token) {
      alert(token);
      //callback when pushwoosh is ready
      onPushwooshAndroidInitialized(token);
    },
    function(status) {
      alert("failed to register: " +  status);
      console.warn(JSON.stringify(['failed to register ', status]));
    }
  );
}

function onPushwooshAndroidInitialized(pushToken) {
  //output the token to the console
  console.warn('push token: ' + pushToken);

  // send token in post request
  postData(url + '/api/v1/devices', { "id": pushToken, "user_id": usr.id }, '')

  var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
  
  //if you need push token at a later time you can always get it from Pushwoosh plugin
  pushNotification.getPushToken(
    function(token) {
      console.warn('push token: ' + token);
    }
  );

  //and HWID if you want to communicate with Pushwoosh API
  pushNotification.getPushwooshHWID(
    function(token) {
      console.warn('Pushwoosh HWID: ' + token);
    }
  );
  
  pushNotification.getTags(
    function(tags) {
      console.warn('tags for the device: ' + JSON.stringify(tags));
    },
    function(error) {
      console.warn('get tags error: ' + JSON.stringify(error));
    }
  );
  
  pushNotification.setLightScreenOnNotification(false);
  
  //settings tags
  pushNotification.setTags({deviceName:"hello", deviceId:10},
    function(status) {
      console.warn('setTags success');
    },
    function(status) {
      console.warn('setTags failed');
    }
  );
}

function registerPushwooshIOS() {
  try {
    var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

    //set push notification callback before we initialize the plugin
    document.addEventListener('push-notification',
      function(event) {
        //get the notification payload
        var notification = event.notification;

        //display alert to the user for example
        alert(notification.aps.alert);

        //clear the app badge
        pushNotification.setApplicationIconBadgeNumber(0);
      }
    );

    //initialize the plugin
    pushNotification.onDeviceReady({pw_appid: API_KEYS["pushwoosh"]["app_id"]});

    //register for pushes
    pushNotification.registerDevice(
      function(status) {
        var deviceToken = status['deviceToken'];
        console.warn('registerDevice: ' + deviceToken);
        onPushwooshiOSInitialized(deviceToken);
      },
      function(status) {
        console.warn('failed to register : ' + JSON.stringify(status));
        //alert(JSON.stringify(['failed to register ', status]));
      }
    );
    
    //reset badges on start
    pushNotification.setApplicationIconBadgeNumber(0);
  } catch(e) {
    PGproxy.navigator.notification.alert(e, function() {}, 'Post Data', 'Done');
  }
}

function onPushwooshiOSInitialized(pushToken) {
  try {
    var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

    // send token in post request
    postData(url + '/api/v1/devices', { "id": pushToken, "user_id": usr.id }, '')

    //retrieve the tags for the device
    pushNotification.getTags(
      function(tags) {
        console.warn('tags for the device: ' + JSON.stringify(tags));
      },
      function(error) {
        console.warn('get tags error: ' + JSON.stringify(error));
      }
    );

    //example how to get push token at a later time 
    pushNotification.getPushToken(
      function(token) {
        console.warn('push token device: ' + token);
      }
    );

    //example how to get Pushwoosh HWID to communicate with Pushwoosh API
    pushNotification.getPushwooshHWID(
      function(token) {
        console.warn('Pushwoosh HWID: ' + token);
      }
    );
  } catch(e) {
    PGproxy.navigator.notification.alert(e, function() {}, 'Post Data', 'Done');
  }
}
