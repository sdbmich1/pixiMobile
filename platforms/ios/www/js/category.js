function loadCatList(data) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';
  console.log('in loadCatList');

  // load listview
  if (data.length > 0) {
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
