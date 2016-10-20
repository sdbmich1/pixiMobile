var pictureSource;
var destinationType;

$(document).on('pageinit','#formapp, #signup, #user_form',function(){
  console.log('in init camera');
  pictureSource = navigator.camera.PictureSourceType;
  destinationType = navigator.camera.DestinationType;
}); 

// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  console.log(imageData);

  // Get image handle
  var smallImage = document.getElementById('smallImage');

  // Unhide image elements
  smallImage.style.display = 'block';

  // Show the captured photo
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the base64 encoded image data
  console.log(imageURI);

  // Get image handle
  var largeImage = document.getElementById('largeImage');

  // Unhide image elements
  largeImage.style.display = 'block';

  // Show the captured photo
  largeImage.src = imageURI;
}

// Take picture using device camera and retrieve image as base64-encoded string
function capturePhoto() {
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
}

// Retrieve image file location from specified source
function getPhoto(source) {
  console.log('in getPhoto');
  navigator.camera.getPicture(setImage, onFail, { quality: 70, 
    destinationType: destinationType.FILE_URI,
    correctOrientation : true,
    targetWidth: 500,
    targetHeight: 375,
    sourceType: source });
}

// Retrieve image file location from specified source
$(document).on('click', "#camera", function(e){
  console.log('In camera');
  e.preventDefault();
  getPhoto(pictureSource.CAMERA);
});

// Retrieve image file location from specified source
$(document).on('click', "#gallery", function(e){
  console.log('photo library');
  e.preventDefault();
  getPhoto(pictureSource.PHOTOLIBRARY);
});

// Retrieve image file location from specified source
$(document).on('click', "#album", function(e){
  console.log('photo album');
  e.preventDefault();
  getPhoto(pictureSource.SAVEDPHOTOALBUM);
});

// store image in DOM
function setImage(imageURI) {
  console.log('in setImage');
  $("#smallImage").attr("src", imageURI);
   
  var $popups = $(document).find('div[data-role="popup"]');
  $popups.popup("close");  // close pix popup
}

// uploads image to server
function uploadPhoto(imageURI, path, params, method) {
  console.log('in upload photo');

  var options = new FileUploadOptions();
  options.chunkedMode = true;
  options.fileKey = "file";
  options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
  options.mimeType="image/jpeg";
  options.httpMethod = method || 'POST';
  options.params = params;

  // transfer file
  var ft = new FileTransfer();
  ft.upload(imageURI, encodeURI(path), onSuccess, onFail, options);
}

// success handler
function onSuccess(r) {
  console.log("Code = " + r.responseCode);
  console.log("Response = " + r.response);
  console.log("Sent = " + r.bytesSent);

  var result = $.parseJSON(r.response)

  // process pixi
  if(result['listing'] !== undefined) {
    console.log('response pixi id = ' + result['listing']['pixi_id']);
    pid = result['listing']['pixi_id'];  // reset pid
    pxPath = tmpPath + '/';
    goToUrl(listPage);
  }

  if(result['user'] !== undefined) {
    console.log('response email = ' + result['user']['email']);
    goToUrl('../index.html');  // go to login page
    PGproxy.navigator.notification.alert("Signup successful. A confirmation email was sent to your account.", function() {}, 'Signup', 'Done');
  }
  uiLoading(false);
}

// error handler
function onFail(error) {
  PGproxy.navigator.notification.alert("An error has occurred: Code = " + error.code, function() {}, 'Upload', 'Done');
  console.log("upload error source " + error.source);
  console.log("upload error target " + error.target);
  console.log("upload error body " + error.body);
  console.log("upload error exception " + error.exception);
  $("#signup-btn, #add-pixi-btn").prop('disabled', false); //.removeAttr("disabled");
  uiLoading(false);
}

