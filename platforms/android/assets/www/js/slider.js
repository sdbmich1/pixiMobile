
// process slider
function load_slider(cntl) {

  // picture slider
  if( $('.bxslider').length > 0 ) {
    console.log('in bxslider');

    $('.bxslider').bxSlider({
      slideMargin: 10,
      mode: 'fade'
    });

    // vertically center align images in slider
    $('.bxslider-inner').each(function(){
      var height_parent = $(this).css('height').replace('px', '') * 1;
      var height_child = $('div', $(this)).css('height').replace('px', '') * 1;
      var padding_top_child = $('div', $(this)).css('padding-top').replace('px', '') * 1;
      var padding_bottom_child = $('div', $(this)).css('padding-bottom').replace('px', '') * 1;
      var top_margin = (height_parent - (height_child + padding_top_child + padding_bottom_child)) / 2;
      $(this).html('<div style="height: ' + top_margin + 'px; width: 100%;"></div>' + $(this).html());
    });
  }
}

// load featured band carousel
function load_featured_slider(str) {
  var val = set_banner_slides();
  $('.featured').append(str).bxSlider({
      slideWidth: 100,
      slideMargin: 5,
      auto: false,
      pager: false,
      autoControls: false,
      mode: 'horizontal',
      swipeThreshold: 1
    });
}

// load status band carousel
function load_status_slider() {
  if($('.pxStatus').length > 0) {
    stat_slider = $('.pxStatus').bxSlider({
      minSlides: 3,
      maxSlides: 3,
      slideWidth: 100,
      slideMargin: 5,
      auto: false,
      pager: false,
      autoControls: false,
      mode: 'horizontal' });
  }
}      

// trigger lazy to load every image after the first one when slider is loaded
function scrollEverySecond() {
  setTimeout(function() {
    $(window).trigger("scroll");
    scrollEverySecond();
  }, 1000);
}

// set default item size based on window size
function set_banner_slides () {
  var width = $(window).width();
  var col = 5;

  if(width < 1200 && width >= 980) {
    col = 5;
  }
  else if(width < 980 && width >= 768) {
    col = 4;
  }
  else if(width < 768 && width >= 480) {
    col = 3;
  }
  else if(width < 480) {
    col = 2;
  }
  return col;
}

