// checks ticket order form quantity fields to ensure selections are made prior to submission 
var $formID, $btnID, formError, formTxtForm, pmtForm, payForm, api_type; 
var api_key = "pk_test_t9yZPwXwlRx7NoOB7DtVhKF8";
var api_type = 'stripe';

// toggle credit card edit view
$(document).on('click', '#edit-card-btn', function(e) {
  $('#token').val('');
  $('.card-tbl, .card-dpl').toggle();
});
 
// process Stripe payment form for credit card payments
$(document).on('click', '#payForm, #cardForm', function () {
  var clickedBtnID = $(this).attr('id');
  $formID = clickedBtnID.match(/pay/i) ? $('#payment_form') : $('#card-acct-form');
  $btnID = clickedBtnID.match(/pay/i) ? $('#payForm') : $('#cardForm');
	
  // check card # to avoid resubmitting form twice
  if ($('#card_number').length > 0) {	  
    
    // process payment based on api type
    if(api_type == 'stripe') { StripeCard() } 
    if(api_type == 'balanced') { BalancedCard() } 

    return false 
  }
  else {
    var amt = parseFloat($('#amt').val());	
    if (amt == 0.0)
       	$formID.trigger("submit.rails");

    return true
  }
});  

// create token if credit card info is valid
function StripeCard() {
  uiLoading(true);
  var payToken = $('#token').val(); 
  Stripe.setPublishableKey(api_key);

  // disable form
  $('#payForm').attr('disabled', 'disabled');
    $btnID.attr('disabled', true);
  
  if (payToken.length > 0)  {
    console.log('StripeCard payToken = ' + payToken);
    setParamType();
  }
  else {
    // create token	
    Stripe.createToken({
      number: $('#card_number').val(),
      cvc: $('#card_code').val(),
      expMonth: $('#card_month').val(),
      expYear: $('#card_year').val()    
    }, stripeResponseHandler);
  }

  // prevent the form from submitting with the default action
  return false;
}

// process Stripe bank account form for ACH payments
$(document).on('click', '#bank-btn', function () {
  Stripe.setPublishableKey($('meta[name="stripe-key"]').attr('content'));  // get stripe key		

  // set form id
  $('#bank-btn').attr('disabled', true);
  $formID = $('#bank-acct-form');
  $btnID = $('#bank-btn');
	
  // check acct # to avoid resubmitting form twice
  if ($('#acct_number').length > 0) {	  
    processStripeAcct(); // process acct
    return false 
  }
  else {
    //$formID.trigger("submit.rails");
    return true
  }
});

// create token if bank account info is valid
function processStripeAcct() {
    uiLoading(true);
    $('#bank-acct-form').attr('disabled', true);
	
      Stripe.bankAccount.createToken({
	country: $('#bank_account_country_code').val(),
	currency: $('#bank_account_currency_type_code').val(),
        account_number: $('#acct_number').val(),
        routing_number: $('#routing_number').val()
      }, stripeResponseHandler);

    // prevent the form from submitting with the default action
    return false;
}

// used to toggle promo codes
$(document).on('click', '.promo-cd', function () {
  $(".promo-code").show();
});	

$(document).ready(function() {	
  if ($('#pmtForm').length == 0 || $('#buyTxtForm').length == 0) {
    payForm = $('#payForm');		
  } 
});

// process discount
$(document).on('click', '#discount_btn', function () {
  var cd = $('#promo_code').val();
  if (cd.length > 0) {
    var url = '/discount.js?promo_code=' + cd; 
    process_url(url);
   }
  return false;
});

// print page
$(document).on('click', '#print-btn', function () {
  printIt($('#printable').html());
  return false;
});

var win=null;
function printIt(printThis)
{
  win = window.open();
  self.focus();
  win.document.write(printThis);	
  win.print();
  win.close();	
}

// insert the token into the form so it gets submitted to the server
function set_token(response) {
  console.log('in set_token');
  $('#token').val(response.id);
  setParamType();
}

// handle credit card response
function stripeResponseHandler(status, response) {
  var stripeError = $('#data_error'); 
      
  if(status == 200) {
    uiLoading(true);
    stripeError.hide(300);
	  
    // insert the token
    set_token(response);
   }
  else {
    if(response.error.message == "An unexpected error has occurred. We have been notified of the problem.") {
      $btnID.attr('disabled', false);
	  
      // insert the token
      set_token(response);
    }
    else {
      $("#flash_notice").hide(300);
      stripeError.show(300).text(response.error.message);
      $btnID.attr('disabled', false);

      // scroll to top of page
      $('html, body').animate({scrollTop:0}, 100); 
      uiLoading(false);
    }
  }
    
  return false;
}

function setParamType() {
  if ($('txn-form').length > 0) {
    submitData('txn', buildTxnParams());
  }
  else {
    submitData('card', buildCardParams());
  }
}

function buildCardParams() {
  return {
    card_account: {
      card_number: $('#card_number').val(),
      card_code: $('#card_code').val(),
      zip: $('#postal_code').val(),
      expiration_month: $('#card_month').val(),
      expiration_year: $('#card_year').val(),
      default_flg: ($('#default_flg_checkbox').is(':checked') ? 'Y' : null),
      card_no: $('#card_no').val(),
      token: $('#token').val(),
      user_id: getUserID()
    }
  };
}
