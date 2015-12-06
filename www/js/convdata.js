
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
	var cnt = '<div class="ui-li-count">' + item.posts_count + '</div>';
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
  $container.append(item_str).listview('refresh');
}

function send_msg(item) {
  var item_str = '';
	
  // render post form if user
  if(getUserID() == item.recipient_id) {
    item_str += "<form id='post-frm' method='post' data-ajax='false'>" 
      + '<div id="notice" style="display:none"></div><div id="form_errors"></div>'
      + "<div class='clear-all'><table><tr><td class='cal-size'><div data-role='fieldcontain' class='ui-hide-label'>"
      + "<input name='content' id='reply_content' class='slide-menu' placeholder='Type reply message...' data-theme='a' /></div></td>"
      + "<td><input type='submit' value='Send' data-theme='b' data-inline='true' id='reply-btn' data-mini='true'></td></tr></table>"
      + "<input type='hidden' name='user_id' id='user_id' value='" + item.recipient_id + "' />"
      + "<input type='hidden' name='pixi_id' id='pixi_id' value='" + item.pixi_id + "' />"
      + "<input type='hidden' name='recipient_id' id='recipient_id' value='" + item.user_id + "' /></div></form>";
  }
  return item_str;
}

