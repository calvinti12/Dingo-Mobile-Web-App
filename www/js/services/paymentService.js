/**
 * Payment Service.
 *
 */

dingo.services.factory('Payment', function() {

  return {

    started: false,

    init: function(){
      // Initiating Paypal SDK
      if(window.PayPalMobile){
        var clientIDs = {
          "PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
          "PayPalEnvironmentSandbox": "YOUR_SANDBOX_CLIENT_ID"
        };
        PayPalMobile.init(clientIDs, this.onPayPalMobileInit);
      }
    },

    onPayPalMobileInit: function(){
      var self = this;
      var config = new PayPalConfiguration({
        merchantName: "Dingo App Tickets",
        merchantPrivacyPolicyURL: "http://dingoapp.co.uk/policy",
        merchantUserAgreementURL: "http://dingoapp.co.uk/agreement"
      });
      // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
      PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", config, function(){
        self.started = true;
      });
    },

    makePayment: function(payment,onSuccesfulPayment,onUserCanceled){
      // PayPalPaymentDetails(subtotal, shipping, tax)
      var paymentDetails = new PayPalPaymentDetails(payment.amount, "0.00", "0.00");
      // PayPalPayment(amount, currency, shortDescription, intent, details) {
      var payment = new PayPalPayment(payment.amount, "GBP", payment.description, "Sale", paymentDetails);
      // create payment
      PayPalMobile.renderSinglePaymentUI(payment, onSuccesfulPayment, onUserCanceled);
    }


  };

});