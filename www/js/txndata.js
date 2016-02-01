
// load transaction page
function loadTxnPage(data, resFlg, txnType) {
  console.log('in Transaction page');

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      var txn = data.transaction;

      // clear page
      $('#txn-frm').html('');
      $('#form_errors').html('');

      var photo = getPixiPic(txn.photo, 'height:60px; width:60px;', 'smallImage'); 
      var name_str = "<span class='mleft10 pstr'>" + txn.buyer_name + "</span><br />";
      var total = parseFloat(txn.amt).toFixed(2);
      var descr = txn.description + ((txnType == 'invoice') ? " from " + txn.seller_name : '');

      var txn_str = "<table><tr><td>" + photo + "</td><td>" + name_str + "</td></tr></table>"
        + "<table class='inv-descr'><tr><td class='cal-size'>Confirmation #:</td><td></td><td>" + txn.confirmation_no + "</td></tr>";

      if (txn.amt > 0) {
        txn_str += "<tr><td class='width240'>Payment Type: </td><td></td><td>" + txn.payment_type + "</td></tr>"
	  + "<tr><td class='width240'>Card #:</td><td></td><td>************" + txn.credit_card_no + "</td></tr>"
	  + "<tr><td class='width240'>Amount:</td><td></td><td>$" + total + "</td></tr>";
      }

      txn_str += "<tr><td class='width240'>Date: </td><td></td><td>" + txn.txn_dt + "</td></tr>" 
        + "<tr><td class='width240'>Name: </td><td></td><td>" + txn.buyer_name + "</td></tr>" 
	+ "<tr><td class='width240'>Email: </td><td></td><td>" + txn.email + "<br></td></tr>" 
	+ "<tr><td class='width240'>Description: </td><td></td><td>" + descr + "<br></td></tr></table>"
	+ "<div class='clear-all'></div><div class='mtop center-wrapper'>" 
	+ "<a href='#' data-role='button' data-inline='true' data-theme='d' id='done-btn'>Done</a></div>";

      // build page
      $('#txn-frm').append(txn_str).trigger('create');
    }
  }
  else {
    console.log('Transaction page load failed');
    PGproxy.navigator.notification.alert("Transaction page failed", function() {}, 'Transaction', 'Done');
  }
  uiLoading(false);
}

// load transaction form
function loadTxnForm(data, resFlg, txnType, promoCode) {
  var total, id_str, acct;
  var card_no, card_type, exp_dt, cust_token='';
  var d = new Date();
  var month = d.getMonth()+1;
  var yr = d.getFullYear();
  var exp_yr='', exp_mo='';
  var inv, buyer;

  promoCode = promoCode || '';

  if (resFlg) {
    if (isDefined(data)) {
      inv = data.invoice;
      var prc_fee = inv.get_processing_fee, conv_fee = inv.get_convenience_fee;
      var qty = inv.invoice_details[0].quantity;
      var prc = inv.invoice_details[0].price;
      var ftype = inv.invoice_details[0].fulfillment_type_code;
      var pid = inv.listings[0].pixi_id;

      $('#txn-frm, #form_errors').html('');

      buyer = data.user;
      var addrHash = txnAddress(buyer);
      var shipHash = showShipInfo(buyer, ftype, resFlg);

      // check for user card info
      if(buyer.active_card_accounts.length > 0) {
        exp_yr = buyer.active_card_accounts[0].expiration_year 
        exp_mo = buyer.active_card_accounts[0].expiration_month 
      }

      // set vars based on txn type
      total = parseFloat(inv.get_fee + inv.amount).toFixed(2);

      // set vars based on txn type
      if (txnType == 'invoice') {
	var pixi_title = inv.pixi_title, idNum = inv.id, class_name = "inv-item width80";
	id_str = "data-inv-id";
      }
      else {
	var pixi_title = inv.title, idNum = pid, class_name = 'bd-item width80';
	id_str = "data-pixi-id";
      }

      // build form string
      var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
	+ "<form id='payment_form' data-ajax='false'><div class='div-border'>"
	+ "<table><tr><td class='cal-size title-str'>Total Due</td><td class='price title-str'>$" + total + "</td></tr></table></div>" 
	+ showBuyerInfo(buyer, resFlg, addrHash) + shipHash.str + showCard(buyer)
	+ "<input type='hidden' id='user_id' value='" + getUserID() + "' />"
	+ "<input type='hidden' id='first_name' value='" + buyer.first_name + "' />"
	+ "<input type='hidden' id='last_name' value='" + buyer.last_name + "' />"
	+ "<input type='hidden' name='transaction_type' id='transaction_type' value='" + txnType + "' />"
	+ "<input type='hidden' name='amt' id='amt' value='" + total + "' />"
	+ "<input type='hidden' name='pixi_id' id='pixi_id' value='" + pid + "' />"
	+ "<input type='hidden' id='description' value='" + pixi_title + "' />"
	+ "<input type='hidden' name='seller_token' id='seller_token' value='" + inv.seller.acct_token + "' />"
	+ "<input type='hidden' name='seller_inv_amt' id='seller_inv_amt' value='" + inv.seller_amount + "' />"
	+ "<input type='hidden' id='processing_fee' value='" + prc_fee + "' />"
	+ "<input type='hidden' id='convenience_fee' value='" + conv_fee + "' />"
        + "<input type='hidden' id='promo_code' value='" + promoCode + "' />"
        + "<table><tr><td class='cal-size'>" + showButton(id_str, idNum, 'Back', '', 'txn-prev-btn', class_name) + "</td>"
        + "<td class='nav-right'><input type='submit' value='Done!' data-theme='d' data-inline='true' id='payForm'></td></tr></table>"
	+ "</form>"; 

      // build page
      $('#txn-frm').append(inv_str).trigger('create');
      setState("#state", addrHash.state);  // load state dropdown
      loadYear("#card_year", -15, 0, yr+1); // load year fld
      loadMonth("#card_month", month); // load month fld
      setState("#recipient_state", shipHash.state);  // load state dropdown
    }
  }
  else {
    console.log('Load transaction failed');
    PGproxy.navigator.notification.alert("Transaction load failed", function() {}, 'Transaction', 'Done');
  }
}

function showBuyerInfo(buyer, resFlg, ahash) {
  var fldHash = {addr: 'address', city: 'city', state: 'state', zip: 'zip', hphone: 'home_phone', email: 'email'};
  var str = "<div class='div-border'><table class='inv-descr addr-tbl' style='" + ahash.style[0] + "'>"  
    + "<tr><td class='cal-size'><strong>Buyer Information</strong><br>" + buyer.name + "<br>" + ahash.addr + "</td>"
    + "<td class='v-align price' style='" + ahash.style[0] + "'>" 
    + showButton('data-id', 0, 'Change', '', 'edit-txn-addr', '', 'true') + "</td></tr></table>"
    + "<table class='inv-descr user-tbl' style='" + ahash.style[1] + "'>" 
    + "<tr><td class='col-size'>" + textFld('First Name*', 'first_name', buyer.first_name, 'profile-txt') + "</td><td></td>"
    + "<td class='col-size'>" + textFld('Last Name*', 'last_name', buyer.last_name, 'profile-txt') + "</td></tr>"
    + showAddress(buyer, resFlg, true, buyer.email, fldHash) + "</table></div>";
  return str;	
}

function showRecipientInfo(recipient, resFlg, ahash) {
  var fldHash = {addr: 'recipient_address', city: 'recipient_city', state: 'recipient_state', zip: 'recipient_zip', 
    hphone: 'recipient_home_phone', email: 'recipient_email'};
  var name = recipient.first_name + ' ' + recipient.last_name;
  var str = "<div class='div-border'><table class='inv-descr ship-addr-tbl' style='" + ahash.style[0] + "'>"  
    + "<tr><td class='cal-size'><strong>Shipping Information</strong><br>" + name + "<br>" + ahash.addr + "</td>"
    + "<td class='v-align price' style='" + ahash.style[0] + "'>" + showButton('data-id', 0, 'Change', '', 'edit-ship-addr', '', 'true') 
    + "</td></tr></table>"
    + "<table class='inv-descr rcpt-tbl' style='" + ahash.style[1] + "'>" 
    + "<tr><td class='col-size'>" + textFld('First Name*', 'recipient_first_name', recipient.first_name, 'profile-txt') + "</td><td></td>"
    + "<td class='col-size'>" + textFld('Last Name*', 'recipient_last_name', recipient.last_name, 'profile-txt') + "</td></tr>"
    + showAddress(recipient, resFlg, true, recipient.email, fldHash) + "</table></div>";
  return str;	
}

// check for user address
function txnAddress(buyer) {
  var style = ['', ''], city='', state='', zip='', street='', home_addr='';
  if(buyer.contacts.length > 0) {
    addr = buyer.contacts[0];
    state = addr.state; zip = addr.zip; city = addr.city; street = addr.address;
    home_addr = street + "<br>" + city + ", " + state + " " + zip;

    if(addr.address !== undefined && addr.city !== undefined && addr.state !== undefined && addr.zip !== undefined) 
      style = ['', 'display:none'];
    else 
      style = ['display:none', ''];
  }
  var hash = { addr: home_addr, style: style, state: state };
  return hash;
}

function showShipInfo(buyer, ftype, resFlg) {
  var recipient, addr_hash, ship_hash = { str: '', state: '' };
  if(ftype == 'SHP') {
    recipient = (buyer.ship_addresses.length > 0) ? buyer.ship_addresses[0] : buyer;
    addr_hash = txnAddress(recipient);
    ship_hash = { str: showRecipientInfo(recipient, resFlg, addr_hash), state: addr_hash.state };
  }
  return ship_hash;
}

// show card account
function showCard(buyer) {
  var card_no, card_type, exp_dt, cust_token='', acct;
  var card_edit_style, card_show_style;

  if(buyer.active_card_accounts.length > 0) {
    acct = buyer.active_card_accounts[0];
    card_no = acct.card_no; exp_dt = acct.expiration_month + '/' + acct.expiration_year; 
    card_type = acct.card_type, cust_token = buyer.cust_token;
    card_edit_style = 'display:none'; card_show_style = '';
  }
  else {
    card_show_style = 'display:none'; card_edit_style = '';
  }

  var str = "<div class='div-border'><table class='inv-descr card-dpl' style='" + card_show_style + "'>"  
    + "<tr><td class='cal-size'><strong>Payment Information</strong><br>" 
    + card_type + "<br>************" + card_no + "<br>Exp: " + exp_dt + "</td>"
    + "<td class='v-align price'>" + showButton('', 0, 'Change', '', 'edit-card-btn', '', 'true') + "</td></tr></table>"
    + "<table class='inv-descr card-tbl' style='" + card_edit_style + "'><tr><td class='cal-size'><label>Card #* </label>"
    + "<img src='../img/cc_logos.jpeg' class='cc-logo' />"
    + "<input type='number' name='card_number' id='card_number' maxlength=16 size=16 class='cal-size profile-txt' /></td></tr><tr><td>"
    + "<table><tr><td><label>CVV*</label>"
    + "<input type='number' name='cvv' id='card_code' maxlength=4 size=4 class='card-code profile-txt' /></td>"
    + "<td></td><td><label class='mleft5'>Exp Mo</label><select name='card_month' id='card_month' data-mini='true'></select></td>"
    + "<td><label>Exp Yr</label><select name='card_year' id='card_year' data-mini='true'></select></td></tr></table></td></tr></table></div>" 
    + "<input type='hidden' id='token' name='token' value='" + cust_token + "' />"
  return str;
}

