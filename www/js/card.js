// load list view if resFlg else return not found
function loadCardList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadCardList');

  // load listview
  if (resFlg && data.length > 0) {
    $.each(data, function(index, item) {
      title_str = "<span>My Accounts</span>"; 
      $('#inv-pg-title').html(title_str);

      localUrl = 'data-card-id="' + item.id + '"';
      var pic = '<img src="' + cardImage(item.card_type) + '" style="height:60px; width:60px;">';
      var hdr = '**** **** **** ' + item.card_no;
      var ftr = 'Exp Date: ' + item.expiration_month + '/' + item.expiration_year;
      item_str += build_list('card-item', localUrl, pic, hdr, ftr); 
    });
  }
  else {
    item_str = '<li class="center-wrapper">No cards found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}

// process card account page
function loadCardPage(data, resFlg) {
  var $container = $('#pixi-list');
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
