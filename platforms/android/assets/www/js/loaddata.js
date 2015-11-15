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
      // set status flag
      dFlg = (data == undefined) ? false : true;

      // load data based on display type
      switch (dType) {
      case 'board':
        loadBoard(data, dFlg); 
	break;
      case 'list':
	result = data;
	break;
      case 'autocomplete':
        loadResults(data, dFlg);
	break;
      case 'state':
        result = loadStates(data, dFlg);
        setSelectMenu('#state', result, params);  // set option menu
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
        loadTxnForm(data, dFlg, 'invoice'); 
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
    var pixiUrl = pxPath + '/purchased.json' + token + "&status=purchased";
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
      photo = getPixiPic(data.photo, 'height:60px; width:60px;', 'smallImage'); 
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
function showAddress(data, resFlg, eFlg) {
  var addr, city, state, zip, hphone, mphone;

  if (data !== undefined) {
    addr = data.contacts[0].address || '';
    city = data.contacts[0].city || '';
    state = data.contacts[0].state || '';
    zip = data.contacts[0].zip || '';
    hphone = data.contacts[0].home_phone || '';
    mphone = data.contacts[0].mobile_phone || '';
  }

  var addr_str = "<tr><td><label>Address*</label><input type='text' name='address' id='address' value='"
    + addr + "' placeholder='Street' data-theme='a' class='profile-txt' /></td>"
    + "<td></td><td><label>City*</label><input type='text' name='city' id='city' value='"
    + city + "' placeholder='City' data-theme='a' class='profile-txt' /></td></tr>"
    + "<tr><td><label>State/Province*</label><select name='state' id='state' data-mini='true'></select>"
    + "</td><td></td><td><label>Zip* </label><input type='text' name='zip' id='zip' value='"
    + zip + "' placeholder='Zip' data-theme='a' class='profile-txt' /></td></tr>"
    + "<tr><td><label>Home Phone </label><input type='text' name='home_phone' id='home_phone' value='"
    + hphone + "' placeholder='Home Phone' data-theme='a' class='profile-txt' /></td>";

    if(eFlg) {
      addr_str += "<td></td><td><label>Email* </label><input type='text' name='email' id='email' value='"
        + usr.email + "' placeholder='Email' data-theme='a' class='profile-txt' /></td></tr>";
    }
    else {
      addr_str += "<td></td><td><label>Mobile Phone </label><input type='text' name='mobile_phone' id='mobile_phone' value='"
        + mphone + "' placeholder='Mobile Phone' data-theme='a' class='profile-txt' /></td></tr>";
    }

  return addr_str;
}

// process user contact page display
function loadContactPage(data, resFlg) {
  var state='';

  if (resFlg) {
    if (data !== undefined) {
      state = data.contacts[0].state || '';
    }

    var user_str = "<table class='inv-descr'>" + showAddress(data, resFlg, false) + "</table><div class='sm-top center-wrapper'>" 
      + '<input type="submit" value="Save" data-theme="d" data-inline="true" id="edit-usr-btn"></div>';

    $('#usr-prof').append(user_str).trigger('create');
    setState("#state", state);  // load state dropdown
    $('#state').val(state);
  }
  else {
    console.log('Contact page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Contact', 'Done');
  }
}

// load board if resFlg else return not found
function loadBoard(data, resFlg) {
  var $container = $('#px-container').masonry({ itemSelector : '.item', gutter : 1, isFitWidth: true, columnWidth : 1 });
  var item_str = '';
  var post_dt, localUrl;

  if(resFlg) {
    usr = data.user;  // store user
    myPixiPage = 'active';

    // load pixis
    $.each(data, function(index, item) {

        // build pixi item string
	post_dt = $.timeago(item.updated_at);
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';

        item_str += '<div class="item"><div class="center-wrapper">'
	  + '<a href="#" ' + localUrl + ' class="bd-item" data-ajax="false">'  
	  + getPixiPic(item.pictures[0].photo_url, 'height:115px; width:115px;') + '</a>'
	  + '<div class="sm-top profile-txt mbdescr">' + item.nice_title + '</div>'
	  + '<div class="sm-top mgdescr">' + '<div class="item-cat pixi-grey-bkgnd">' 
	  + '<a href="' + catPath + token + '&cid=' + item.category_id + '"' + ' class="pixi-cat"' + ' data-cat-id=' + item.category_id + '>'
	  + item.category_name + '</a></div><div class="item-dt pixi-grey-bkgnd">' + post_dt + '</div></div></div></div>';
    });

    // build masonry blocks for board
    var $elem = $(item_str).css({ opacity: 0 });
    $container.imagesLoaded(function(){
      $elem.animate({ opacity: 1 });
      $container.append($elem).masonry('appended', $elem, true).masonry('reloadItems');
    });

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
  loadData(pixiUrl, 'state', val);
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
function loadStates(res, dFlg) {
  var val = $('#state').val();

  if (res !== undefined) {
    states_str = '<option value="">State</option>';
    for(var i=0, len=res.length; i<len; i++) {
	states_str += "<option value='" + res[i].code + "'>" + res[i].state_name + "</option>";
    }
    setSelectMenu('#state', states_str, val);  // set option menu
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
function loadList(list, fld, descr) {
  var item_str = '<option value="">' + 'Select ' + descr + '</option>';
  var len = list.length;
  console.log('loadList = ' + list[0].name_title);

  // load list as options for select
  for (var i = 0; i < len; i++){
    item_str += "<option value='" + list[i].id + "'>" + list[i].name_title + "</option>";
  }  

  // update field
  $(fld).append(item_str).selectmenu().selectmenu('refresh', true);
}
