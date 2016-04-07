// initialize var
var localPixFlg = false;
var url = (localPixFlg) ? 'http://192.168.0.119:3001' : 'http://54.215.187.243';  //staging
//var url = (localPixFlg) ? 'http://192.168.1.7:3001' : 'http://54.67.56.200';  //production
var listPath = url + '/listings';
var pixPath = url + '/pictures.json';
var tmpPath = url + '/temp_listings';
var pxPath = listPath + '/';
var listPage = '../html/show_listing.html';
var homePage = "../html/listings.html";
var catPath = pxPath + 'category.json' ;
var locPath = pxPath + 'local.json';
var plist = '#active-btn, #draft-btn, #sold-btn, #purchase-btn, #sent-inv-btn, #recv-inv-btn, #saved-btn, #want-btn';
var nextPg = 1;
var email, pwd, pid, token, usr, categories, deleteUrl, myPixiPage, invFormType, pxFormType, txnType,
  addr, cover, pgTitle, homeUrl, postType = 'recv';

// ajax setup
$(function(){
  $.ajaxSetup({
    type: 'POST',
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    dataType: 'json'
  });
});

$.event.special.swipe.scrollSupressionThreshold = 10; // More than this horizontal displacement, and we will suppress scrolling.
$.event.special.swipe.horizontalDistanceThreshold = 30; // Swipe horizontal displacement must be more than this.
$.event.special.swipe.durationThreshold = 500;  // More time than this, and it isn't a swipe.
$.event.special.swipe.verticalDistanceThreshold = 75; // Swipe vertical displacement must be less than this

// change page
function goToUrl(pxUrl, rFlg) {
  rFlg = rFlg || false;
  $.mobile.changePage( pxUrl, { transition: "none", reverse: false, reloadPage: rFlg, changeHash: false });
}

// load post page
$(document).on('pageinit', '#myposts', function() {
  loadListPage('recv', 'post'); 
});

// load list page
$(document).on('pageinit', '#mypixis, #myinv', function() {
  if (myPixiPage == 'purchase') {
    dType = 'view';
    togglePath();
  }
  else
    dType = 'inv';
  loadListPage(myPixiPage, dType); 
});

// process next page
$(document).on('click', '.nxt-pg', function(e) {
  console.log('in click nxt pg' + nextPg);
  renderBoard(homeUrl, nextPg);
});

// used to render main board
function renderBoard(hUrl, pg, rFlg) {
  var result;
  uiLoading(true);
  rFlg = rFlg || false;

  nextPg++;  // increment page counter
  var pgName = "../html/listings.html?page=" + nextPg;  // set next page href string
  console.log('in render board' + pgName);
  $('a.nxt-pg').attr('href', pgName);

  var str = (pg == 1 && !rFlg) ? 'board' : 'reload';

  if (hUrl.match(/searches/i)) {
    params = loadSearchParams(pg);
    result = postData(hUrl, params, 'search');
  } else {
    result = loadData(hUrl + "&page=" + pg, str);
  }
  
  return result;
}

// load initial board
$(document).on('pageinit', '#listapp', function() {
  console.log('in listapp pageinit');

  // set token string for authentication
  token = '?auth_token=' + window.localStorage["token"];
  homeUrl = locPath + token + '&loc=' + window.localStorage["home_site_id"];

  // set site id
  $('#site_id').val(window.localStorage["home_site_id"]);
  loadDisplayPage('Search item, store or brand...');
});

function loadDisplayPage(txt) {
  pxPath = listPath + '/';  // reset pxPath
  uiLoading(true);

  // set time ago format
  $("time.timeago").timeago();

  // load main board
  renderBoard(homeUrl, nextPg);
}

// load store page
$(document).on('pageinit', '#store', function() {
  console.log('in store pageinit');
  loadDisplayPage('Search item or brand...');
});

// load pixi form data
$(document).on('pageinit', '#profile-page', function() {
  loadListPage('user', 'user'); 
  pixPopup("#popupPix1");  // load popup page
});

// load invoice form page
$(document).on('pageinit', '#inv-form', function() {
  setInvForm();
});

// load bank account form page
$(document).on('pageinit', '#acct-form', function() {
  if ($('bank-btn').hasClass('ui-btn-active')) {
    if (usr.bank_accounts.length < 1) {
      var data;
      loadBankAcct(data, true);
    }
    else {
      var acct_id = usr.bank_accounts[0].id;
      var invUrl = url + '/bank_accounts/' + acct_id + '.json' + token;
      loadData(invUrl, 'bank');
    }
  }
});

// load 'My Accounts' page
$(document).on('click', '#acct-menu-btn, #cancel-card-btn, #card-btn', function() {
  var cardUrl = url + '/card_accounts.json' + token;
  loadData(cardUrl, 'card'); 
  $('#popupInfo').popup({ history: false });  // clear popup history to prevent app exit
});

// process click on card item
$(document).on('click', ".card-item", function(e) {
  e.preventDefault();

  pid = $(this).attr("data-card-id");
  console.log('pid = ' + pid);

  // clear container
  if ( pid !== undefined && pid != '' ) {
    $('#pixi-list').html('');

    var cardUrl = url + '/card_accounts/' + pid + '.json' + token;
    loadData(cardUrl, 'cardpg'); 
  }
});

// process card delete btn 
$(document).on('click', "#remove-card-btn", function (e) {
  var id = $(this).attr('data-id');
  var cardUrl = url + '/card_accounts/' + pid + '.json' + token;
  deleteData(cardUrl, 'card');
});

// process new card btn
$(document).on('click', "#add-card-btn", function (e) {
  loadCardAcct();
});

// set invoice form
function setInvForm() {
  var data;
  if(invFormType == 'edit' && pid !== undefined) {
    var invUrl = url + '/invoices/' + pid + '.json' + token;
    loadData(invUrl, 'invedit');
  }
  else {
    loadInvForm(data, true);
  }
  $("#navpanel").panel("close");  // close menu panel
}

// load pixi form data
$(document).on('pageinit', '#formapp', function() {

  // if edit mode load pixi data
  if (pxFormType == 'edit') {
    var editUrl = url + '/editpixi' + '.json' + token;
    loadData(editUrl, 'edit', {id:pid});
  }
  else {
    loadYear("#yr_built", 0, 90, '0'); // load year fld
  }

  // load categories
  if (categories !== undefined) {
    loadList(categories, '#category_id', 'Category');
  }
  else {
    // get category data
    var catUrl = url + '/categories.json' + token;
    var data = loadData(catUrl, 'list');
    loadList(data, '#category_id', 'Category');
  }

  $("#category_id").trigger("change"); // update item
  pixPopup("#popupPix");  // load popup page
});

// get user id
function getUserID() {
  return window.localStorage["user_id"];
}

// build image string to display pix 
function getPixiPic(pic, style, fld, cls) {
  cls = cls || '';

  var pstr = (!localPixFlg) ? pic : url + '/' + pic;
  var img_str = '<img class="' + cls + '" style="' + style;
  if (cls === 'lazyload') {
    img_str += '" src="../img/bx_loader.gif" data-src="' + pstr + '"';
  } else {
    img_str += '" src="' + pstr + '"';
  }

  fld = fld || '';  // set fld id
  img_str += (fld.length > 0) ? ' id="' + fld + '">' : '>';
  return img_str
}
// put data based on given url & data type
function putData(putUrl, fdata, dType) {
  console.log('in putData: ' + putUrl);
  var dFlg;

  // turn on spinner
  uiLoading(true);

  // push data to server
  $.ajax({
    url: putUrl, 
    type: "put",
    dataType: "json",
    data: fdata,
    contentType: "application/json",
    success: function(data, status, xhr) {
      console.log('putData success: ' + JSON.stringify(data));

      // load data based on display type
      switch (dType) {
        case 'submit':
          showPixiSuccess(data);
	  break;
        case 'inv':
	  goToUrl('../html/invoices.html');
	  break;
        case 'pixi':
          pxPath = tmpPath;
          goToUrl(listPage);
	  break;
        case 'conv':
          var btn = $('#recv-post-btn').hasClass('ui-btn-active') ? '#recv-post-btn' : '#sent-post-btn'
          showConversations($(btn));
          break;
        case 'post':
          $('#post' + data.id).remove();
          //loadConvPage(data, data !== undefined);
          break;
        case 'unfollow':
          var str = toggle_follow_btn(fdata.seller_id, false);
          $('#store-btn').html('').append(str).trigger("create");
          break;
        default:
          return data;
	  break;
      }
    },
    fail: function (a, b, c) {
        PGproxy.navigator.notification.alert(a.responseText, function() {}, 'Put Data', 'Done');
        console.log(a.responseText + ' | ' + b + ' | ' + c);
  	uiLoading(false);
    }
  });
}

// post data based on given url & data type
function postData(postUrl, fdata, dType) {
  console.log('in postData: ' + postUrl);
  var dFlg, result, data;

  // turn on spinner
  uiLoading(true);

  // process post
  $.post(postUrl, fdata, function(res) {
    dFlg = (res == undefined) ? false : true;  // set flag

    // load data based on display type
    switch (dType) {
      case 'login':
        processLogin(res, dFlg);
	break;
      case 'pixi':
        processPixiData(res);
	break;
      case 'post':
        resetPost(dFlg);
	break;
      case 'inv':
	goToUrl('../html/invoices.html');
	break;
      case 'comment':
        showCommentPage(res);
	break;
      case 'bank':
        invFormType == 'new' ? loadInvForm(data, true) : loadBankPage(res, dFlg); 
	break;
      case 'reply':
        loadConvPage(res.conversation, dFlg);
	break;
      case 'card':
        console.log(JSON.stringify(res));
        loadCardList(res, dFlg);
        break;
      case 'buy':
        var str = $.parseJSON(res.order);
	pid = parseInt(str['invoice_id']);
        openTxnPage('pixi');
	break;
      case 'follow':
	var str = toggle_follow_btn(fdata.seller_id, true);
	$('#store-btn').html('').append(str).trigger("create");
	break;
      case 'search':
	$('#search-btn').prop('disabled', false);
	result = processReload(res, dFlg);
	break;
      default:
        return res;
	break;
    }
  },"json").fail(function (a, b, c) {
  	uiLoading(false);
        PGproxy.navigator.notification.alert(a.responseText, function() {}, 'Post Data', 'Done');
        console.log(a.responseText + ' | ' + b + ' | ' + c);
  });
  return result;
}

// delete server data
function deleteData(delUrl, dType) {
  console.log('delUrl = ' + delUrl);
  $.ajax({
    url: delUrl, 
    type: "post",
    dataType: "json",
    data: {"_method":"delete"},
    success: function(data) {
      switch (dType) {
        case 'remove':
          goToUrl(homePage);
          break;
        case 'card':
          $('#pixi-list').html('');
          loadCardList(data, isDefined(data));
          break;
      };
    },
    fail: function (a, b, c) {
        PGproxy.navigator.notification.alert(a.responseText, function() {}, 'Delete Data', 'Done');
        console.log(a.responseText + ' | ' + b + ' | ' + c);
  	uiLoading(false);
    }
  });
}

// process images
function processPix(pixArr, style) {
  var img_str;
  
  if($.isArray(pixArr)){
    var len = pixArr.length;
    console.log('Rows found: ' + len);

    for (var i = 0; i < len; i++){
      img_str = '<img style="' + style + '" src="' + url + pixArr[i].photo_url + '">';
    }
  }
  return img_str;
}

// get pixi picture
function getName(cid, token) {
  var cat_name; 

  console.log('in getName');
  $.getJSON(catPath + cid + '.json' + token, function(res) {
    $.each(res.results, function(index, item) {
      cat_name = res_name;
    });
  });

  return cat_name;
}

// hide form btn
function hide_btn() {
  if( $('#comment-btn').length > 0 ) {
    $("#comment-btn").parent().hide();
  }

  if( $('#contact-btn').length > 0 ) {
    $("#contact-btn").parent().hide();
  }
}

// force pages to be refresh
$(document).on('pagehide', 'div[data-role="page"]', function(event, ui) {
  $(event.currentTarget).remove();
});

// process active btn
$(document).on('click', '#bill-menu-btn', function(e) {
  if(usr !== undefined)  
    invFormType = (usr.bank_accounts.length > 0) ? 'inv' : 'bank';
  else 
    invFormType = 'new';  // set var
  console.log('invFormType = ' + invFormType);
});

function openTxnPage(ttype) {
  txnType = ttype;
  goToUrl('../html/transaction.html');
}

// process pay btn
$(document).on('click', '#pay-btn', function(e) {
  openTxnPage('invoice');
  return false;
});

// process menu btn
$(document).on('click', '#inv-menu-btn', function(e) {
  myPixiPage = 'sent';  // set var
  return false;
});

// process menu btn
$(document).on('click', '#pixis-menu-btn', function(e) {
  myPixiPage = 'purchase';  // set var
  togglePath();
  return false;
});

// process menu btn
$(document).on('click', '#signout-menu-btn', function(e) {
  var curToken = window.localStorage["token"];
  var logoutUrl = url + '/api/v1/sessions/' + curToken + '.json';

  // check if app exit
  navigator.notification.confirm('Close App?', onExitConfirm, 'Exit', 'No, Yes');

  // process request
  deleteData(logoutUrl, 'exit');
  return false;
});

// reset nav-bar active class
function resetActiveClass($this) {
  
  // remove active class
  var $headers = $(document).find('div[data-role="header"]');
  $headers.find('a').removeClass("ui-btn-active");

  // set active class
  $this.addClass("ui-btn-active");
}

// process list btn click
$(document).on('click', '#profile-nav-btn, #contact-nav-btn, #prefs-nav-btn', function(e) {
  var $this = $(this);
  var sType = $this.attr('data-dtype'); 

  // reset active class
  resetActiveClass($this);

  // clear container
  $('#usr-prof').html('');

  // load page
  loadListPage(sType, sType);
  return false;
});

// show conversations
function showConversations(currBtn) {
  postType = currBtn.attr('data-dtype'); 

  // reset active class
  resetActiveClass(currBtn);

  // remove buttons from individual conversation
  $('#conv-top').empty();
  $('#conv-bot').empty();

  // load post page
  loadListPage(postType, 'post');
}

// process list btn click
$(document).on('click', '#sent-post-btn, #recv-post-btn', function(e) {
  showConversations($(this));
  return false;
});

// process list btn click
$(document).on('click', plist, function(e) {
  var $this = $(this);

  // reset active class
  resetActiveClass($this);

  // set var to active item
  myPixiPage = $this.attr('data-view'); 
  var dType = $this.attr('data-dtype'); 
  console.log('myPixiPage = ' + myPixiPage);
  console.log('dType = ' + dType);

  // set correct path 
  togglePath();

  // clear container
  $('#pixi-list').html('').listview('refresh');

  // load list page
  loadListPage(myPixiPage, dType);
  return false;
});

// submit new pixi to board
$(document).on('click', '#submit-pixi-btn', function(e) {
  var sType = $('#px-status').attr('data-status-type');
  var path = (sType == 'edit') ? '/resubmit' : '/submit'; 
  var submitUrl = url + path + '.json' + token;

  putData(submitUrl, {id:pid}, 'submit');
  return false;
});

// confirm cancellation
$(document).on('click', '#cancel-pixi-btn, #px-cancel', function(e) {
  e.preventDefault();
  navigator.notification.confirm('Are you sure? All changes will be lost!', onConfirm, 'Cancel', 'No, Yes');
});

// confirm removal
$(document).on('click', '#remove-pixi-btn, #rm-acct-btn', function(e) {
  console.log('in click remove btn');
  e.preventDefault();
  var acct_id = $(this).attr("data-acct-id");

  // set url 
  if(acct_id.length > 0) {
    deleteUrl = url + '/bank_accounts/' + acct_id + '.json' + token;
  }
  else {
    deleteUrl = url + '/temp_listings/' + pid + '.json' + token;
  }
  navigator.notification.confirm('Are you sure? Your data will be removed!', onRemoveConfirm, 'Remove', 'No, Yes');
});

// go back to login page
$(document).on('click', '#login-btn', function(e) {
  e.preventDefault();
  goToUrl('../index.html');  // go to login page
});

// process confirmation
function onExitConfirm(button) {
  if (button == 2) {
    navigator.app.exitApp();
  }
}

// process confirmation
function onConfirm(button) {
  if (button == 2) {
    goToUrl(homePage, false);  // go to main board
  }
}

// process confirmation
function onRemoveConfirm(button) {
  if (button == 2) {
    deleteData(deleteUrl, 'remove');  // delete record
  }
}

// toggle page display
$(document).on('click', '#loc-nav', function(e) {
  reset_top('#pixi-loc', '#cat-top, #px-search');
});

// toggle menu state
$(document).on('click', '#cat-nav', function(e) {
  reset_top('#cat-top', '#pixi-loc, #px-search');
});

// toggle menu state
$(document).on('click', '#search-nav', function(e) {
  reset_top('#px-search', '#pixi-loc, #cat-top');
});

// toggle menu state
$(document).on('click', '#home-link1', function(e) {
  console.log('in home-link click');
  reset_top('#px-search', '#pixi-loc, #cat-top, #px-search');
});

// reset top when selection is toggled
function reset_top(tag, str) {
  $(tag).toggle();
  $(str).hide(300);

  if ($('#pixi-loc').is(':visible') || $('#cat-top').is(':visible') || $('#px-search').is(':visible')) {
    $(".nearby-top").css('margin-top', '40px'); }
  else {
    $(".nearby-top").css('margin-top', '0'); 	
  }
}

// toggle profile state
$(document).on('click', '.edit-prof-btn', function(e) {
  $('#edit-profile').toggle();
});

// toggle credit card address display
$(document).on('click', '#edit-txn-addr', function(e) {
  $('.user-tbl, .addr-tbl').toggle();
});

$(document).on('click', '#edit-ship-addr', function(e) {
  $('.rcpt-tbl, .ship-addr-tbl').toggle();
});

// toggle spinner
function uiLoading(bool) {
  (bool) ? $('body').addClass('ui-loading') : $('body').removeClass('ui-loading');
}

// toggle contact buttons
$(document).on('click', "#contact-btn", function (e) {
  var txt =  $('#content').val();

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params.post = { content: txt,  user_id: $('#user_id').val(), pixi_id: $('#pixi_id').val(), recipient_id: $('#recipient_id').val() };

    // set path
    var pxUrl = url + '/posts.json' + token;

    // post data
    postData(pxUrl, params, 'post');
  }
});

// add follower
$(document).on('click', "#follow-btn", function (e) {
  var sid = $(this).attr("data-seller_id");
  console.log('sid = ' + sid);

  if (sid.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params = { uid: getUserID(), seller_id: sid };

    // set path
    var pxUrl = url + '/favorite_sellers.json' + token;

    // post data
    postData(pxUrl, params, 'follow');
  }
});

// buy now
$(document).on('click', "#buy-btn", function (e) {
  var xid = $(this).attr("data-pixi-id");

  if (xid.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params = { id: xid, qty: $('#px_qty').val(), fulfillment_type_code: $('#ftype').val() };

    // set path
    var pxUrl = url + '/pixi_wants/buy_now.json' + token;

    // post data
    postData(pxUrl, params, 'buy');
  }
});

// remove follower
$(document).on('click', "#unfollow-btn", function (e) {
  var sid = $(this).attr("data-seller_id");
  console.log('sid = ' + sid);

  if (sid.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params = { uid: getUserID(), seller_id: sid };

    // set path
    var pxUrl = url + '/favorite_sellers/1.json' + token;

    // put data
    putData(pxUrl, JSON.stringify(params), 'unfollow');
  }
});

// reset pixi page after successful post
function resetPost (resFlg) {
  $("#contact-btn").removeAttr("disabled");

  if (resFlg) {
    $("#content").html('').val('');
    PGproxy.navigator.notification.alert("Your post was sent successfully.", function() {}, 'Post', 'Done');
  }
  else {
    PGproxy.navigator.notification.alert("Your post was not delivered.", function() {}, 'Post', 'Done');
  }
  uiLoading(false);
}

// toggle comment & comment buttons
$(document).on('click', "#comment-btn", function (e) {
  var txt =  $('#content').val();

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params.comment = { content: txt,  user_id: $('#user_id').val(), pixi_id: $('#pixi_id').val() };

    // set path
    var pxUrl = url + '/comments.json' + token;

    // post data
    postData(pxUrl, params, 'comment');
  }
});

// process reply btn 
$(document).on('click', "#reply-btn", function (e) {
  e.preventDefault();
  var txt =  $('#reply_content').val();
  var id = $(this).attr('data-conv-id');
  console.log('reply btn li = ' + id);

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();
    params.id = id;
    params.post = {
      content: txt,
      user_id: $('#user_id').val(),
      pixi_id: $('#pixi_id').val(),
      recipient_id: $('#recipient_id').val()
    };

    // set path
    var pxUrl = url + '/conversations/reply.json' + token;

    // post data
    postData(pxUrl, params, 'reply');
  }
});

// process conversation delete btn 
$(document).on('click', "#conv-del-btn", function (e) {
  var id = $(this).attr('data-conv-id');
  var params = { 'id': id };
  var pxUrl = url + '/conversations/' + id + '/remove.json' + token;
  putData(pxUrl, JSON.stringify(params), 'conv');
});

// process post delete btn 
$(document).on('click', "#del-post-btn", function (e) {
  var id = $(this).attr('data-post-id');
  var params = { 'id': id };
  var pxUrl = url + '/posts/' + id + '/remove.json' + token;
  putData(pxUrl, JSON.stringify(params), 'post');
});

// process bill/pay btn 
$(document).on('click', "#conv-inv-btn", function (e) {
  pid = $(this).attr("data-inv-id");
  if ($(this).text() == 'Bill') {
    invFormType = 'new';
    goToUrl('../html/invoice_form.html');
    setInvForm();
  } else {
    goToUrl('../html/invoice.html');
    var invUrl = url + '/invoices/' + pid + '.json' + token;
    loadData(invUrl, 'invpg');
  }
});

// hide preview when collapsible is expanded
$(document).bind('expand collapse', function () {
  $(this).find('.ui-collapsible').each(function(index, element) {
    if ($(element).hasClass('ui-collapsible-collapsed')) {
      $(element).find('.ui-collapsible-preview').show();
    } else {
      $(element).find('.ui-collapsible-preview').hide();
    }
  });
});

// user signup form
$(document).on("click", "#signup-btn", function(e) {
  console.log('in user signup form');
  uiLoading(true);

  $("#signup-btn").attr("disabled","disabled");

  var pxUrl = url + '/signup.json';
  var imageURI = $('#smallImage').attr("src");

  // set params
  var params = new Object();
  var dt = new Date($('#birth_mo').val() + '/' + $('#birth_dt').val() + '/' + $('#birth_yr').val());
  params.user = { first_name: $('#first_name').val(), last_name: $('#last_name').val(), gender: $('#gender').val(),
    email: $('#email').val(), password: $('#password').val(), password_confirmation: $('#password_confirmation').val(), birth_date: dt }; 

  uploadPhoto(imageURI, pxUrl, params);
  return false;
});

// process active btn
$(document).on('click', '#edit-inv-btn', function(e) {
  console.log('edit inv btn #1');
  uiLoading(true);

  //disable the button so we can't resubmit while we wait
  $(this).attr("disabled","disabled");

  invFormType = 'edit';  // set var
  pid = $(this).attr('data-inv-id');   // get inv id

  // open invoice page
  goToUrl('../html/invoice_form.html');

  // process invoice data
  setInvForm();
});

// remove invoice form
$(document).on("click", "#remove-inv-btn", function(e) {
  console.log('in remove invoice-btn');
  uiLoading(true);

  //disable the button so we can't resubmit while we wait
  $(this).attr("disabled","disabled");

  // get invoice id
  var inv_id = $(this).attr("data-inv-id");

  if(inv_id.length > 0) {
    deleteUrl = url + '/invoices/' + inv_id + '.json' + token;
    navigator.notification.confirm('Are you sure? Your invoice will be removed!', onRemoveConfirm, 'Remove', 'No, Yes');
  }
});

// submit invoice form
$(document).on("click", "#add-inv-btn", function(e) {
  console.log('in submit invoice-form');
  var tot =  $('#inv_total').val();
  var inv_id =  $('#inv_id').val();

  if (tot.length > 0) {
    uiLoading(true);
    $("#add-inv-btn").attr("disabled","disabled");  // disable form submit button

    // store form data
    var params = new Object();
    params.invoice = { amount: tot, buyer_id: $('#buyer_id').val(), pixi_id: $('#pixi_id').val(), seller_id: $('#seller_id').val(), 
      quantity: $('#inv_qty').val(), price: $('#inv_price').val(), comment: $('#comment').val(), subtotal: $('#inv_amt').val(),
      sales_tax: $('#inv_tax').val(), tax_total: $('#inv_tax_total').val() }; 

    // post data
    if (invFormType == 'edit') {
      var pxUrl = url + '/invoices/' + inv_id + '.json' + token;
      putData(pxUrl, JSON.stringify(params), 'inv');
    }
    else {
      var pxUrl = url + '/invoices.json' + token;
      postData(pxUrl, params, 'inv');
    }
  }
});

// submit bank account form
$(document).on("click", "#add-acct-btn", function(e) {
  console.log('in submit bank account-form');

  var acct_no =  $('#acct_number').val();
  var rte_no =  $('#routing_number').val();

  if (acct_no.length > 0 && rte_no.length > 0) {
    uiLoading(true);
    $("#add-acct-btn").attr("disabled","disabled");  // disable form submit button

    // store form data
    var params = new Object();
    params.bank_account = { user_id: $('#user_id').val(), acct_number: $('#acct_number').val(), routing_number: $('#routing_number').val(), 
      acct_name: $('#acct_name').val(), acct_type: $('#acct_type').val(), description: $('#bank_acct_descr').val() }; 

    // post data
    var pxUrl = url + '/bank_accounts.json' + token;
    postData(pxUrl, params, 'bank');
  }
});

// submit pixi form
$(document).on("click", "#add-pixi-btn", function(e) {
  console.log('in submit pixi-form');
  uiLoading(true);

  $("#add-pixi-btn").attr("disabled","disabled");  // disable form submit button

  var imageURI = $('#smallImage').attr("src");
  var params = new Object();

  // set params
  params.temp_listing = { title: $('#title').val(), site_id: $('#site_id').val(), category_id: $('#category_id').val(),
    price: $('#price').val(), description: $('#description').val(), compensation: $('#salary').val(), year_built: $('#yr_built').val(),
    event_start_date: $('#start-date').val(), event_end_date: $('#end-date').val(), post_ip: usr.current_sign_in_ip, 
    event_start_time: $('#start-time').val(), event_end_time: $('#end-time').val(), start_date: new Date(), seller_id: usr.id };

  // push to server
  if (pxFormType == 'edit') {
    var pxUrl = tmpPath + '/' + pid + '.json' + token;
  }
  else {
    var pxUrl = tmpPath + '.json' + token;
  }

  uploadPhoto(imageURI, pxUrl, params);
  return false;
});

// complete post pixi process
function processPixiData(res) {

  if (res !== undefined) {
    console.log('post pixi success');
  }
  else {
    console.log('post pixi failed');
  }
}

// submit login form
$(document).on("submit", "#loginForm", function(e) {
  handleLogin(); // process login
  return false;
});

function handleLogin() {
  console.log('in handlelogin');
  uiLoading(true);

  //disable the button so we can't resubmit while we wait
  $("#signin-btn").attr("disabled","disabled");

  // set vars
  email = $("#email").val();
  pwd = $("#password").val();

  var fdata = $("#loginForm").serialize();
  var loginUrl = url + '/api/v1/sessions.json';

  // process login
  postData(loginUrl, fdata, 'login');
}

// complete login process
function processLogin(res, resFlg) {
  if(resFlg) {
    if(res.token.length > 0) {
      console.log('login success');

      // set user
      usr = res.user;
      console.log('user id = '+ usr.id);
      console.log('user pixi count = '+ usr.pixi_count);
      console.log('user email = '+ email);

      //store credentials on device
      window.localStorage["email"] = email;
      window.localStorage["password"] = pwd;
      window.localStorage["token"] = res.token;
      window.localStorage["user_id"] = usr.id;
      window.localStorage["pixi_count"] = usr.pixi_count;

      // go to main board
      console.log('open listings');
      goToUrl("./html/listings.html", false);
    }
    else {
      console.log('login failed');
      $("#signin-btn").removeAttr("disabled");
      PGproxy.navigator.notification.alert("No token found", function() {}, 'Login', 'Done');
    }
  }
  else {
    console.log('login failed');
    $("#signin-btn").removeAttr("disabled");
    PGproxy.navigator.notification.alert("Login failed", function() {}, 'Login', 'Done');
  }
  uiLoading(false);
}

// check if credentials are already set locally
function checkPreAuth() {
  console.log("checkPreAuth");
  var $form = $("#loginForm");

  if(window.localStorage["email"] != undefined && window.localStorage["password"] != undefined) {
    console.log("in local storage");

    $("#email", $form).val(window.localStorage["email"]);
    $("#password", $form).val(window.localStorage["password"]);

    // process login
    handleLogin();
  }
}

// open camera page
$(document).on('click', "#add-pixi-link", function (e) {
  pxFormType = '';
  goToUrl("../html/new_temp_listing.html", false);
});


// edit listing
$(document).on('click', "#edit-pixi-btn", function (e) {
  pxFormType = 'edit'; 
  goToUrl("../html/new_temp_listing.html", false);
});

// add autocomplete for location fields
$(document).on('keyup', '#site_name, #buyer_name', function (e, ui) {
  var $this = $(this);
  if ($.mobile.activePage.attr("id") == 'formapp') {
    var searchUrl = url + "/loc_name.json" + token;
  }
  else {
    var searchUrl = url + "/buyer_name.json" + token;
  }
  processAutocomplete(searchUrl, $this);
}); 

// process autocomplete logic
function processAutocomplete(url, $this) {
  var nxtID = $this.next();
  var text = $this.val();
  var $sugList = $(".suggestions");

  if(text.length < 3) {
    $sugList.html('');
  }
  else {
    loadData(url, 'autocomplete', {search:text});
  }
}

// process click on autocomplete site name 
$(document).on('click', ".ac-item", function(e) {
  e.preventDefault();

  var sid = $(this).attr("data-res-id");
  var sname = $(this).html();
  console.log('sid = ' + sid);
  console.log('sname = ' + sname);

  // set fld values
  if ($.mobile.activePage.attr("id") == 'formapp') {
    $('#site_id').val(sid);
    $('#site_name').val(sname);
  }
  else {
    $('#buyer_id').val(sid);
    $('#buyer_name').val(sname);
  }
  $('.suggestions').html('');  // clear list
});

// toggle pixi path
function togglePath() {
  pxPath = (myPixiPage == 'draft') ? tmpPath + '/' : listPath + '/';
}

// process click on board pix
$(document).on('click', ".bd-item, .pixi-link", function(e) {
  e.preventDefault();

  // reset vars
  pid = $(this).attr("data-pixi-id");
  console.log('pid = ' + pid);

  // set correct path 
  togglePath();

  if ( pid !== undefined && pid != '' ) {
    goToUrl(listPage);
  }
});

// process click on invoice item
$(document).on('click', ".inv-item", function(e) {
  e.preventDefault();

  pid = $(this).attr("data-inv-id");
  console.log('pid = ' + pid);

  if ( pid !== undefined && pid != '' ) {
    goToUrl('../html/invoice.html', false);
  }
});

// set data for txn form page
$(document).on("pageinit", "#txn-form", function(event, ui) {
  var invUrl = url + '/invoices/' + pid + '.json' + token;

  // load inv data
  loadData(invUrl, 'txn', txnType); 
  $('#popupInfo').popup({ history: false });  // clear popup history to prevent app exit
});

// set data for 'My Stores' page
$(document).on("pageinit", "#storeList", function(event) {
  var storeUrl = url + '/favorite_sellers.json' + token + '&ftype=buyer&status=active';
  
  // load inv data
  loadData(storeUrl, 'stores'); 
});

// process click on conversation item
$(document).on('click', ".conv-item", function(e) {
  e.preventDefault();

  pid = $(this).attr("data-conv-id");
  console.log('pid = ' + pid);

  // clear container
  if ( pid !== undefined && pid != '' ) {
    $('#pixi-list').html('');

    var convUrl = url + '/conversations/' + pid + '.json' + token;
    loadData(convUrl, 'conv', { 'id': pid }); 
  }
});

// parameter for show listing page
$(document).on("pageinit", "#show_listing, #comment-page", function(event) {
  var pixiUrl = pxPath + pid + '.json' + token;
  
  // load pixi data
  loadData(pixiUrl, 'pixi'); 
});

// parameter for signup page
$(document).on("pageinit", "#signup", function(event) {
  var data;
  loadUserPage(data, true);
  pixPopup("#popupPix2");  // load popup page
});

// parameter for show listing page
$(document).on("pageinit", "#show-invoice", function(event) {
  $('#popupInfo').popup({ history: false });  // clear popup history to prevent app exit
  console.log('pageinit show invoice');
  getInvoice();
});

// process register click
$(document).on("click", "#register-btn", function(e) {
  console.log('register btn');
  e.stopImmediatePropagation();
  e.preventDefault();

  // open page
  goToUrl('./html/register.html');
  return false;
});

// get invoice data
function getInvoice(data) {
  data = data || '';
  console.log('get invoice data = ' + data);

  if(data.length > 0) {
    var invUrl = url + '/invoices/' + data.invoice.id + '.json' + token;
  }
  else {
    var invUrl = url + '/invoices/' + pid + '.json' + token;
  }
  
  // load inv data
  loadData(invUrl, 'invpg'); 
}

// process px done click
$(document).on("click", "#px-done-btn, #done-btn", function(e) {
  e.preventDefault();
  goToUrl(homePage);
});

// process menu click
$(document).on("click", ".sl-menu", function(e) {
  e.preventDefault();

  href = $(this).attr("href");
  if ( href !== undefined && href !== '' ) {

    // check for invoice form page
    if ($.mobile.activePage.attr("id") == 'inv-form' && $(this).attr("id") == 'bill-menu-btn') {
      setInvForm(); 
    } 

    // set flg for navigation after acct creation
    if ($(this).attr("id") == 'bill-menu-btn') {
      invFormType = (usr.bank_accounts.length < 1) ? 'new' : 'inv';
    }

    // set to most recent unpaid invoice
    if ($(this).attr("id") == 'pay-menu-btn') {
      pid = usr.unpaid_received_invoices[0].id;
      console.log('sl menu pid = ' + pid);
    }

    // open page
    goToUrl(href, false);
  }
});

$(document).on("click", "#home-menu-btn", function(e) {
  var activePage = $.mobile.activePage.attr("id");
  nextPg = 1;
    goToUrl(homePage, true);
});

var menu = [
  { title: 'Home', href: '#', icon: '../img/home_button_blue.png', id: 'home-menu-btn' },
  { title: 'Send Bill', href: '../html/invoice_form.html', icon: '../img/162-receipt.png', id: 'bill-menu-btn' },
  { title: 'Pay Bill', href: '../html/invoice.html', icon: '../img/rsz_pixipay_wings_blue.png', id: 'pay-menu-btn' },
  { title: 'MY STUFF', href: '#', icon: '', id: 'menu-divider' },
  { title: 'My Pixis', href: '../html/pixis.html', icon: '../img/pixi_wings_blue.png', id: 'pixis-menu-btn' },
  { title: 'My Messages', href: '../html/posts.html', icon: '../img/09-chat-2.png', id: 'posts-menu-btn' },
  { title: 'My Invoices', href: '../html/invoices.html', icon: '../img/bill.png', id: 'inv-menu-btn' },
  { title: 'My Accounts', href: '../html/accounts.html', icon: '../img/190-bank.png', id: 'acct-menu-btn' },
  { title: 'My Settings', href: '../html/user_form.html', icon: '../img/19-gear.png', id: 'settings-menu-btn' },
  { title: 'My Stores', href: '../html/store_list.html', icon: '../img/store.png', id: 'store-menu-btn' },
  { title: 'Sign out', href: '../index.html', icon: '../img/logout.png', id: 'signout-menu-btn' },
];

// show menu
$(document).on("pageshow", function(event) {
  var activePage = $.mobile.activePage.attr("id");
  if (activePage == 'listapp' || activePage == 'store') {
    console.log('in pageshow');
    var txt = (activePage == 'listapp') ? 'Search item, store or brand...' : 'Search item or brand...';
    loadSearch(txt);
    if (activePage == 'listapp') {
      cover = window.localStorage['home_image'];
      pgTitle = window.localStorage['home_site_name'];
      load_cover(true, '', 0);
    }
  }

  var items = '', // menu items list
    ul = $(".mainMenu:empty");  // get "every" mainMenu that has not yet been processeD
  
  // build menu items
  for (var i = 0; i < menu.length; i++) {
    var item_str = '';

    if(menu[i].id == 'menu-divider') {
      items += '<li data-role="list-divider" data-mini="true">' + menu[i].title + '</li>';
      continue;
    }

    // if user exists then toggle invoice-related items based on counts
    if(usr !== undefined) { 
      if(menu[i].id == 'bill-menu-btn') {
        if (usr.pixi_count < 1) {
          console.log('usr has no active pixis');
          continue;
	}
/*
        if (usr.bank_accounts.length < 1) {
	  menu[i].href = '../html/accounts.html';
	}
*/
      }

      if(usr.unpaid_invoice_count < 1 && menu[i].id == 'pay-menu-btn') {
        console.log('usr has no unpaid invoices');
        continue;
      }

      // add post count if posts menu item
      if(menu[i].id == 'posts-menu-btn') {
        item_str = '<div id="postMenu" class="ui-li-count">' + usr.unread_count + '</div>';
      }
    }

    // add menu item
    items += '<li data-mini="true"><a href="' + menu[i].href + '" id="' + menu[i].id 
      + '" class="sl-menu"><img class="ui-li-icon" src="' + menu[i].icon + '">' + menu[i].title + item_str + '</a></li>'; 
  }

  // append items
  ul.append(items).listview('refresh');
});

// check JSON returned booleans
function parseBoolean(str) {
  return /true/i.test(str);
}

// process menu click
$(document).on("click", "#show-cmt, #show-pixi", function(e) {
  uiLoading(true);  // toggle spinner

  // show pixi comments
  if ($.mobile.activePage.attr("id") !== 'comment-page') 
    { goToUrl('../html/comments.html'); }  
  else
    { goToUrl(listPage); }  
 
  return false;
});

// build popup dialog for use on multiple pages
function pixPopup(fld) {
  console.log('in pixPopup');
  var pop_str = '<ul data-role="listview" data-icon="false" data-inset="true" style="min-width:210px;" data-theme="a">'
    + '<li data-role="divider" data-theme="b">Choose Photo Source</li>'
    + '<li data-theme="a"><a href="#" id="camera"><img src="../img/rsz_camera_256.png">Camera</a></li>'
    + '<li data-theme="a"><a href="#" id="gallery"><img src="../img/rsz_gallery_icon.png">Gallery</a></li>'
    + '<li data-theme="a"><a href="#" id="album"><img src="../img/rsz_photoalbum.png">Photo Album</a></li></ul>';

  $(fld).append(pop_str).trigger('create');
  $(fld).popup({ history: false });  // clear popup history to prevent app exit
}

// set current date
function curDate() {
  var d = new Date();
  var month = d.getMonth()+1;
  var day = d.getDate();

  var output = ((''+month).length<2 ? '0' : '') + month + '/' +
        ((''+day).length<2 ? '0' : '') + day + '/' + d.getFullYear(); 

  return output;
}

// builds list page
function build_list(cls, localUrl, pic, hdr, txt, cnt, tag) {
  cnt = cnt || "";
  tag = tag || "li"
  var str = "<" + tag + " class='plist'>" + '<a href="#" ' + localUrl + ' class="pending_title ' + cls + '" data-ajax="false">'  
    + pic + '<div class="neg-mleft5 pstr"><h6>' + hdr + '</h6></div>' + '<div id="mlist"><p>' + txt + '</p></div></a>'
    + cnt + '</' + tag + '>';
  return str;
}

// build collapsible list item
function buildCollapsibleList(pic, hdr, hdr2, preview, ftr, id) {
  return '<div data-role="collapsible" data-collapsed="false" data-iconpos="right"'
       +   ' data-inset="false" class="collapsible-item" id="post' + id + '">'
       +   '<h3>' + pic
       +     '<span class="pstr left-hdr">' + hdr + '</span>'
       +     '<span class="pstr nav-right">' + hdr2 + '</span>'
       +     '<span class="ui-li-desc ui-collapsible-preview truncate">'
       +        preview
       +     '</span>'
       +   '</h3>'
       +   "<p class='inv-descr mleft5'>" + ftr + "</p>"
       + '</div>'
}

var isScrolled = false;

$('.featured-container').on("swipeleft, swiperight", function (e) {
  console.log('in listapp swipe event');
  var activePage = $.mobile.activePage.attr("id");
  if (activePage == 'listapp' || activePage == 'store') {
    $(document).off("scrollstop");
    isScrolled = true;
  }
});

$(document).on("scrollstop", checkScroll);
function checkScroll() {
  var activePage = $.mobile.activePage.attr("id");
  if (activePage == 'listapp' || activePage == 'store') {

    /* window's scrollTop() */
    //console.log('in checkScroll');
    scrolled = $(this).scrollTop(),

    /* viewport */
    screenHeight = $.mobile.getScreenHeight(),

    /* content div height within active page */
    contentHeight = $(".ui-content", activePage).outerHeight(),

    /* header's & footer's height within active page (remove -1 for unfixed) */
    header = $(".ui-header", activePage).outerHeight() - 1,
    footer = $(".ui-footer", activePage).outerHeight() - 1,

    /* total height to scroll */
    scrollEnd = contentHeight - screenHeight + header + footer;
    //console.log('scrolled = ' + scrolled);
    //console.log('scrollEnd = ' + scrollEnd);
    
    if (scrolled >= scrollEnd && !isScrolled) {
      addMore(activePage);
      isScrolled = true;
    }
  }
}

function addMore(page) {
  /* remove scrollstop event listener */
  $(document).off("scrollstop");

  setTimeout(function() {
    //renderBoard(homeUrl, nextPg);

    /* re-attach scrollstop */
    $(document).on("scrollstop", checkScroll);
    isScrolled = false;
  }, 500);
}

// default for rendering page buttons
function showButton(tag, id, title, theme, btnID, cls, sz, tag2, id2) {
  cls = cls || ''; tag2 = tag2 || ''; id2 = id2 || ''; sz = sz || 'false';
  var id_str = (tag2 == '') ? tag + "='" + id + "'": tag + "=" + id + tag2 + "=" + id2; 
  var str= "<a href='#' " + id_str + " data-mini='" + sz + "' data-role='button' data-theme='" + theme + "' id='" + btnID + "' class='" + cls + "'>" 
    + title + "</a>";
  return str;
}
