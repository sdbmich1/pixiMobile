
// load list view if resFlg else return not found
function loadListView(data, resFlg) {
  var res, localUrl, post_dt, item_str = '', px_str = '';
  var $container = $('#pixi-list');

  // load listview
  if(resFlg) {
    res = (data.length > 0) ? data : isDefined(data.listings) ? data.listings : data;
    if (res.length > 0) {
      $.each(res, function(index, item) {
	post_dt = $.timeago(item.updated_at); // set post dt

        // build pixi item string
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';
        var pic = getPixiPic(item.pictures[0].photo_url, 'height:60px; width:60px;');
        var hdr = item.med_title;
	var ftr = item.site_name + '<br />' + item.category_name + ' | ' + post_dt;
	item_str += build_list('bd-item', localUrl, pic, hdr, ftr); 
      });
    }
    else {
      item_str = '<li class="center-wrapper">No pixis found.</li>'
    }
  }
  else {
    item_str = '<li class="center-wrapper">No pixis found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}

// edit pixi page 
function editPixiPage(data, resFlg) {
  if (resFlg) {
    if (data !== undefined) {
      var item = (isDefined(data.listing)) ? data.listing : data;
      var pic = getPixiPic(item.pictures[0].photo_url, 'height:80px; width:80px;', 'smallImage'); 
      $('#picture').html(pic);
      $('#title').val(item.title);
      $('#site_id').val(item.site_id);
      $('#site_name').val(item.site_name);
      $('#price').val(item.price);
      $('#description').val(item.description);
      getCatData(item.category_id); 
      loadYear("#yr_built", 0, 90, item.year_built); // load year fld
      loadCondType('#condType', item.condition_type_code);
      loadQty('#px-qty', item.quantity, 99);
      load_delivery_type(item);
    }
  }
  else {
    console.log('Edit pixi page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Edit Pixi', 'Done');
  }
}

// process pixi page display
function loadPixiPage(data, resFlg, ptype) {
  if (resFlg) {

    // show pixi details
    var title_regex = "pixi|listing|Details";
    var re = new RegExp(title_regex, 'ig');
    if(ptype.match(re)) 
      showPixiPage(data);   // load page data
    else
      showCommentPage(data);  // load comment data
  }
  else {
    console.log('pixi page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Pixi', 'Done');
  }
}

// open pixi success page
function showPixiSuccess(data) {
  if (data !== undefined) {
    var txt = "Your pixi <span class='pstr'>" + data.title + "</span> has been submitted.</div>"
    var detail_str = "<div class='mtop inv-descr'>Subject to approval, your pixi will be posted shortly. Thank you for your business.</div>"
      + "<div class='mtop center-wrapper'><a href='#' id='px-done-btn' data-role='button' data-inline='true'"
      + " data-theme='d'>Done</a></div>";
        
    var pg_title = 'Pixi Submitted!';
    $('#px-page-title').html(pg_title);
    $('#pixi-form').hide('fast');  // hide post form

    // load title
    var tstr = "<h4 class='mbot'>" + txt + "</h4>";
    $('#list_title').html(tstr);
    $('#seller-name').html('');

    $('#pixi-details').html(detail_str).trigger('create');
    $('.bx-slider').toggle();
    $('#edit-pixi-details').toggle();
    $('#pixi-footer-details').toggle();
  }
  else {
    console.log('pixi success page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Pixi Submitted', 'Done');
  }
}

function showUserPhoto(pic, name, cls, item) {
  item = item || '';
  var str = "<table><tr><td>" + getPixiPic(pic, 'height:45px; width:45px; border: 1px solid #ccc;') 
    + '</td><td class="' + cls + '">' + name + item + '</td></tr></table>';
  return str;
}

// load seller header
function loadSellerTop(sname, locUrl, pic, rating, cnt) {
  var localUrl = 'data-url="' + locUrl + '"';
  var str = '<a href="#" ' + localUrl + ' class="slrUrl" data-ajax="false">' + sname + '</a>';
  var item = load_rating('bmed-pixis', rating, 21, 24) + '<div class="inv-descr">Items: ' + cnt + '</div>';
  var seller_str = '<div class="blk-profile-photo">' + showUserPhoto(pic, str, 'small-title', item) + '</div>';
  $("#seller-name").append(seller_str).trigger("create");
  reload_ratings();
}

// open pixi page
function showPixiPage(data) {
  var px_str = '', cstr='', detail_str = '';
  uiLoading(true);  // toggle spinner

  // check if pixi is in temp status - if not show navbar else hide post form 
  if(pxPath.indexOf("temp_listing") < 0) {
    $('#pixi-details, #show-list-hdr, #seller-name, #pixi-footer-details, #comment_form, #pixi-list').html('');

    // set pixi header details
    cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='show-pixi' data-role='none' data-theme='b' class='ui-btn-active' data-pixi-id='" + pid 
      + "' data-mini='true'>Details</a></li>"
      + "<li><a href='#' id='show-cmt' data-role='none' data-theme='b' data-mini='true' data-pixi-id='" + pid 
      + "'>Reviews (" + data.comments.length + ")</a></li></ul></div>";
      
  } 
  else {
    var pg_title = 'Review Your Pixi';
    myPixiPage = 'draft';
    $('#px-page-title').html(pg_title);
    $('#pixi-form').hide();  // hide post form
  }

  // load title
  showPixiTitle(data.listing.title);

  // load seller top
  //console.log('data.listing[61] = ' + data.listing[Object.keys(data.listing)[61]]);
  //var bizFlg = data.listing[Object.keys(data.listing)[61]];
  var bizFlg = data.listing['sold_by_business?'];
  var upath = (parseBoolean(bizFlg)) ? '/biz/' : '/mbr/';
  upath += data.listing.user.url;
  loadSellerTop(data.listing.seller_name, upath, data.listing.seller_photo, data.listing.user.rating, 
    data.listing.seller_pixi_count);

  // load post values
  $('#user_id').val(getUserID()); 
  $('#recipient_id').val(data.listing.seller_id);
  $('#pixi_id').val(data.listing.pixi_id);

  // load pix
  $.each(data.listing.pictures, function(index, item) {
    px_str += getPixiPic(item.photo_url, 'height:auto; width:300px!important;');
  });

  // check slider length to toggle slideshow
  var cntl = (data.listing.pictures.length > 1) ? true : false;

  // load slider
  $('#px-pix').show();
  $('.bxslider').append(px_str).bxSlider({ controls: false, pager: cntl, mode: 'fade' });

  // add details
  pixi_details(data.listing, bizFlg); 

  // add pixi footer
  var post_dt = $.timeago(data.listing.updated_at); // set post dt
  var footer_str = '<div class="grey-text dt-descr mtop row">ID: ' + data.listing.pixi_id + '<br />Posted: ' + data.listing.start_dt 
    + ' | Updated: ' + post_dt + '</div>';
  $('#pixi-footer-details').append(footer_str);

  // show edit buttons
  edit_pixi_buttons(data, cstr);
  uiLoading(false);  // toggle spinner
}

// load title
function showPixiTitle(title) {
  var tstr = "<h4 class='mbot major_evnt'>" + title + "</h4><hr class='neg-top'>";
  $('#list_title').html('').append(tstr);
}

// check if listing owner to display edit buttons
function edit_pixi_buttons(data, cstr) {
  if(data.listing.seller_id == getUserID()) {
    var stat_str = "<div class='px-status' data-status-type='" + data.listing.status + "'></div>";
    $('#edit-pixi-details').append(stat_str);

    $('#pixi-form').hide();  // hide post form
    $('#edit-pixi-btn').toggle();
    console.log('pxPath = ' + pxPath);
      
    if(pxPath.indexOf("temp_listing") > 0) {
      $('#submit-pixi-btn').toggle();
    }

    // render buttons
    (data.listing.status == 'edit') ? $('#cancel-pixi-btn').toggle() : $('#remove-pixi-btn').toggle();
  }
  else {
    $('#show-list-hdr').append(cstr).trigger("create");
  }
}

function show_arrow(style) {
  var img_str = "<img src='../img/arrow.png'>";
  return img_str;
}

function pixi_details(item, bFlg) {
  var btn_str, str = '';

  if(item.price !== undefined) {
    if (myPixiPage == 'active' && item.seller_id != getUserID())
      // toggle between want(non-biz) and buy now(biz)
      if (bFlg)
        btn_str = showButton('data-pixi-id', item.pixi_id, 'Buy Now', 'd', 'buy-btn');
      else
        btn_str = showButton('data-pixi-id', item.pixi_id, 'Want', 'd', 'want-btn');
    else
      btn_str = '';

    var prc = parseFloat(item.price).toFixed(2);
    str += "<br /><div class='sm-top'><table><tr><td><span class='pixi-str'>$" + humanizeNumber(prc) + "</span></td><td class='width60'></td><td>"  
      + btn_str + "</td></tr></table></div></div>";
  } 
  else {
    if(item.compensation !== undefined) {
      str += "<div class='mtop'>Salary: <span class='pixi-str'>" + item.compensation + "</span></div></div>";
    } 
  }

  if(item.status == 'active') {
    str += "<table><tr><td>Qty:</td><td><select name='quantity' id='px_qty' class='width60' data-mini='true'></select></td>";
    str += "<td>Delivery:</td><td><select name='delivery_type' id='ftype' data-mini='true'></select></td></tr></table>";
  }

  // load features
  var code_str = (item.category_name == 'Automotive') ? 'VIN #' : 'Product Code';
  str += sectionHeader('Features');
  str += "<div class='inv-descr'>";
  str += show_features('Condition', item.condition);
  str += show_features('Color', item.color);
  str += show_features(code_str, item.other_id);
  str += add_vehicle_features(item);
  str += add_housing_features(item);
  str += add_event_features(item);
  str += show_features('Size', item.item_size);
  str += show_features('Amount Left', item.amt_left);
  str += "</div>";  
  str += sectionHeader('Description') + "<div class='inv-descr'>" + item.description + "</div><br />";

  // load details
  $('#pixi-details').append(str).trigger("create");

  if(item.status == 'active') {
    loadQty('#px_qty', 1, parseInt(item.amt_left));
    load_delivery_type(item);
  }
}

function sectionHeader(title) {
  return "<div class='mtop'>" + title + "</div><hr class='sm-top'>";
}

// build array
function load_delivery_type(item) {
  var dval;
  var arr = [{ id: 'P', name_title: 'Pickup'}, {id: 'SHP', name_title: 'Ship'}];
  if (isDefined(item) && item.delivery_type == 'All') {
    dval = 'SHP';
  }
  else {
    if(isDefined(item)) {
      dval = item.fulfillment_type_code;
    }
    else {
      dval = 'P';
    }
  }
  loadList(arr, '#ftype', '', dval);
}

function build_order_form(item) {
    var inv_str = "<form id='conv-form' data-ajax='false'><div class='mleft10'><table class='inv-descr'>"
      + "<tr><td class='img-valign'>Quantity:</td><td><select name='quantity' id='inv_qty' class='mtop' data-mini='true'></select></td></tr>" 
      + "<tr><td>Delivery:</td><td><div class='dd-list'><select name='pixi_id' id='pixi_id' data-mini='true'></div></select></td></tr>" 
      + '<input id="conversation_pixi_id" name="conversation[pixi_id]" type="hidden" value="' + item.pixi_id + '" />'
      + '<input id="conversation_recipient_id" name="conversation[recipient_id]" type="hidden" value="' + item.seller_id + '" />'
      + '<input id="conversation_user_id" name="conversation[user_id]" type="hidden" value="' + getUserID() + '" />'
      + "<input type='hidden' name='seller_id' id='seller_id' value='" + seller_id + "' />"
      + "<input type='hidden' name='id' id='inv_id' value='" + inv_id + "' />"
      + "<input type='hidden' name='buyer_id' id='buyer_id' value='" + buyer_id + "' /></div></table></form>";

    // build page
    $('#inv-frm').append(inv_str).trigger('create');
    $('#frm-submit').append(sub_str).trigger('create');

    // load drop down lists
    setPixiList(usr.active_listings, '#pixi_id', pixi_id);
    loadQty('#inv_qty', qty);
}

function add_vehicle_features(item) {
  var str = '';
  if(item.category_name == 'Automotive') {
    str += show_features('Year', item.year_built);
    str += show_features('Mileage', item.mileage);
  }
  return str;
}

function add_housing_features(item) {
  var str = '';
  if(item.category_name.match(/^Housing/)) {
    str += show_features('Beds', item.bed_no);
    str += show_features('Baths', item.bath_no);
    str += show_features('Available', item.avail_dt);
    str += show_features('Term', item.term);
  }
  return str;
}

// add event data
function add_event_features(item) {
  var str = '';
  if(item.category_name == 'Event') {
    str += show_features('Event Type', item.event_type_descr);
    str += show_features('Start Date', item.event_start_date);
    str += show_features('End Date', item.event_end_date);
    str += show_features('Start Time', item.event_start_time);
    str += show_features('End Time', item.event_end_time);
  }
  return str;
}

function check_null(item) {
  return ((typeof item == "number") || (typeof item == "string")) ? true : false;
}

// add pixi features 
function show_features(title, item) {
  var str = '';
  if(check_null(item) && item !== undefined && item != "") {
    str = show_arrow('') + "<span class='mleft10'>" + title + ': ' + item + "</span><br />";  
  }
  return str;
}

// open comment page
function showCommentPage(data) {
  console.log('in show comment page');
  var $container = $('#pixi-list');
  var item_str = '';
  var post_dt;

  uiLoading(true);  // toggle spinner

  // clear page
  $('#content').html('').val('');
  $('#pixi-details, #show-list-hdr, #seller-name, #pixi-footer-details').html('');
  $container.html('');
  $('#px-pix').toggle();
  $("#comment-btn").removeAttr("disabled");

  // set pixi header details
  var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
    + "<li><a href='#' id='show-pixi'data-role='none' data-theme='b' data-pixi-id='" + pid 
    + "' data-mini='true'>Details</a></li>"
    + "<li><a href='#' id='show-cmt' data-role='none' data-theme='b' class='ui-btn-active' data-mini='true' data-pixi-id='" + pid + "'>Reviews (" 
    + data.comments.length + ")</a></li></ul></div>";

  // load post values
  $('#user_id').val(getUserID());
  $('#pixi_id').val(pid);

  // load comments
  if (data.comments.length > 0) {
    $.each(data.comments, function(index, item) {
      var localUrl = 'data-pixi-id="' + pid + '"';
      post_dt = $.timeago(item.created_at); // set post dt
      var str = item.content + '<br />' + "Posted " + post_dt;
      var pic = getPixiPic(item.user.photo, 'height:60px; width:60px;');
      item_str += commentItem(item.id, pic, item.sender_name, str);
    });
  }
  else {
    item_str += "<li class='center-wrapper'>No reviews found.</li>";
  }

  // append content
  $('#show-list-hdr').append(cstr).trigger("create");

  var txt = 'Add review on item...';
  var str = fld_form('comment-doc', 'seller-comment', 'content', txt, 'Add', 'comment-btn');
  $('#comment_form').append(str).trigger("create");

  $container.html(item_str).listview().listview('refresh');
  uiLoading(false);  // toggle spinner
}

function commentItem(id, pic, hdr, txt) {
  var str = "<li id=" + id + " class='lv-str plist'>" + pic + '<div class="neg-mleft5 pstr pad-top5"><h6>' 
    + hdr + '</h6></div>' + '<div id="mlist"><p>' + txt + '</p></div>' + '</li>';
  return str;
}

function loadCondType (fld, val) {
  var cond_str = '<option default value="">' + 'Condition' + '</option>'
    + "<option value='N'>New</option>"
    + "<option value='UG'>Used</option>";
  setSelectMenu(fld, cond_str, val);  // set option menu
}
