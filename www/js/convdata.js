
// open post page
function loadPosts(data, resFlg) {
  var $container = $('#pixi-list');
  var item_str = ''
  console.log('in loadPosts...');

  // load listview
  if(resFlg) {
    if (data.length > 0) {
      $.each(data, function(index, item) {
        var post_dt = $.timeago(item.create_dt); // set post dt

        // display correct photo based on whether user is sender or recipient
        if(getUserID() == item.user_id) {
          var img = item.recipient.photo;
	  var name = item.recipient_name;
        }
        else {
          var img = item.user.photo;
          var name = item.sender_name;
        }

        // build pixi item string
	localUrl = 'data-conv-id="' + item.id + '"';
        var pic = getPixiPic(img, 'height:60px; width:60px;');
        var hdr = item.pixi_title; 
	var ftr = name + ' | Posted ' + post_dt;
	var cnt = '<div class="ui-li-count">' + item.active_posts_count + '</div>';
	item_str += build_list('conv-item', localUrl, pic, hdr, ftr, cnt); 
      });
    }
    else {
      item_str = '<div class="center-wrapper">No messages found.</div>'
    }
  }
  else {
    item_str = '<div class="center-wrapper">No messages found.</div>'
  }

  // render content
  $container.empty().append(item_str).listview('refresh');
}

function send_msg(data) {
  var img = (getUserID() === data.user_id) ? data.user.photo : data.recipient.photo;
  return "<form id='post-frm' method='post' data-ajax='false'>" 
       + '<div id="notice" style="display:none"></div>'
       + '<div id="form_errors"></div>'
       + "<div class='clear-all'></div><br>"
       + "<hr class='neg-top'>"
       + "<table>"
       +   "<tr>"
       +     "<td>"
       +       getPixiPic(img, 'height:60px; width:60px; margin-left:-6px;')
       +     "</td>"
       +     "<td class='cal-size'>"
       +       "<div data-role='fieldcontain' class='ui-hide-label'>"
       +         "<input name='content' id='reply_content'"
       +          "placeholder='Type reply message...' data-theme='a' />"
       +       "</div>"
       +     "</td>"
       +   "</tr>"
       + "</table>"
       + "<div class='nav-right'><input type='submit' value='Send' data-theme='d'"
       + " data-inline='true' id='reply-btn' class='nav-right' data-mini='true'"
       + " data-conv-id=" + data.id + "></div>"
       + "<input type='hidden' name='user_id' id='user_id' value='"
       +   data.user_id + "' />"
       + "<input type='hidden' name='pixi_id' id='pixi_id' value='"
       +   data.pixi_id + "' />"
       + "<input type='hidden' name='recipient_id' id='recipient_id' value='"
       +   data.recipient_id + "' />"
       + "</form>"
}

// open post page
function loadConvPage(data, resFlg) {
  console.log('in loadConvPage...');

  // set page headers
  var pic = getPixiPic(data.listing.photo_url, 'height:60px; width:60px;', 'smallImage');
  var isSender = getUserID() === data.sender_id;
  var str = '<table><tr><td>' + pic + "</td><td><span class='mleft10 pstr'>" + data.pixi_title + "</span></td></tr></table><div style='text-align:right;'>";

  var button_str = "<a href='#' data-inv-id=" + data.invoice_id + " data-role='button'" + " data-theme='a' id='conv-inv-btn' data-inline='true' data-mini='true'>";
  if (isSender) {
    if (data['sender_can_bill?'] || data['sender_due_invoice?']) {
      str += button_str + (data['sender_can_bill?'] ? 'Bill' : 'Pay') + "</a>";
    }
  } else {
    if (data['recipient_can_bill?'] || data['recipient_due_invoice?']) {
      str += button_str + (data['recipient_can_bill?'] ? 'Bill' : 'Pay') + "</a>";
    }
  }

  str += "<a href='#' data-conv-id=" + data.id + " data-role='button'" +
           " data-theme='b' id='conv-del-btn' data-mini='true' data-inline='true'>Delete</a></div>";

  $('#conv-top').empty().append(str).trigger('create');

  // load listview
  var item_str = '<div data-role="collapsible-set" data-inset="false">';
  if (resFlg) {
    $.each(data.get_posts, function(index, item) {
      var img = item.user.photo;

      // build conversation string
      var pic = getPixiPic(img, 'height:60px; width:60px;');
      var hdr = item.sender_name;
      var hdr2 = parseDate(item.created_at);
      var preview = item.content;
      var delbtn = "<a href='#' data-post-id=" + item.id
                  + " data-role='button' data-theme='b' id='del-post-btn' data-mini='true'"
                  + " data-inline='true' class='nav-right collapsible-header-link'>Delete</a>";
      var ftr = item.content + delbtn;
      item_str += buildCollapsibleList(pic, hdr, hdr2, preview, ftr, item.id);
    });
    item_str += '</div>';
  } else {
    item_str = '<div class="center-wrapper">No messages found.</div>';
  }

  // render content
  $('#conv-bot').empty().append(item_str).append(send_msg(data)).trigger('create');
  $('#reply_content').parent().attr('style', 'border:1px solid gray;')
  uiLoading(false);
}

function parseDate(date) {
  var yearMonthDay = date.split('T')[0].split('-');
  return parseInt(yearMonthDay[1], 10) + '/' + parseInt(yearMonthDay[2], 10) + '/' + yearMonthDay[0].substring(2, 4);
}
