// load list view if resFlg else return not found
function loadStoreList(data, resFlg) {
  var localUrl, item_str = '';
  var $container = '';

  if ($.mobile.activePage.attr("id") == 'listapp') {
    $container = $('#pxboard');
    item_str = '<ul id="pixi-list" data-role="listview">';
  }  
  else
    $container = $('#pixi-list');

  // load listview
  if (resFlg && data.length > 0) {
    $('#pxboard, #pixi-list').html('');
    $.each(data, function(index, item) {
      localUrl = 'data-url="/biz/' + item.url + '"';
      var pic = getPixiPic(item.photo_url, 'height:60px; width:60px;'); 
      var hdr = item.business_name;
      var ftr = 'Location: ' + item.site_name + ' | Pixis: ' + item.pixi_count;
      item_str += build_list('slrUrl', localUrl, pic, hdr, ftr); 
    });
  }
  else {
    item_str = '<li class="center-wrapper">No stores found.</li>'
  }
  
  if ($.mobile.activePage.attr("id") == 'listapp') {
    item_str = '</ul>'; 
  }  

  // append items
  $container.append(item_str).listview().listview('refresh');
}
