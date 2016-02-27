// load list view if resFlg else return not found
function loadStoreList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadStoreList');

  // load listview
  if (resFlg && data.length > 0) {
    $.each(data, function(index, item) {
      localUrl = 'data-url="' + item.url + '"';
      var pic = getPixiPic(item.photo, 'height:60px; width:60px;'); 
      var hdr = item.business_name;
      var ftr = 'Location: ' + item.site_name + ' | Pixis: ' + item.pixi_count;
      item_str += build_list('slrUrl', localUrl, pic, hdr, ftr); 
    });
  }
  else {
    item_str = '<li class="center-wrapper">No stores found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}
