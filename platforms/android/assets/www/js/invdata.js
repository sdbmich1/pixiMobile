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
      comment = data.comment;
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

// process invoice page display
function loadInvPage(data, resFlg) {
  if (resFlg) {
    var pic_str = "height:45px; width:45px; border: 1px solid #ccc;";
    var inv_str = "<div class='mleft10'><table class='inv-descr'><tr><td>Invoice #: </td><td>" + data.id + "</td></tr><tr>"; 
    inv_str += "<td>Date: </td><td>" + data.inv_dt + "</td></tr><tr>"; 

    // display correct photo based on whether user is buyer or seller
    inv_str += "<td>From: </td><td class='v-align wdth50'>" + getPixiPic(data.seller.photo, pic_str)
        + "</td><td>" + data.seller.name + "</td></tr>";
    inv_str += "<tr><td>Bill To: </td><td class='v-align wdth50'>" + getPixiPic(data.buyer.photo, pic_str)
        + "</td><td>" + data.buyer.name + "</td>";
    inv_str += "</tr></table></div>";

    // set invoice details
    var tax = (data.sales_tax != undefined) ? parseFloat(data.sales_tax).toFixed(2) : 0.0;
    var ship = (data.ship_amt != undefined) ? parseFloat(data.ship_amt) : 0.0;
    var tax_total = (data.tax_total != undefined) ? parseFloat(data.tax_total) : 0.0;
    var fee = parseFloat(data.get_fee).toFixed(2);
    var total = parseFloat(data.get_fee + data.amount).toFixed(2);

    inv_str += "<div class='mleft10'><div class='control-group'><table class='mtop inv-tbl inv-descr'>"
      + "<th><div class='center-wrapper'>Qty</div></th><th><div class='center-wrapper'>Item</div></th>"
      + "<th><div class='center-wrapper'>Price</div></th><th><div class='center-wrapper'>Amount</div></th>"
      + loadInvRow(data)
      + "<tr class='sls-tax'><td></td><td><div class='nav-right'>Sales Tax</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax + "%</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax_total.toFixed(2) + "</div></td></tr>"
      + "<tr class='sls-tax'><td></td><td><div class='nav-right'>Shipping</div></td>"
      + "<td></td><td class='width120'><div class='nav-right'>" + ship.toFixed(2) + "</div></td></tr>"
      + "<tr class='v-align'><td></td><td class='img-valign mtop nav-right'>Fee</td>"
      + "<td><a href='#popupInfo' data-rel='popup' data-role='button' class='ui-icon-alt' data-inline='true' "
      + "data-transition='pop' data-icon='info' data-theme='a' data-iconpos='notext'>Learn more</a></td>"
      + "<td class='img-valign mtop nav-right'>" + fee + "</td></tr>"
      + "<tr><td></td><td><div class='nav-right'>Amount Due</div></td><td></td>"
      + "<td class='width120'><div class='order-total total-str nav-right'><h6>$" + total + "</h6></div></td></tr></table>";

    if (data.comment !== undefined) {
      inv_str += "<div class='mtop inv-descr control-label'>Comments: " + data.comment + "</div>";
    }
    inv_str += "</div><div class='nav-right'>"
     
    // if owned & unpaid display edit btns
    if (data.seller_id == getUserID()) {
      if (data.status == 'unpaid') {
        inv_str += "<table><tr><td><a href='#' data-inv-id='" + data.id + "' data-role='button' id='edit-inv-btn'"
          + " data-theme='b'>Edit</a></td><td><a href='#' data-role='button' data-inv-id='" + data.id 
	  + "' id='remove-inv-btn'>Remove</a></td><tr></table>";
      }
    }
    else {
      if (data.status == 'unpaid') {
        inv_str += "<a href='#' data-inv-id=" + data.id + " data-role='button' data-theme='d' id='pay-btn'>Pay</a>";
      }
    }
    inv_str += "</div></div>";
    $('#inv_details').append(inv_str).trigger("create");
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
	if(myPixiPage == 'received') {
	  var inv_name = item.seller.name; }
	else {
	  var inv_name = item.buyer.name; }

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
