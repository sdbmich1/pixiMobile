function loadCatList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadCatList');

  // Add "All" category to cancel previous setting
  var allImg = '<img src="">';
  item_str += build_list('pixi-cat', 'data-cat-id=""', allImg, 'All', '');

  // load listview
  if (resFlg && data.length > 0) {
    $.each(data, function(index, item) {
      localUrl = 'data-cat-id="' + item.id + '"';
      var pic = getPixiPic(item.pictures[0].photo_url, 'height:60px; width:60px;');
      var hdr = item.name_title;
      var ftr = '';
      item_str += build_list('pixi-cat', localUrl, pic, hdr, ftr);
    });
  }
  else {
    item_str = '<li class="center-wrapper">No categories found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}
