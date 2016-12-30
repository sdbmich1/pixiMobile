// load list view if resFlg else return not found
function loadCardList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';

  title_str = "<span>My Accounts</span>"; 
  $('#inv-pg-title').html(title_str);

  // load listview
  if (resFlg && data.length > 0) {
    $.each(data, function(index, item) {

      localUrl = 'data-card-id="' + item.id + '"';
      var pic = '<img src="' + cardImage(item.card_type) + '" style="height:60px; width:60px;">';
      var hdr = '**** **** **** ' + item.card_no;
      var ftr = 'Exp Date: ' + item.expiration_month + '/' + item.expiration_year;
      ftr += (item.default_flg ? ' | Default' : '')
      item_str += build_list('card-item', localUrl, pic, hdr, ftr); 
    });
  }
  else {
    item_str = '<li class="center-wrapper">No cards found.</li>'
  }

  // append items
  $('.acct-btn').attr('id', 'add-card-btn');
  $('#add-card-btn').show();
  $('#acct-frm').empty();
  $container.html(item_str).listview().listview('refresh');
  //$container.append(item_str).listview('refresh');
}

// process card account page
function loadCardPage(data, resFlg) {
  var $container = $('#acct-frm');
  var title_str= '';

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      title_str = "<span>View Card Account</span>"; 

      // load title
      $('#inv-pg-title').html(title_str);
      $('#acct-frm').html('');

      var pic = '<img src="' + cardImage(data.card_type) + '" style="height:60px; width:60px;">';

      var cardStr = "<div id='data_error' style='display:none' class='error'></div>"
        + "<div class='mleft10'><div class='sm-top'><table class='inv-descr'>"
        + "<tr><td>Card Type: </td><td class='width30'></td><td>" + pic + "</td></tr>"
        + "<tr><td>Card #: </td><td class='width30'></td><td>**** **** **** " + data.card_no + "</td></tr>"
        + "<tr><td>Exp Date: </td><td class='width30'></td><td>" + data.expiration_month + '/' + data.expiration_year + "</td></tr>"
        + "<tr><td>Zip: </td><td class='width30'></td><td>" + data.zip + "</td></tr>"
        + "<tr><td>Default: </td><td class='width30'></td><td>" + data.default_flg + "</td></tr></table></div>"
        + "<div class='mtop center-wrapper'><a href='#' id='remove-card-btn' data-role='button' data-inline='true' data-id='" 
        + data.id + "'>Remove</a></div></div>";

      // build page
      $container.append(cardStr).trigger('create');
    }
    else {
      PGproxy.navigator.notification.alert("Card account data not found.", function() {}, 'Card Account', 'Done');
    }
  }
  else {
    console.log('Card account page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Card Account', 'Done');
  }

  // turn off spinner
  uiLoading(false);
}

// process card account form
function loadCardAcct() {
  var title_str='', card_no='', card_code='', postal_code='';

  // turn on spinner
  uiLoading(true);

  title_str = "<span>Create Card Account</span>"; 

  // load title
  $('#inv-pg-title').html(title_str);
  $('#acct-frm').html('');

  var cardImages = '';
  var cardNames = ['Visa', 'Master Card', 'American Express', 'Discover', 'Jcb', 'Diners Club'];
  cardNames.forEach(function(cardName) {
    cardImages += "<img src='" + cardImage(cardName) + "' class='tiny'>";
  });

  var card_str = "<div id='data_error' style='display:none' class='error'></div>"
    + "<div class='mleft10'>"
    +   "<form id='card-acct-form' data-ajax='false'>"
    +   "<div class='sm-top'>"
    +     "<table class='inv-descr'>"
    +       "<tr>"
    +         "<td>Card #</td>"
    +         "<td>"
    +           "<div data-role='fieldcontain' class='sm-top ui-hide-label'>"
    +             "<input type='number' name='card_number' id='card_number' maxlength=16 size=16"
    +               "placeholder='Card Number' data-theme='a'"
    +               "value='" + card_no + "' />"
    +           "</div>"
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td></td>"
    +         "<td>"
    +           cardImages
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td>Card Code</td>"
    +         "<td>"
    +           "<div data-role='fieldcontain' class='sm-top ui-hide-label'>"
    +             "<input type='number' name='card_code' id='card_code' maxlength=4 size=4"
    +               "placeholder='Card Code' data-theme='a'"
    +               "value='" + card_code + "' />"
    +           "</div>"
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td></td>"
    +         "<td>"
    +           "<img src='../img/cvv.png' class='tiny'>"
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td>Postal Code</td>"
    +         "<td>"
    +           "<div data-role='fieldcontain' class='sm-top ui-hide-label'>"
    +             "<input type='number' name='zip' id='zip'"
    +                "placeholder='Postal Code' data-theme='a' maxlength=5 size=5"
    +                "value='" + postal_code + "' />"
    +           "</div>"
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td class='img-valign'>Exp Month</td>"
    +         "<td>"
    +           selectMonth()
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td class='img-valign'>Exp Year</td>"
    +         "<td>"
    +           selectYear()
    +         "</td>"
    +       "</tr>"
    +       "<tr>"
    +         "<td class='img-valign'>Default</td>"
    +         "<td>"
    +           "<input type='checkbox' id='default_flg_checkbox' value='Y' />"
    +         "</td>"
    +       "</tr>"
    +     "</table>"
    +     "<input type='hidden' name='user_id' id='user_id'"
    +        "value='" + usr.id + "' />"
    +     "<input type='hidden' name='token' id='token' />" 
    +     "<input type='hidden' name='card_no' id='card_no' />"
    +   "</div>"
    + "</form>"
    + "<table>"
    +   "<tr>"
    +     "<td class='cal-size'>"
    +       "<a href='#' id='cancel-card-btn' data-role='button' "
    +          "data-inline='true'>Cancel</a>"
    +     "</td>"
    +     "<td class='nav-right'>"
    +       "<input type='submit' value='Save' data-theme='d' "
    +         "data-inline='true' id='payForm'>"
    +     "</td>"
    +   "</tr>"
    + "</table>";

  // build page
  $('#pixi-list').empty();
  $('#add-card-btn').hide('fast');
  $('#acct-frm').append(card_str).trigger('create');

  // turn off spinner
  uiLoading(false);
}

function selectMonth() {
  return "<select id='card_month' name='card_month'>"
         + "<option value='1'>January</option>"
         + "<option value='2'>February</option>"
         + "<option value='3'>March</option>"
         + "<option value='4'>April</option>"
         + "<option value='5'>May</option>"
         + "<option value='6'>June</option>"
         + "<option value='7'>July</option>"
         + "<option value='8'>August</option>"
         + "<option value='9'>September</option>"
         + "<option value='10'>October</option>"
         + "<option value='11'>November</option>"
         + "<option value='12'>December</option>"
       + "</select>";
}

function selectYear() {
  var output = "<select id='card_year' name='card_year'>";
  var year = parseInt((new Date()).getFullYear());
  for (var i = 1; i <= 15; i++) {
    output += "<option value='" + (year + i) + "'>" + (year + i) + "</option>";
  }
  output += "</select>";
  return output;
}

function cardImage(cardType) {
  var files = {
    'American Express': 'amex.png',
    'Diners Club': 'diners.png',
    'Discover': 'discover.png',
    'Jcb': 'jcb.png',
    'Master Card': 'mastercard.png',
    'Visa': 'visa.png',
  };
  return '../img/' + files[cardType];
}

// process click on card item
$(document).on('click', ".card-item", function(e) {
  e.preventDefault();
  pid = $(this).attr("data-card-id");

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
  deleteUrl = url + '/card_accounts/' + id + '.json' + token;
  navigator.notification.confirm('Are you sure? Your data will be removed!', onCardRemoveConfirm, 'Remove', 'No, Yes');
});

// process new card btn
$(document).on('click', "#add-card-btn", function (e) {
  loadCardAcct();
});

// process confirmation
function onCardRemoveConfirm(button) {
  if (button == 2) {
    deleteData(deleteUrl, 'card');  // delete record
  }
}
