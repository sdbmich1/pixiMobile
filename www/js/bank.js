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
      + "<input type='hidden' name='acct_no' id='acct_no' />"
      + "<input type='hidden' name='country_code' id='country_code' value='us' />"
      + "<input type='hidden' name='currency_code' id='currency_type_code' value='USD' /></div></form>"
      + "<div class='center-wrapper'><img src='../img/rsz_check_sample.gif'></div>"
      + "<table><tr><td class='cal-size'><a href='#' id='cancel-bank-btn' data-role='button' data-inline='true'>Cancel</a></td></div>"
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
  $('#add-bank-btn').hide('fast');
  $('#pixi-list').empty();
  uiLoading(false);
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

// load list view if resFlg else return not found
function loadBankList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadBankList');

  title_str = "<span>My Accounts</span>"; 
  $('#inv-pg-title').html(title_str);

  // load listview
  if (resFlg && data.length > 0) {
    $.each(data, function(index, item) {

      localUrl = 'data-bank-id="' + item.id + '"';
      var pic = '<img src="' + '../img/190-bank.png' + '" style="height:60px; width:60px;">';
      var hdr = item.bank_name; 
      var ftr = '**** **** **** ' + item.acct_no;
      ftr += '<br>Acct Type: ' + item.acct_type;
      ftr += (item.default_flg ? ' | Default' : '')
      item_str += build_list('bank-item', localUrl, pic, hdr, ftr); 
    });
  }
  else {
    item_str = '<li class="center-wrapper">No banks found.</li>'
  }

  // append items
  $('.acct-btn').attr('id', 'add-bank-btn');
  $('#add-bank-btn').show();
  $('#acct-frm').empty();
  $container.append(item_str).listview('refresh');
}

// process click on bank item
$(document).on('click', ".bank-item", function(e) {
  e.preventDefault();
  pid = $(this).attr("data-bank-id");

  // clear container
  if ( pid !== undefined && pid != '' ) {
    $('#pixi-list').html('');

    var bankUrl = url + '/bank_accounts/' + pid + '.json' + token;
    loadData(bankUrl, 'bankpg'); 
  }
});

// process bank delete btn 
$(document).on('click', "#remove-bank-btn", function (e) {
  var id = $(this).attr('data-id');
  var bankUrl = url + '/bank_accounts/' + pid + '.json' + token;
  deleteData(bankUrl, 'bank');
});

// process new bank btn
$(document).on('click', "#add-bank-btn", function (e) {
  var data;
  loadBankAcct(data, true);
});


