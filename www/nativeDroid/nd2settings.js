$(function() {

  // Initialize nativeDroid2

  $.nd2({
    stats : {
      analyticsUA: null // Your UA-Code for Example: 'UA-123456-78'
    },
    advertising : {
      active : false, // true | false
      path : null, // Define where the Ad-Templates are: For example: "/examples/fragments/adsense/"
      extension : null // Define the Ad-Template content Extension (Most case: ".html" or ".php")
    }
  });


});
