// process invoice page display
function loadInvForm(data, resFlg) {
  var dt = curDate();
  var sub_str, seller_id, title_str, pixi_id = '', qty='', prc = '', buyer='', subtotal='', sales_tax='', tax_total='', amount='', 
    inv_id='', comment='', buyer_id='';

  uiLoading(true);
  $('#inv-frm').html('');
  $('#frm-submit').html('');

  if (resFlg) {
    if (data !== undefined) {
      dt = data.inv_dt;
      pixi_id = data.pixi_id;
      inv_id = data.id;
      buyer = data.buyer_name;
      buyer_id = data.buyer_id;
      seller_id = data.seller_id;
      qty = data.quantity;
      prc = parseFloat(data.price).toFixed(2);
      subtotal = parseFloat(data.subtotal).toFixed(2);
      sales_tax = parseFloat(data.sales_tax).toFixed(2) || 0.0;
      tax_total = parseFloat(data.tax_total).toFixed(2) || 0.0;
      amount = parseFloat(data.amount).toFixed(2);
      comment = data.comment || '';
      title_str = "<span>Invoice #" + data.id + "</span>"; 
      sub_str = "<input type='submit' value='Send' data-theme='d' data-inline='true' id='add-inv-btn' data-inv-id='" + data.id + "' >";
    }
    else {
      seller_id = usr.id;
      title_str = "<span>Send Invoice</span>"; 
      sub_str = '<input type="submit" value="Send" data-theme="d" data-inline="true" id="add-inv-btn">';
    }

    // load title
    $('#inv-pg-title').html(title_str);

    var inv_str = "<form id='invoice-doc' data-ajax='false'><div class='mleft10'><table class='inv-descr'><tr><td>Date:</td><td>" + dt + "</td></tr>"
      + "<tr><td>Bill To:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='buyer_name' id='buyer_name' class='' placeholder='Buyer Name' data-theme='a' value='" + buyer + "' /></div>"
      + "<ul class='suggestions' data-role='listview' data-inset='true' data-icon='false'></ul></td></tr>"
      + "<tr><td>Item:</td><td><div class='dd-list'><select name='pixi_id' id='pixi_id' data-mini='true'></div></select></td></tr>" 
      + "<tr><td class='img-valign'>Quantity:</td><td><select name='quantity' id='inv_qty' class='mtop' data-mini='true'></select></td></tr>" 
      + "<tr><td class='img-valign'>Price:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='number' name='price' id='inv_price' placeholder='Enter Price' class=' price' data-theme='a' value='" + prc + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Subtotal</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='subtotal' id='inv_amt' class='price' readonly='true' data-theme='a' value='" + subtotal + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Sales Tax</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='sales_tax' id='inv_tax' class='price' placeholder='Enter tax (if any)' data-theme='a' value='" 
      + sales_tax + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Tax</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='tax_total' id='inv_tax_total' class='price' readonly='true' data-theme='a' value='" + tax_total + "' /></div></td></tr>" 
      + "<tr><td class='img-valign'>Amount Due</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='amount' id='inv_total' class='total-str price' readonly='true' data-theme='a' value='" + amount + "' /></div></td></tr>" 
      + "<tr><td>Comments:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='comment' id='comment' placeholder='Enter comments here...' data-theme='a' value='" 
      + comment + "' /></div></td></tr><input type='hidden' name='seller_id' id='seller_id' value='" + seller_id + "' />"
      + "<input type='hidden' name='id' id='inv_id' value='" + inv_id + "' />"
      + "<input type='hidden' name='buyer_id' id='buyer_id' value='" + buyer_id + "' /></div></table></form>";

    // build page
    $('#inv-frm').append(inv_str).trigger('create');
    $('#frm-submit').append(sub_str).trigger('create');

    // load drop down lists
    setPixiList(usr.active_listings, '#pixi_id', pixi_id);
    loadQty('#inv_qty', qty);
  }
  else {
    console.log('Invoice page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Invoice Form', 'Done');
  }
  uiLoading(false);
}

function showInvTable(prc, qty, invHash, flg) {
  var popStr = "<td><a href='#popupInfo' data-rel='popup' data-role='button' class='ui-icon-alt' data-inline='true' "
    + "data-transition='pop' data-icon='info' data-theme='a' data-iconpos='notext'>Learn more</a></td>";
  var str = "<table class='txn-tbl inv-descr'>" 
    + "<tr><td class='cal-size'>Quantity</td><td class='price'>" + qty + "</td><td class='price'>$" + prc + "</td></tr>"
    + "<tr><td>Sales Tax</td><td class='price'>" + invHash.tax + "%</td><td class='price'>$" + invHash.tax_total + "</td></tr>"
    + "<tr><td>Shipping</td><td class='price'></td><td class='price'>$" + invHash.ship_amt + "</td></tr>"
    + "<tr><td>Convenience Fee</td>";
  str += (flg) ? popStr : "<td class='price'></td>";
  str += "<td class='price'>$" + invHash.fee + "</td></tr>"
    + "<tr><td class='cal-size title-str'>Total Due</td><td></td><td class='price title-str'>$" + invHash.total + "</td></tr></table>";
  return str;
}

function setInvData(inv) {
  var tax = (isDefined(inv.sales_tax)) ? parseFloat(inv.sales_tax).toFixed(2) : 0.0;
  var ship_amt = (isDefined(inv.ship_amt)) ? parseFloat(inv.ship_amt).toFixed(2) : 0.0;
  var tax_total = (isDefined(inv.tax_total)) ? parseFloat(inv.tax_total).toFixed(2) : 0.0;
  var prc_fee = parseFloat(inv.get_processing_fee).toFixed(2);
  var conv_fee = parseFloat(inv.get_convenience_fee).toFixed(2);
  var fee = parseFloat(inv.get_fee).toFixed(2);
  var total = parseFloat(inv.get_fee + inv.amount).toFixed(2);
  return {tax: tax, ship_amt: ship_amt, tax_total: tax_total, prc_fee: prc_fee, conv_fee: conv_fee, fee: fee, total: total};
}

// process invoice page display
function loadInvPage(data, resFlg) {
  if (resFlg) {
    var item = data.invoice;
    var pic_str = "height:45px; width:45px; border: 1px solid #ccc;";
    var inv_str = "<div class='mleft10'><table class='inv-descr'><tr><td>Invoice #: </td><td>" + item.id + "</td></tr><tr>"; 
    inv_str += "<td>Date: </td><td>" + item.inv_dt + "</td></tr>"; 

    // display correct photo based on whether user is buyer or seller
    if(item.seller_id == getUserID()) 
      inv_str += "<tr><td>Bill To: </td><td>" + showUserPhoto(item.buyer.photo, item.buyer.name, 'inv-descr') + "<td></tr>";
    else
      inv_str += "<tr><td>From: </td><td>" + showUserPhoto(item.seller.photo, item.seller.name, 'inv-descr') + "</td></tr>";
    inv_str += "</table></div>";

    // set invoice details
    var invHash = setInvData(item);
    inv_str += "<div class='mleft10'><div class='control-group'><table class='mtop inv-tbl inv-descr'>"
      + "<th><div class='center-wrapper'>Qty</div></th><th><div class='center-wrapper'>Item</div></th>"
      + "<th><div class='center-wrapper'>Price</div></th><th><div class='center-wrapper'>Amount</div></th>"
      + loadInvRow(item)
      + "<tr class='sls-tax'><td></td><td><div class='nav-right'>Sales Tax</div></td>"
      + "<td class='width120'><div class='nav-right'>" + invHash.tax + "%</div></td>"
      + "<td class='width120'><div class='nav-right'>" + invHash.tax_total + "</div></td></tr>"
      + "<tr class='sls-tax'><td></td><td><div class='nav-right'>Shipping</div></td>"
      + "<td></td><td class='width120'><div class='nav-right'>" + invHash.ship_amt + "</div></td></tr>"
      + "<tr class='v-align'><td></td><td class='img-valign mtop nav-right'>Fee</td>"
      + "<td><a href='#popupInfo' data-rel='popup' data-role='button' class='ui-icon-alt' data-inline='true' "
      + "data-transition='pop' data-icon='info' data-theme='a' data-iconpos='notext'>Learn more</a></td>"
      + "<td class='img-valign mtop nav-right'>" + invHash.fee + "</td></tr>"
      + "<tr><td></td><td><div class='nav-right'>Amount Due</div></td><td></td>"
      + "<td class='width120'><div class='order-total total-str nav-right'><h6>$" + invHash.total + "</h6></div></td></tr></table>";

    if (isDefined(item.comment)) {
      inv_str += "<div class='mtop inv-descr control-label'>Comments: " + item.comment + "</div>";
    }
    inv_str += "</div><div class='nav-right'>"
     
    // if owned & unpaid display edit btns
    if (item.seller_id == getUserID()) {
      if (item.status == 'unpaid') {
        inv_str += "<table><tr><td>" + showButton('data-inv-id', item.id, 'Edit', 'b', 'edit-inv-btn') + "</td>"
	  + "<td>" + showButton('data-inv-id', item.id, 'Remove', 'a', 'remove-inv-btn') + "</td><tr></table>";
      }
    }
    else {
      if (item.status == 'unpaid') {
        inv_str += "<br />" + showButton('data-inv-id', item.id, 'Pay', 'd', 'pay-btn');
      }
    }
    inv_str += "</div></div>";
    $('#inv_details').append(inv_str).trigger("refresh");
  }
  else {
    console.log('inv page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Invoice', 'Done');
  }
}

function loadInvRow(data) {
  var str = '';
  console.log('in loadInvRow');
  $.each(data.invoice_details, function(index, item) {
    console.log('adding inv details');
    str += "<tr><td class='width120'><div class='nav-right'>" + item.quantity + "</div></td>";
    str += "<td class='cal-size'>" + item.pixi_title + "</td>";
    str += "<td class='width120'><div class='nav-right'>" + parseFloat(item.price).toFixed(2) + "</div></td>";
    str += "<td class='width120'><div class='nav-right'>" + parseFloat(item.subtotal).toFixed(2) + "</div></td></tr>";
  });
  return str;
}

// load list view if resFlg else return not found
function loadInvList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadInvList');

  // load listview
  if(resFlg) {
    if (data.length > 0) {
      $.each(data, function(index, item) {
        var amt = parseFloat(item.amount + item.get_fee).toFixed(2);

	// set invoice name
	var inv_name = (myPixiPage == 'received') ? item.seller.name : item.buyer.name; 

        // build pixi item string
	localUrl = 'data-inv-id="' + item.id + '"';
        var pic = getPixiPic(item.listings[0].photo_url, 'height:60px; width:60px;'); 
        var hdr = item.short_title + '<span class="nav-right">$' + amt + '</span>';
	var ftr = 'Invoice #' + item.id + ' - ' + inv_name + '<br />' + item.inv_dt + ' | ' + item.nice_status;
	item_str += build_list('inv-item', localUrl, pic, hdr, ftr); 
      });
    } 
    else {
      item_str = '<li class="center-wrapper">No invoices found.</li>'
    }
  }
  else {
    item_str = '<li class="center-wrapper">No invoices found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}
