
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
  var style = '', city='', state='', zip='', street='', total, alt_style, id_str, acct;
  var card_no, card_type, exp_dt, token='';
  var d = new Date();
  var month = d.getMonth()+1;
  var yr = d.getFullYear();

  promoCode = promoCode || '';

  if (resFlg) {
    if (data !== undefined) {
      var prc_fee = data.get_processing_fee, conv_fee = data.get_convenience_fee;

      $('#txn-frm').html('');
      $('#form_errors').html('');

      // set account
      if(data.user.card_accounts.length > 0) {
        acct = data.user.card_accounts[0];
	card_no = acct.card_no; exp_dt = acct.expiration_month + '/' + acct.expiration_year; card_type = acct.card_type, token = acct.token;
	card_edit_style = 'display:none'; card_show_style = '';
      }
      else {
	card_show_style = 'display:none'; card_edit_style = '';
      }

      // check for user address
      if(data.user.contacts.length > 0) {
        addr = data.user.contacts[0];
	state = addr.state; zip = addr.zip; city = addr.city; street = addr.address;

        if(addr.address !== undefined && addr.city !== undefined && addr.state !== undefined && addr.zip !== undefined) {
	  alt_style = 'display:none'; style = '';
	} 
	else {
	  style = 'display:none'; alt_style = '';
	}
      }

      // set vars based on txn type
      if (txnType == 'invoice') {
        total = parseFloat(data.get_fee + data.amount).toFixed(2);
	var pixi_title = data.pixi_title, idNum = data.id, class_name = "inv-item";
	id_str = "data-inv-id='";
      }
      else {
        total = parseFloat(data.get_fee + data.amount).toFixed(2);
	var pixi_title = data.title, idNum = data.pixi_id, class_name = 'bd-item';
	id_str = "data-pixi-id='";
      }

      // build form string
      var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
        + "<div id='inv-item' class='mleft10' data-qty='" + data.quantity + "' data-prc='" + data.price + "' data-pixi_id='"
	+ data.pixi_id + "'><form id='payment_form' data-ajax='false'>"
        + "<div class='div-border'><table><tr><td class='cal-size title-str'>Total Due</td><td class='price title-str'>$"
	+ total + "</td></tr></table></div><div class='div-border'><table class='inv-descr addr-tbl' style='" + style + "'>"  
	+ "<tr><td class='cal-size'><strong>" + data.user.name + "</strong><br>" + street + "<br>" + city + ", " + state + " " + zip + "</td>"
	+ "<td class='v-align price'><a href='#' id='edit-txn-addr' data-role='button' data-inline='true' data-mini='true' data-theme='b'>"
	+ "Change</a></td></tr></table><center><table class='inv-descr user-tbl' style='" + alt_style + "'>" 
	+ "<tr><td><label>First Name* </label><input type='text' name='first_name' id='first_name' class='profile-txt' placeholder='First Name' "
	+ "value='" + data.user.first_name + "' /></td><td></td>"
	+ "<td><label>Last Name* </label><input type='text' name='last_name' id='last_name' class='profile-txt' placeholder='Last Name' value='" 
	+ data.user.last_name + "' /></td></tr>" + showAddress(data.user, resFlg, true) + "</table></center>"
	+ "<table class='mtop inv-descr card-dpl' style='" + card_show_style + "'>"  
	+ "<tr><td class='cal-size mbot'>Card Info:<br>" + card_type + "<br>************" + card_no + "<br>Exp: " + exp_dt + "</td>"
	+ "<td class='v-align price'><a href='#' id='edit-card-btn' data-role='button' data-inline='true' data-mini='true' data-theme='b'>"
	+ "Change</a></td></tr></table>"
	+ "<table class='mtop inv-descr card-tbl' style='" + card_edit_style + "'><tr><td class='cal-size'><label>Card #* </label>"
	+ "<img src='../img/cc_logos.jpeg' class='cc-logo' />"
        + "<input type='number' name='card_number' id='card_number' size=16 class='profile-txt' /></td></tr><tr><td><table><tr><td><label>CVV*"
        + "</label><input type='number' name='cvv' id='card_code' maxlength=4 size=4 class='card-code profile-txt' /></td>"
	+ "<td></td><td><label>Exp Mo</label><select name='card_month' id='card_month' data-mini='true'></select></td>"
        + "<td><label>Exp Yr</label><select name='card_year' id='card_year' data-mini='true'></select></td></tr></table></td></tr></table>"
	+ "<input type='hidden' id='user_id' value='" + usr.id + "' />"
	+ "<input type='hidden' id='token' name='token' value='" + token + "' />"
	+ "<input type='hidden' id='first_name' value='" + data.user.first_name + "' /><input type='hidden' id='last_name' value='" 
	+ data.user.last_name + "' /><input type='hidden' name='transaction_type' id='transaction_type' value='" + txnType + "' />"
	+ "<input type='hidden' name='amt' id='amt' value='" 
	+ data.amount + "' /><input type='hidden' id='description' value='" + pixi_title + "' />"
	+ "<input type='hidden' id='processing_fee' value='" + prc_fee + "' />"
	+ "<input type='hidden' id='convenience_fee' value='" + conv_fee + "' />"
        + "<input type='hidden' id='promo_code' value='" + promoCode + "' />"
        + "<table><tr><td class='cal-size'><a href='#' id='txn-prev-btn' class='" + class_name + "' data-role='button' data-inline='true' " + id_str
	+ idNum + "'>Prev</a></td></div>"
	
        + "<td class='nav-right'><input type='submit' value='Done!' data-theme='d' data-inline='true' id='payForm'></td></tr></table>"
	+ "</form></div>"; 

      // build page
      $('#txn-frm').append(inv_str).trigger('create');
      setState("#state", state);  // load state dropdown
      loadYear("#card_year", -15, 0, yr+1); // load year fld
      loadMonth("#card_month", month); // load month fld
    }
  }
  else {
    console.log('Load transaction failed');
    PGproxy.navigator.notification.alert("Transaction load failed", function() {}, 'Transaction', 'Done');
  }
}

