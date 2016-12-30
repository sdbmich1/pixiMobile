function loadPromoList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, result, item_str = '';
  $('#pixi-list, #pxboard').html('');
  resFlg = resFlg || true;
  console.log('in promolist');

  // load listview
  if (isDefined(data) && resFlg) {
    if (isDefined(data.promo) && data.promo.length > 0) {
      $.each(data.promo, function(index, item) {
        item_str += load_promo_item(item.promo_code);
      });
    }
    else {
      $.each(data, function(index, item) {
        item_str += load_promo_item(item);
      });
    }
  }
  else {
    item_str = '<li class="center-wrapper">No promos found.</li>';
  }

  // append items
  $container.append(item_str).listview('refresh');
}

function load_promo_item(item) {
  var localUrl, result, item_str = '';
  localUrl = 'data-promo-id="' + item.id + '"';
  var pic = getPixiPic(item.seller_photo, 'height:60px; width:60px;');
  var hdr = item.promo_name;
  var ftr = item.seller_name + '<br/>' + $.trim(item.description).substring(0, 40).trim(this) + '...';
  var item_str = build_list('promo-item', localUrl, pic, hdr, ftr);
  return item_str;
}


// loop to check if seller exists in selected list
function isSelected(data, sid) {
  var flg = false;
  if(isDefined(data) && isDefined(data.active_promo_codes) && data.active_promo_codes.length > 0) {
    $.each(data.active_promo_codes, function(index, item) {
      if(item.id == sid) {
	flg = true;
      }
    });
  }
  return flg;
}

function loadPromoPage(data, resFlg) {
  var end_date = new Date(data.end_date);
  var start_time, end_time;
  var str = '';
  var sid = data.id;

  // load title
  showPixiTitle(data.promo_name);

  // load seller
  loadSellerTop(data.seller_name, data.user.url, data.seller_photo, data.user.rating, data.user.pixi_count);

  str += "</div>";  
  str += sectionHeader('Description') + "<div class='inv-descr'>" + data.description + "<br /><br />";
  str += show_features('End Date', parseDate(data.end_date));

  if (isDefined(data.start_time)) {
    start_time = new Date(data.start_time);
    str += show_features('Start Time', parseTime(start_time));
  }

  if (isDefined(data.end_time)) {
    end_time = new Date(data.end_time);
    str += show_features('End Time', parseTime(end_time));
  }
  str += '</div><br /><div id="pc-btn" class="mtop mbot center-wrapper">';
  str += toggle_promo_btn(sid, isSelected(usr, sid)) + '</div>';

  // load details
  $('#pixi-details').append(str).trigger("create");
  uiLoading(false);  // toggle spinner
}

function toggle_promo_btn(sid, flg) {
  var btitle = 'Save';
  var bname = 'save-promo-btn';
  var btype = 'b';

  if (flg) {
    btitle = 'Remove';  
    bname = 'remove-promo-btn'; 
    btype ='d';
  }
  return showButton('data-promo-id', sid, btitle, btype, bname,'width120','true');
}
