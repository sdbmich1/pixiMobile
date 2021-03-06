// main.js file
//

$.ajaxSetup({  
  'beforeSend': function (xhr) {
  	var token = $("meta[name='csrf-token']").attr("content");
	xhr.setRequestHeader("X-CSRF-Token", token);
  	uiLoading(true);
    },
  'complete': function(){ uiLoading(false); },
  'success': function() { uiLoading(false); }
}); 

// hide & reset comp field
function hideComp(){
  $('#comp-fld').hide('fast');
  $('#price-fld').show('fast');

  if($('#input-form').length > 0) {
    $('#salary').val('');
  }  
}

// check form for blank fields
function allFilled(list) {
  var filled = true;
  var flds = list.split(', ');

  $.each(flds, function(index, item) {
    if($(item).val() == '') {
      filled = false; 
    }
  });
  return filled;
}

$(function (){
  // when the #category id field changes
  $(document).on("change", "select[id*=category_id]", function(evt){

    // grab the selected category
    var cat = $("select[id*=category_id] option:selected").text();

    // toggle field display based on category value
    if(cat == 'Event') {
      $('#event-fields').show('fast');

      // hide fields
      hideComp();
      $('#yr-fld').hide('fast');
    }
    else {
      $('#event-fields').hide('fast');

      // clear event flds
      $('#start-date, #end-date, #start-time, #end-time').val('');
      
      // check for jobs
      if(cat == 'Jobs' || cat == 'Gigs') {
        $('#price-fld, #yr-fld').hide('fast');
        $('#comp-fld').show('fast');

	// reset fields
	if($('#input-form').length > 0) {
	  $('#temp_listing_price, #yr_built').val('');
	}
      }
      else {
        hideComp();

        // check for year categories
        if(cat == 'Automotive' || cat == 'Motorcycle' || cat == 'Boats') {
          $('#yr-fld').show('fast');
        }
        else {
          $('#yr-fld').hide('fast');
        }
      }
    }

  }); 
}); 

// paginate on click
$(document).on("click", "#pendingOrder .pagination a, #post_form .pagination a, #comment-list .pagination a, #post-list .pagination a", function(){
  toggleLoading();
  $.getScript(this.href);
  return false;
}); 

// clear active state
function reset_menu_state($this, hFlg) {
  $('#profile-menu .nav li').removeClass('active');
  $('#li_home, #profile-menu .nav li a').css('background-color', 'transparent').css('color', '#555555');

  if (!$this.hasClass('active')) {
    $this.parent().addClass('active');
    $this.css('background-color', '#e6e6e6').css('color', '#F95700');
  }

  if (hFlg) { 
      $this.addClass('active').focus();
      $('.nav li.active a').css('color', '#F95700');
  }
}

// change active state for menu on click
$(document).on("click", "#profile-menu .nav li a", function(e){
  var $this = $(this);
  reset_menu_state($this, false);
});

// set page title
function set_title(val) { 
  document.title = "Pixi | " + val;
} 

function toggleLoading () { 
  $("#spinner").toggle(); 
}

// used to toggle spinner
var aStr = '#mark-posts, #post-frm, #comment-doc, #site_id, .pixi-cat, #purchase_btn, #search_btn, .uform, .back-btn, #pixi-form, .submenu, #cat-link, .bd-item, .slrUrl';
$(document).on("ajax:beforeSend, ajax:success, ajax:complete", aStr, function () {
    uiLoading(true);
});	

/*
$(document).on("ajax:success, ajax:complete", aStr,  function () {
  uiLoading(false);
});	
*/

// handle 401 ajax error
$(document).ajaxError( function(e, xhr, options){
  if(xhr.status == 401)
      window.location.replace('/users/sign_in');
});	

$(document).ready(function(){
  console.log('doc ready - main.js');

  // used to scroll up page
  $(window).scroll(function(){
    console.log('scroll - main.js');
    if ($(this).scrollTop() > 100) {
      $('.scrollup').fadeIn();
    } 
    else {
      $('.scrollup').fadeOut();
    }
  }); 

  // remove stnd header icon
  $('a[data-theme="app-bar"], a[data-theme="app-loc"]').find('.ui-icon').remove();

  // set window scroll
  $('.scrollup').click(function(){
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });

});

// reload masonry on ajax calls to swap data
$(document).on("click", ".pixi-cat", function(showElem){
  var cid = $(this).attr("data-cat-id");
  console.log('category id = ' + cid);

  // toggle value
  $('#category_id').val(cid);

  // toggle menu
  if($('.pixiPg').length > 0) {
    $('#category_id').selectmenu("refresh", true);
  }

  // process ajax call
  resetBoard(cid);
});

// reload masonry on ajax calls to swap data
$(document).on("click", ".slrUrl", function(showElem){
  var slrUrl = $(this).attr("data-url");
  nextPg = 1;

  // toggle value
  homeUrl = url + '/biz/' + slrUrl + '.json' + token;
  console.log('seller url = ' + homeUrl);

  // process ajax call
  goToUrl('../html/store.html');
});

// reload board
function reload_board(element) {
  console.log('in reload board - main.js');
  var $container = $('#px-container').masonry({ itemSelector : '.item', gutter : 1, isFitWidth: true, columnWidth : 1 });

  $container.imagesLoaded( function(){
    $container.masonry('reload');
  });
  isScrolled = false;
}

// initialize infinite scroll
function initScroll(cntr, nav, nxt, item) {
  var $container = $(cntr);

  console.log('in initScroll');

  $container.infinitescroll({
      navSelector  : nav, 		// selector for the paged navigation (it will be hidden)
      nextSelector : nxt,  		// selector for the NEXT link (ie. page 2)  
      itemSelector : item,          // selector for all items that's retrieve
      animate: false,
      extraScrollPx: 150,
      bufferPx : 100,
      loading: {
        img:  'http://i.imgur.com/6RMhx.gif',
	msgText: "<em>Loading...</em>"
      }
    },

    // trigger Masonry as a callback
    function(newElements){
      var $newElems = $(newElements).css({ opacity: 0 });

      // ensure that images load before adding to masonry layout
      $newElems.imagesLoaded(function(){
        $newElems.animate({ opacity: 1 });
        $container.masonry( 'appended', $newElems, true );
      });
    }
  );
}

// use masonry to layout landing page display
function load_masonry(nav, nxt, item, sz){
  if( $('#px-container').length > 0 ) {
    var $container = $('#px-container');
 
    $container.imagesLoaded( function(){
      $container.masonry({
        itemSelector : '.item',
	gutter : 10,
	isFitWidth: true,
        columnWidth : sz,
	layoutPriorities : {
	  upperPosition: 1,
	  shelfOrder: 1
        }
      });
    });

    // initialize infinite scroll
    initScroll('#px-container', nav, nxt, item);
  }
}

// check for category board
$(document).on("click", "#cat-link", function(){
  var loc = $('#site_id').val(); // grab the selected location 
  var newUrl = url + '/categories.json' + token + '&loc=' + loc;

  // process ajax call
  loadData(newUrl, 'cat');
});	


// check for text display toggle
$(document).on("click", ".moreBtn, #more-btn", function(){
  $('.content').hide('fast');
  $('#fcontent, .fcontent').show('fast') 
});	

// calc invoice amount
function calc_amt(){
  var qty = $('#inv_qty').val();
  var price = $('#inv_price').val();
  var tax = $('#inv_tax').val();
  var tax_total = 0;

  if (qty.length > 0 && price.length > 0) {
    var amt = parseInt(qty) * parseFloat(price);
    $('#inv_amt').val(parseFloat(amt).toFixed(2)); 

    // calc tax
    if(!isNaN(tax) && tax !== '') {
      tax_total = amt * parseFloat(tax)/100;
    }
    else {
      tax = 0;
    }
    console.log('tax = ' + tax);

    // update tax total
    $('#inv_tax_total').val(parseFloat(tax_total).toFixed(2)); 
    $('#inv_tax').val(parseFloat(tax).toFixed(2));

    // set & update invoice total
    if(isNaN(tax_total)) {
      var inv_total = amt;
      console.log('amt = ' + parseFloat(amt).toFixed(2)); 
    }
    else {
      console.log('tax_total = ' + parseFloat(tax_total).toFixed(2)); 
      var inv_total = amt + tax_total;
    }

    console.log('inv_total = ' + parseFloat(inv_total).toFixed(2)); 
    $('#inv_total').val(parseFloat(inv_total).toFixed(2)); 
    $('#inv_price').val(parseFloat(price).toFixed(2)); 
  }
}

// calc invoice amt
$(document).on("change", "#inv_qty, #inv_price, #inv_tax", function(){
  calc_amt();
});

// get pixi price based selection of pixi ID
$(document).on("change", "select[id*=pixi_id]", function() {
  var pid = $(this).val();
  var pixiUrl = url + '/listings/get_pixi_price.json' + token;
  
  // load price
  loadData(pixiUrl, 'price', {pixi_id:pid});
  calc_amt();
});

// process url calls
function processUrl(url) {
  $.ajax({
    url: url,
    dataType: 'script',
    'beforeSend': function() {
      toggleLoading();
    },
    'complete':  function() {  				
      toggleLoading();
    },
    'success': function() {
      toggleLoading();	
    }
  });
}

// set autocomplete selection value
$(document).on("railsAutocomplete.select", "#buyer_name", function(event, data){
  var bname = data.item.first_name + ' ' + data.item.last_name;
  $('#buyer_name').val(bname);
});

var keyPress = false; 

// submit contact form on enter key
$(document).on("keypress", "#contact_content", function(e){
  keyEnter(e, $(this), '#contact-btn');
});

// submit comment form on enter key
$(document).on("keypress", "#comment_content", function(e){
  keyEnter(e, $(this), '#comment-btn');
});

// submit search form on enter key
$(document).on("keypress", "#search", function(e){
  keyEnter(e, $(this), '#submit-btn');
});

// submit reply form on enter key
$(document).on("keypress", ".reply_content", function(e){
  keyEnter(e, $(this), '.reply-btn');
});

// check for location changes
$(document).on("change", "#site_id, #category_id", function() {

  // reset board
  if($('#px-container').length > 0) {
    resetBoard();
  }
  
  //prevent the default behavior of the click event
  return false;
});

// check for recent link click
$(document).on("click", "#recent-link", function() {

  // reset board
  resetBoard();
  
  //prevent the default behavior of the click event
  return false;
});

// process search btn
$(document).on('click', "#search-btn", function (e) {
  uiLoading(true);
  console.log('in click search');

  if ($('#search_txt').val().length > 0) {
    $(this).attr('disabled', 'disabled');
    nextPg = 1;

    // set path
    homeUrl = url + '/searches/locate.json' + token;
    refreshBoard(isDefined($('#site_url').val()));
  }
});

function loadSearchParams(pg) {
  console.log('in loadSearchParams...');
  var txt =  $('#search_txt').val();
  var loc = $('#site_id').val() || window.localStorage['home_site_id'];
  var cid = $('#category_id').val() || ''; // grab the selected category 
  var mUrl = $('#site_url').val() || '';
  var params = new Object();
  params.locate = { loc: loc, cid: cid, search: txt, url: mUrl, page: pg };

  return params;
}

// reset board pixi based on location
function resetBoard(cid) {
  var loc = $('#site_id').val(); // grab the selected location 
  cid = cid || $('#category_id').val(); // grab the selected category 
  nextPg = 1;

  // set search form fields
  $('#cid').val(cid);
  $('#loc').val(loc);

  // check location
  if (loc > 0) {
    if (cid > 0) {
      homeUrl = url + '/listings/category.json' + token +  '&loc=' + loc + '&cid=' + cid; 
    }
    else {
      homeUrl = url + '/listings/local.json' + token + '&loc=' + loc;
    }
  }
  else {
    if (cid > 0) {
      homeUrl = url + '/listings/category.json' + token + '&cid=' + cid; 
    }
    else {
      homeUrl = url + '/listings.json' + token;
    }
  }

  // refresh the page
  refreshBoard(true);
}

// refresh board content
function refreshBoard(flg) {
  $(".item").remove();
  $('#pxboard').html('');

  // reset featured band if needed
  if(!flg) {
    $('.featured').html('');
  }
  reload_items(renderBoard(homeUrl, nextPg, flg));
}

// Fix input element click problem
$(function() {
  $('.dropdown input, .dropdown label, .dropdown-menu input, .dropdown-menu select').click(function(e) {
    e.stopPropagation();
  });
});

// toggle menu post menu item
$(document).on('click', '.post-menu', function(e) {
  $('#mark-posts').toggle();
});

// toggle menu post menu item
$(document).on('click', '#home-link', function(e) {
  $('#site_id').val('').prop('selectedIndex',0);
  $('#category_id').val('').prop('selectedIndex',0);
  $('#search').val('');
  reset_top('#px-search', '#pixi-loc, #cat-top, #px-search');

  // reset board
  resetBoard();

  // toggle menu
  $('#category_id').selectmenu("refresh", true);
  $('#site_id').selectmenu("refresh", true);
});

// toggle menu state
$(document).on('click', '#mark-posts', function(e) {
  reset_menu_state($("#li_home"), true);
});

// reset next page scroll data
function resetScroll(px_url) {
  var $container = $('#px-container');

  console.log('resetScroll');

  // call the method to destroy the current infinitescroll session.
  $container.infinitescroll('destroy');
  $container.infinitescroll('unbind');

  // clear current infinitescroll session.
  $.removeData($container.get(0), 'infinitescroll')
  $container.data('infinitescroll', null);

  // load board
  loadData(px_url, 'board');

  // reset scroll
  $container.infinitescroll({                      
    state: {                                              
      isDestroyed: false,
      isDone: false                           
    }
  });

  // initialize infinite scroll
  load_masonry('#px-nav', '#px-nav a.nxt-pg', '#pxboard .item', 1);
}

// return masonry item size
function get_item_size() {
  if($('.board-top').length > 0) {
    var sz = 1; }
  else {
    var sz = 180; }

  return sz;
}

// process Enter key
function keyEnter(e, $this, str) {
  if (e.keyCode == 13 && !e.shiftKey && !keyPress) {
    keyPress = true;
    e.preventDefault();

    if($this.val().length > 0)
      $(str).click();
  }
}

// process window scroll for main image board
var processFlg = false;

$(window).scroll(function(e) {

  if ($('#px-container').length > 0) {
    var url = $('a.nxt-pg').attr('href');
    console.log('in window scroll');

    if (url.length > 0 && !processFlg && $(window).scrollTop() > ($(document).height() - $(window).height() - 50)) {
      processFlg = true;

      $.ajax({
        url: url,
        dataType: 'script',
        'beforeSend': function (xhr) {
  	   var token = $("meta[name='csrf-token']").attr("content");
	   xhr.setRequestHeader("X-CSRF-Token", token);
	   uiLoading(true);
        },
        success: function(data){
	  processFlg = false;
	},
        complete: function(data){
	  processFlg = false;
	  uiLoading(false);
	}
      })
    }
  }
});

// check for category board
function set_home_location(loc){
  var newUrl = url + '/pages/location_name.json?loc_name=' + loc;
  console.log('set home location url = ' + newUrl);

  // process ajax call
  loadData(newUrl, 'home');
}

function reload_ratings() {
  $(".rateit").rateit();
}

function fld_form(fid, sid, fld, txt, bname, btnID) {
  var str = '<form id="' + fid + '" data-ajax="false"><div id="form_errors" style="display:none" class="error"></div>' +
    '<div id="' + sid + '" class="clear-all sm-bot"><table><tr><td class="cal-size"><div data-role="fieldcontain" class="ui-hide-label">' +
    '<input name="content" id="' + fld + '" class="slide-menu" placeholder="' + txt + '" data-theme="a" required /></div></td>' +
    '<td><input type="submit" value="' + bname + '" data-theme="b" data-inline="true" id="' + btnID + '" data-mini="true"></td>' +
    '</tr></table></div></form>';
  return str;    
}

function isDefined(variable) {
  return (variable !== null && variable !== undefined);
}

function textFld(title, fnID, fld, cls) {
  var str = "<label>" + title + "</label>" 
    + "<input type='text' name='" + fnID + "' id='" + fnID + "' class='" + cls + "' placeholder='" + title + "' value='" + fld + "' />"; 
  return str;
}

function numberFld(title, fnID, fld, cls, sz) {
  var str = "<label>" + title + "</label>" 
    + "<input type='number' name='" + fnID + "' id='" + fnID + "' class='" + cls + "' size=" + sz + " maxlength=" + sz 
    + " placeholder='" + title + "' value='" + fld + "' />"; 
  return str;
}
