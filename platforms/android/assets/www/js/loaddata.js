var states_str = '';

// load data based on given url & display type
function loadData(listUrl, dType, params) {
  console.log('in loadData: ' + listUrl);
  var dFlg, result;

  // turn on spinner
  uiLoading(true);

  // set params
  params = params || {};

  // get data from server
  $.ajax({
    url: listUrl, 
    type: "get",
    dataType: "json",
    data: params,
    contentType: "application/json",
    success: function(data, status, xhr) {
      dFlg = isDefined(data) ? true : false;  // set status flag

      // load data based on display type
      switch (dType) {
      case 'home':
        set_home_data(data, dFlg);
	break;
      case 'board':
        loadBoard(data, dFlg); 
	break;
      case 'reload':
        result = processReload(data, dFlg);
	break;
      case 'list':
	result = data;
	break;
      case 'autocomplete':
        loadResults(data, dFlg);
	break;
      case 'state':
        result = loadStates(data, dFlg, params.fld);
        setSelectMenu(params.fld, result, params.val);  // set option menu
	break;
      case 'pixi':
        loadPixiPage(data, dFlg);
	break;
      case 'edit':
        editPixiPage(data, dFlg);
	break;
      case 'post':
        loadPosts(data, dFlg);
	break;
      case 'view':
        loadListView(data, dFlg); 
	break;
      case 'inv':
        loadInvList(data, dFlg); 
	break;
      case 'invedit':
        loadInvForm(data, dFlg); 
	break;
      case 'invpg':
        loadInvPage(data, dFlg); 
	break;
      case 'bank':
        loadBankPage(data, dFlg); 
	break;
      case 'user':
        loadUserPage(data, dFlg); 
	break;
      case 'contact':
        loadContactPage(data, dFlg); 
	break;
      case 'price':
        setPrice(data, dFlg);
	break;
      case 'txn':
        loadTxnForm(data, dFlg, params); 
	break;
      case 'conv':
        loadConvPage(data, dFlg); 
        break;
      case 'stores':
        loadStoreList(data, dFlg); 
        break;
      default:
	break;
      }
    },
    fail: function (a, b, c) {
        PGproxy.navigator.notification.alert(a.responseText, function() {}, 'Load Data', 'Done');
        console.log(a.responseText + ' | ' + b + ' | ' + c);
  	uiLoading(false);
    }
  });
  return result;
}

function set_home_data(data, dFlg) {
  if (data !== undefined) {
    console.log('home region = ' + data.id);
    window.localStorage['home_site_id'] = data.id;
    window.localStorage['home_site_name'] = data.name;
    window.localStorage['home_image'] = data.photo_url;
  }
}

// process results
function loadResults(res, dFlg) {
  var $sugList = $(".suggestions");
  if (res !== undefined) {
    var str = "";
    for(var i=0, len=res.length; i<len; i++) {
	str += "<li><a href='#' class='ac-item' data-res-id='" + res[i].id + "'>" + res[i].name + "</a></li>";
    }
    $sugList.html(str);
  } 
  uiLoading(false);
}

// set url for pixi list pages based on switch
function loadListPage(pgType, viewType) {
  switch(pgType){
  case 'draft':
    var pixiUrl = tmpPath + '/unposted.json' + token;
    break;
  case 'purchase':
    var pixiUrl = pxPath + 'purchased.json' + token + "&status=purchased";
    break;
  case 'sold':
    var pixiUrl = pxPath + 'seller.json' + token + "&status=sold";
    break;
  case 'active':
    var pixiUrl = pxPath + 'seller.json' + token + "&status=active";
    break;
  case 'saved':
    var pixiUrl = url + '/saved_listings.json' + token + "&status=saved";
    break;
  case 'want':
    var pixiUrl = pxPath + 'seller_wanted.json' + token + "&status=wanted";
    break;
  case 'sent':
    var pixiUrl = url + '/invoices/sent.json' + token;
    break;
  case 'received':
    var pixiUrl = url + '/invoices/received.json' + token;
    break;
  case 'recv':
    var pixiUrl = url + '/conversations.json' + token + "&status=received";
    break;
  case 'post':
    var pixiUrl = url + '/conversations.json' + token + "&status=sent";
    break;
  case 'user':
    var pixiUrl = url + '/settings.json' + token;
    break;
  case 'contact':
    var pixiUrl = url + '/settings/contact.json' + token;
    break;
  }
  
  // load pixi data
  console.log('loadListPage pixiUrl => ' + pixiUrl);
  loadData(pixiUrl, viewType); 
}

// load user name & email if needed
function showNameEmail(data, showFlg) {
  var fname = '', lname = '', email = '';

  if (data !== undefined) {
    fname = data.first_name || '';
    lname = data.last_name || '';
    email = data.email || '';
  }

  var name_str = "<tr><td><level>First Name* </level></td><td><input type='text' name='first_name' id='first_name' value='"
    + fname + "' placeholder='First Name' data-theme='a' class='profile-txt cal-size' /></td></tr>"
    + "<tr><td><level>Last Name* </level></td><td><input type='text' name='last_name' id='last_name' value='" + lname 
    + "' placeholder='Last Name' class='profile-txt cal-size' data-theme='a' /></td></tr>" ;
  
  if(showFlg) {
    name_str += "<tr><td><level>Email* </level></td><td><input type='text' name='email' id='email' class='profile-txt cal-size' value='" 
      + email + "' placeholder='Email' data-theme='a' /></td></tr>";
  }

  return name_str;
}

// load user profile if needed
function showProfile(data) {
  var prof_str = "<tr><td><level>Gender</level></td><td><select name='gender' id='gender' data-mini='true'></select></td></tr>"
    + "<tr><td><level>Birth Date</level></td><td><div data-role='fieldcontain'><fieldset data-role='controlgroup' data-type='horizontal'>"
    + '<table><tr><td><select name="birth_mo" id="birth_mo" data-mini="true"></select></td>'
    + '<td><select name="birth_dt" id="birth_dt" data-mini="true"></select></td>'
    + '<td><select name="birth_yr" id="birth_yr" data-mini="true"></select><td></tr></table>'
    + '</fieldset></div></td></tr>';

  return prof_str;
}

// process user page display
function loadUserPage(data, resFlg) {
  var name_str='', photo, gender='', month='', dt='', yr='', btn_name, pwd_str='', popName, id_btn; 
  if (resFlg) {

    // set pixi header details
    $('#show-list-hdr').html('');
    var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='profile-nav-btn' data-dtype='user' data-mini='true' class='ui-btn-active'>Profile</a></li>"
      + "<li><a href='#' id='contact-nav-btn' data-dtype='contact' data-mini='true'>Contact</a></li>";

    if (data !== undefined) {
      var dt_arr = data.birth_date.split('-');
      dt = dt_arr[2]; month = dt_arr[1]; yr = dt_arr[0];
      gender = data.gender;
      photo = getPixiPic(data.photo_url, 'height:60px; width:60px;', 'smallImage'); 
      name_str = "<span class='mleft10 pstr'>" + data.name + "</span><br />";
      popName = '#popupPix1';
      btn_name = 'Save';
      id_btn = 'edit-usr-btn';

      // update menu
      if (data.fb_user == undefined) {
        cstr += "<li><a href='#' id='prefs-nav-btn' data-dtype='prefs' data-mini='true'>Prefs</a></li></ul></div>";
      } else {
        cstr += "</ul></div>";
      }

      // build nav bar
      $('#show-list-hdr').append(cstr).trigger("create");
    } 
    else {
      cstr += "</ul></div>";
      photo = "<img src='../img/person_icon.jpg' style='height:60px; width:60px;' id='smallImage' />";
      btn_name = 'Register';
      id_btn = 'signup-btn';
      popName = '#popupPix2';
      pwd_str = "<tr><td><label>Password</label></td><td class='cal-size'><input type='password' name='password' id='password' placeholder='Password'" 
        + " class='profile-txt' data-theme='a' /></td></tr>"
        + "<tr><td><label>Confirm Password</label></td><td class='cal-size'><input type='password' name='password_confirmation'"
	+ " id='password_confirmation' class='profile-txt' placeholder='Re-enter Password' data-theme='a' /></td></tr>";
    }

    var user_str = "<table><tr><td>" + photo + "</td><td>" + name_str
      + "<a href='" + popName + "' class='mleft10 upload-btn' data-mini='true' data-role='button' data-inline='true' data-theme='b'"
      + "data-rel='popup' data-position-to='window' data-transition='pop'>Upload</a>"
      + "</td></tr></table><div id='edit-profile' class='sm-top'><table class='rpad10 inv-descr'>"
      + showNameEmail(data, true) + showProfile(data) + pwd_str + "</table><div class='sm-top center-wrapper'>"  
      + "<input type='submit' value='" + btn_name + "' data-theme='d' data-inline='true' id='" + id_btn + "'></div></div>";

    // build page
    $('#usr-prof').append(user_str).trigger('create');

    loadGender("#gender", gender);  // load gender
    loadYear("#birth_yr", 13, 90, yr); // load year fld
    loadMonth("#birth_mo", month); // load month fld
    loadDays("#birth_dt", month, dt); // load month fld
  }
  else {
    console.log('User page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View User', 'Done');
  }
}

// set address
function showAddress(data, resFlg, eFlg, email, ahash) {
  var addr='', city='', state, zip='', hphone='', mphone;
  email = email || usr.email;
  ahash = ahash || {};
  console.log('in show address');

  if (data.contacts.length > 0) {
    var item = data.contacts[0];
    addr = item.address || '';
    city = item.city || '';
    state = item.state || '';
    zip = item.zip || '';
    hphone = item.home_phone || '';
    mphone = item.mobile_phone || '';
  }

  var addr_str = "<tr><td>" + textFld('Street*', ahash.addr, addr, 'profile-txt') + "</td>"
    + "<td></td><td>" + textFld('City*', ahash.city, city, 'profile-txt') + "</td></tr>"
    + "<tr><td><label>State/Province*</label><select name='" + ahash.state + "' id='" + ahash.state + "' data-mini='true'></select>"
    + "</td><td></td><td>" + numberFld('Zip*', ahash.zip, zip, 'profile-txt', 5) + "</td></tr>"
    + "<tr><td>" + numberFld('Home Phone*', ahash.hphone, hphone, 'profile-txt', 10) + "</td>";

  if(eFlg) 
    addr_str += "<td></td><td>" + textFld('Email*', ahash.email, email, 'profile-txt') + "</td></tr>";
  else 
    addr_str += "<td></td><td>" + numberFld('Mobile Phone*', 'mobile_phone', mphone, 'profile-txt', 10) + "</td></tr>";
  return addr_str;
}

// process user contact page display
function loadContactPage(data, resFlg) {
  var state='', email='';

  if (resFlg) {
    if (data !== undefined && data.contacts.length > 0) {
      state = data.contacts[0].state || '';
      email = data.contacts[0].email || '';
    }

    var fldHash = {addr: 'address', city: 'city', state: 'state', zip: 'zip', hphone: 'home_phone', email: 'email'};
    var user_str = "<table class='inv-descr'>" + showAddress(data, resFlg, false, email, fldHash) + "</table><div class='sm-top center-wrapper'>" 
      + '<input type="submit" value="Save" data-theme="d" data-inline="true" id="edit-usr-btn"></div>';

    $('#usr-prof').append(user_str).trigger('create');
    setState("#state", state);  // load state dropdown
  }
  else {
    $('#usr-prof').append('No contact info found').trigger('create');
    console.log('Contact page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Contact', 'Done');
  }
}

function load_rating(cls, amt, hgt, wd) {
  var item = '<br /><div class="sm-top rateit ' + cls + '" data-rateit-value=' + amt + ' data-rateit-ispreset="true" data-rateit-readonly="true"' +
    ' data-rateit-starwidth=' + wd + ' data-rateit-starheight=' + hgt + '></div><div class="clear-all"></div>'
  return item;
}

// load cover image
function load_cover(flg, pic, sid, rating, descr, flwFlg) {
  pgTitle = pgTitle || window.localStorage['home_site_name'];
  flwFlg = flwFlg || false;
  var img = (!localPixFlg) ? cover : (cover === null) ? '../img/gm_grey.jpg' : url + '/' + cover;
  var px_str = '<div class="item-container" style="background: url(' + img + ') no-repeat;">'; 

  if (!flg && pic.length > 0) {
    loadSearch('Search item or brand...');
    rating = rating || 0;
    descr = descr || '';
    var item = load_rating('med-pixis', rating, 21, 24) + '<div class="white-text">' + descr + '</div>'
      + '<div id="store-btn">' + toggle_follow_btn(sid, flwFlg) + '</div>';
    px_str += '<br /><div class="usr-profile-photo">' + showUserPhoto(pic, pgTitle, 'small-title-white', item) + '</div>'; 
  }
  else {
    px_str += '<div class="home-title-grp"><span class="mleft20 mtop small-title-white">' + pgTitle + '</span></div></div>'; }

  $('#board-top').append(px_str).trigger("create");
  reload_ratings();
}

// add search form
function loadSearch(txt) {
  var str = fld_form('search-doc', 'seller-search', 'search_txt', txt, 'Search', 'search-btn');
  $("#search_txt").addClear();
  $('#search_form').append(str).trigger("create");
}

// toggle button based on flg
function toggle_follow_btn(sid, flg) {
  var skey = 'data-seller_id';
  var btn = showButton(skey, sid, 'Unfollow', 'b', 'unfollow-btn','width120','true'); 
  var fbtn =  showButton(skey, sid, 'Follow', 'd', 'follow-btn', 'width120', 'true');
  return (flg) ? btn : fbtn;
}

// loop to check if seller exists in followed list
function isFollowed(data, sid) {
  if(data == '') return false;
  var flg = false;
  if(data !== '' && isDefined(data.sellers) && data.sellers.length > 0) {
    $.each(data.sellers, function(index, item) {
      if(item.id == sid) {
        flg = true;
	return false;
      }
    });
  }
  return flg;
}

// load feature items
function load_featured_items(data, slrFlg, user, pic, sid, rating, descr) {
  var flwFlg = (!slrFlg) ? isFollowed(user, sid) : false;
  load_cover(slrFlg, pic, sid, rating, descr, flwFlg);
  if(data.length > 3) {
    var title = (slrFlg) ? 'Featured Sellers' : 'Featured Pixis';
    var px_str = '<div class="featured-container"><div class="center-wrapper"><div class="sm-top bold-tag-line sm-bot">' + title 
      + '</div></div><div class="featured mleft20">' + '</div></div>';
    $('#board-top').append(px_str).trigger("create");
    $("#pxboard").addClass('splash-top').removeClass('sm-splash-top');
    load_featured_slider(build_str(data, slrFlg));
  }
  else
    $("#pxboard").removeClass('splash-top').addClass('sm-splash-top');
}

function build_str(data, sFlg) {
  var localUrl, cls, str='', title, pic;
  $.each(data, function(index, item) {
    title = (sFlg) ? item.name : item.title;
    localUrl = (sFlg) ? 'data-url="' + item.url + '"' : 'data-pixi-id="' + item.pixi_id + '"';
    cls = (sFlg) ? 'slrUrl' : 'bd-item';
    pic = (sFlg) ? item.photo_url : item.pictures[0].photo_url;
    str += '<div class="featured-item"><div class="center-wrapper">'
      + '<a href="#" ' + localUrl + ' class="' + cls + '" data-ajax="false">'  
      + getPixiPic(pic, 'height:100px; width:100px;', '', 'lazy') + '</a>'
      + '<div class="sm-top profile-txt mbdescr truncate">' + title + '<br /><span class="mgdescr truncate">' + item.site_name + '</span></div>'
      + '</div></div>';
  });
  return str;
}

// load board if resFlg else return not found
function loadBoard(data, resFlg) {
  var $container = $('#px-container'); 
  var result = '', item_str = '';
  console.log('in load board');
  uiLoading(true);

  // load featured items
  if($.mobile.activePage.attr("id") == 'store') {
    cover = data.sellers[0].cover_photo || '../img/gm_grey.jpg';
    pgTitle = data.sellers[0].business_name;
    load_seller_header(data);
  }
  else { 
    loadSearch('Search item, store or brand...');
    cover = window.localStorage['home_image'];
    pgTitle = window.localStorage['home_site_name'];
    load_featured_items(data.sellers, true, '');
  }

  if(resFlg) {
    result = load_board_items(data, item_str, resFlg);

    // load categories
    if (data.categories !== undefined) {
      categories = data.categories;
      loadList(data.categories, '#category_id', 'Category');
    }
  } 
  else {
    // not found
    item_str = '<div class="center-wrapper">No pixis found for this location and/or category.</div>'

    // load msg
    $container.append(item_str);
  }

  // turn off spinner
  uiLoading(false);
  return result;
}

function load_seller_header(data) {
  var sid = data.sellers[0].id;
  var rating = data.sellers[0].rating; 
  var descr = data.sellers[0].description;
  var pic = data.sellers[0].photo_url;

  // set seller url 
  $('#site_url').val(data.sellers[0].url);

  if(data.listings.length > 10) {
    load_featured_items(data.listings, false, data.user, pic, sid, rating, descr);
  }
  else {
    $("#pxboard").removeClass('splash-top').addClass('sm-splash-top');
    load_cover(false, pic, sid, rating, descr, isFollowed(data.user, sid));
  }
}

// build board
function load_board_items(data, str, resFlg) {
  if (!resFlg) {
     console.log('Error load_board_items: No data found.');
     return '';
  }

  var post_dt, localUrl;
  myPixiPage = 'active';

  // load pixis
  $.each(data.listings, function(index, item) {
    var prc = (typeof item.price == "number" && item.price >= 0) ? '$' + item.price : '$0';
    localUrl = 'data-pixi-id="' + item.pixi_id + '"';

    str += '<div class="item"><div class="center-wrapper">'
      + '<a href="#" ' + localUrl + ' class="bd-item" data-ajax="false">'  
      + getPixiPic(item.pictures[0].photo_url, 'height:135px; width:135px;') + '</a>'
      + '<div class="sm-top profile-txt mbdescr">' + item.title + '<br /><span class="mgdescr">' + item.site_name + '</span></div>'
      + '<div class="sm-top mgdescr">' + '<div class="item-cat pixi-grey-bkgnd">' 
      + '<a href="#" class="pixi-cat"' + ' data-cat-id=' + item.category_id + '>'
      + item.category_name + '</a></div><div class="item-dt pixi-grey-bkgnd">' + prc + '</div></div></div></div>';
  });

  // attach to div
  $('#pxboard').append(str);

  // initialize infinite scroll
  load_masonry('#px-nav', '#px-nav a', '#pxboard .item', 1);
  return str;
}

// build masonry blocks for board
function reload_items(str) {
  var $container = $('#px-container');
  if(isDefined($('#site_url').val())) 
    $container.masonry('reloadItems');
  else {
    var $elem = $(str).css({ opacity: 0 });
    $container.imagesLoaded(function(){
      $elem.animate({ opacity: 1 });
      $container.masonry('reloadItems');
    });
  }
}

// load year dropdown
function loadYear(fld, minVal, maxVal, yr) {
  var curYr = new Date().getFullYear(); 
  var minYr = curYr - minVal;
  var maxYr = curYr - maxVal;
  var item_str = '<option default value="">' + 'Year' + '</option>';

  // build option list
  for (i = minYr; i > maxYr; i--) {
    item_str += '<option value="'+ i + '">' + i + '</option>';
   // $(fld).append($('<option />').val(i).html(i));
  }
  setSelectMenu(fld, item_str, yr);  // set option menu
}

// load month selectmenu
function loadMonth(fld, curMonth) {
  var arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var item_str = '<option default value="">' + 'Mon' + '</option>';

  // build option list
  for (var i = 1; i <= arr.length; i++) {
    item_str += '<option value="'+ i + '">' + arr[i-1] + '</option>';
  }
  setSelectMenu(fld, item_str, parseInt(curMonth));  // set option menu
}

// load day selectmenu based on current month
function loadDays(fld, curMonth, curDt) {
  var dt_arr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var dt_str = '<option default value="">' + 'Day' + '</option>';

  curMonth = curMonth || 1;

  for (var j = 1; j <= dt_arr[curMonth-1]; j++) {
    dt_str += '<option value="'+ j + '">' + j + '</option>';
  }
  setSelectMenu(fld, dt_str, parseInt(curDt));  // set option menu
}

// set dropdown selection and refresh menu
function setSelectMenu(fld, str, val) {
  var dt_str = fld + " option[value='" + val + "']";

  if(str.length > 0) {
    $(fld).append(str);
  }
  $(dt_str).prop("selected", true);
  $(fld).selectmenu().selectmenu('refresh', true);
}

// load gender dropdown
function loadGender(fld, val) {
  var gen_str = '<option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option>';
  setSelectMenu(fld, gen_str, val);  // set option menu
}

// load acct type dropdown
function loadAcctType(fld, val) {
  var gen_str = '<option value="">Acct Type</option><option value="checking">Checking</option><option value="savings">Savings</option>';
  setSelectMenu(fld, gen_str, val);  // set option menu
}

// set state
function setState(fld, val) {
  var pixiUrl = url + '/states.json' + token;
  var sHash = {fld: fld, val: val};
  loadData(pixiUrl, 'state', sHash);
}

// load active pixi dropdown menu for invoices
function setPixiList(res, fld, val) {
  if (res !== undefined) {
    var px_str = '<option value="">Select Pixi</option>';
    for(var i=0, len=res.length; i<len; i++) {
	px_str += "<option value='" + res[i].pixi_id + "'><span>" + res[i].title + "</span></option>";
    }
    setSelectMenu(fld, px_str, val);  // set option menu
  } 
  // set long names to wrap when displayed
  $('.dd-list').find('span').each(function () { $(this).css("white-space", "normal"); });
}

// load states dropdown menu
function loadStates(res, dFlg, fld) {
  var val = $(fld).val();

  if (res !== undefined) {
    states_str = '<option value="">State</option>';
    for(var i=0, len=res.length-1; i<len; i++) {
	states_str += "<option value='" + res[i].code + "'>" + res[i].state_name + "</option>";
    }
    setSelectMenu(fld, states_str, val);  // set option menu
  } 
  return states_str;
}

// load quantity selectmenu 
function loadQty(fld, val, amt) {
  var qty_str = '<option default value="">' + 'Qty' + '</option>';
  amt = amt || 99;

  for (var j = 1; j <= amt; j++) {
    qty_str += '<option value="'+ j + '">' + j + '</option>';
  }
  setSelectMenu(fld, qty_str, val);  // set option menu
}

// set item price
function setPrice(data, resFlg) {
  if (resFlg) {
    if (data !== undefined) {
      $('#inv_price').val(parseFloat(data).toFixed(2)); 
      //console.log('price = ' + data);
    }
    else {
      $('#inv_price').val(0);
    }
  }
  else {
    console.log('Item price load failed');
    PGproxy.navigator.notification.alert("Item price load failed", function() {}, 'Invoice', 'Done');
  }
}

// process bank account page
function loadBankPage(data, resFlg) {
  var title_str='';

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      title_str = "<span>View Bank Account</span>"; 

      // load title
      $('#inv-pg-title').html(title_str);
      $('#acct-frm').html('');

      var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
        + "<div class='mleft10'><div class='sm-top'><table class='inv-descr'>"
	+ "<tr><td>Bank Name: </td><td class='width30'></td><td>" + data.account.bank_name + "</td></tr>"
	+ "<tr><td>Account #: </td><td class='width30'></td><td>" + data.account.acct_no + "</td></tr>"
	+ "<tr><td>Account Name: </td><td class='width30'></td><td>" + data.account.acct_name + "</td></tr>"
	+ "<tr><td>Description: </td><td class='width30'></td><td>" + data.account.description + "</td></tr>"
	+ "<tr><td>Account Type: </td><td class='width30'></td><td>" + data.account.acct_type + "</td></tr></table></div>"
	+ "<div class='mtop center-wrapper'><a href='#' id='rm-acct-btn' data-role='button' data-inline='true' data-acct-id='" 
	+ data.account.id + "'>Remove</a></div></div>";

      // build page
      $('#acct-frm').append(inv_str).trigger('create');
    }
    else {
      PGproxy.navigator.notification.alert("Bank account data not found.", function() {}, 'Bank Account', 'Done');
    }
  }
  else {
    console.log('Bank account page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Bank Account', 'Done');
  }

  // turn off spinner
  uiLoading(false);
}

// process bank account form
function loadBankAcct(data, resFlg) {
  var title_str='', routing_no='', acct_no='', acct_name='', descr='', atype = '';

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      title_str = "<span>Edit Bank Account</span>"; 
    }
    else {
      title_str = "<span>Create Bank Account</span>"; 
    }

    // load title
    $('#inv-pg-title').html(title_str);
    $('#acct-frm').html('');

    var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
      + "<div class='mleft10'><form id='bank-acct-form' data-ajax='false'><div class='sm-top'><table class='inv-descr'>"
      + "<tr><td>Routing #</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='number' name='routing_number' id='routing_number' placeholder='Routing Number' data-theme='a' value='" 
      + routing_no + "' /></div></td></tr>"
      + "<tr><td>Account #</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='number' name='acct_number' id='acct_number' placeholder='Account Number' data-theme='a' value='" + acct_no + "' /></div></td></tr>"
      + "<tr><td>Account Name</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='acct_name' id='acct_name' placeholder='Account Name' data-theme='a' value='" + acct_name + "' /></div></td></tr>"
      + "<tr><td>Description</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='description' id='bank_acct_descr' placeholder='Description' data-theme='a' value='" + descr + "' /></div></td></tr>"
      + "<tr><td class='img-valign'>Account Type</td><td><select name='acct_type' id='acct_type' data-mini='true' class='mtop'></select></td></tr>"
      + "</table><input type='hidden' name='user_id' id='user_id' value='" + usr.id + "' /><input type='hidden' name='token' id='pay_token' />" 
      + "<input type='hidden' name='acct_no' id='acct_no' /></div></form>"
      + "<div class='center-wrapper'><img src='../img/rsz_check_sample.gif'></div>"
      + "<table><tr><td class='cal-size'><a href='#' id='px-cancel' data-role='button' data-inline='true'>Cancel</a></td></div>"
      + "<td class='nav-right'><input type='submit' value='Save' data-theme='d' data-inline='true' id='add-acct-btn'></td></tr></table>";

    // build page
    $('#acct-frm').append(inv_str).trigger('create');

    // load drop down lists
    loadAcctType('#acct_type', atype);
  }
  else {
    console.log('Load bank account failed.');
    PGproxy.navigator.notification.alert("Bank account load failed", function() {}, 'Bank Account', 'Done');
  }

  // turn off spinner
  uiLoading(false);
}

// load dropdown list based on given url
function loadList(list, fld, descr, val) {
  var item_str = '<option default value="">' + 'Select ' + descr + '</option>';
  var len = list.length;
  val = val || '';
  console.log('loadList = ' + list[0].name_title);

  // load list as options for select
  for (var i = 0; i < len; i++){
    item_str += "<option value='" + list[i].id + "'>" + list[i].name_title + "</option>";
  }  

  // update field
  //$(fld).append(item_str).selectmenu().selectmenu('refresh', true);
  setSelectMenu(fld, item_str, val);  // set option menu
}

function processReload(res, dFlg) {
  var result = '';
  if (!$.isEmptyObject(res)) {
    console.log('in process reload');

    if(!isDefined($('#site_url').val())) {
      load_featured_items(res.sellers, true, '');
    }
    result = load_board_items(res, '', dFlg);
    reload_items(result);
  }
  return result;
}
