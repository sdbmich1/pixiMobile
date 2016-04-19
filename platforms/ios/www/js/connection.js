document.addEventListener("deviceready", initConnection, false);

function initConnection() {
  document.addEventListener("online", toggleCon, false);
  document.addEventListener("offline", toggleCon, false);

  if(!navigator.onLine) {
    navigator.notification.alert("Sorry, you are offline.", function() {}, "Offline!");
  } 
  else {
    console.log('You are online.');
    // setupButtonHandler();
  }
}

function toggleCon(e) {
  console.log("Called",e.type);
  if(e.type == "offline") {
    $("#searchBtn").off("touchstart").attr("disabled","disabled");
    navigator.notification.alert("Sorry, you are offline.", function() {}, "Offline!");
  } else {
    $("#searchBtn").removeAttr("disabled");
    navigator.notification.alert("You are back online.", function() {}, "Online!");
    //setupButtonHandler();
  }
}
