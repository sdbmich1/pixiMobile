function loadCatList(data, res) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  $('#pixi-list, #pxboard').html('');
  res = res || true;
  var list = (data !== undefined && data.categories.length > 0) ? data.categories : data;

  // load listview
  if (list.length > 0) {
    $.each(list, function(index, item) {
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
