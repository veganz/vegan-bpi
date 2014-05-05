(function($) {
  var getLocationByLatLng = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {});
    
    $.ajax({
      dataType: 'jsonp', 
      url: 'http://dev.virtualearth.net/REST/v1/Locations/' + settings.lat + ',' + settings.lng, 
      data: 'o=json&key=AtyTM5gnsQayzc_m7o3XvAmSDUpmRR7BMA0X1LjyuYaAYbc8q0tJOOFuKnfj0Utn&jsonp=?', 
      success: function(response) {
        settings.callback(response.resourceSets[0].resources[0].address.locality);
      }
    });
  }, 
  
  getLocationByZIP = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {});
    
    $.ajax({
      dataType: 'jsonp', 
      url: 'http://dev.virtualearth.net/REST/v1/Locations/US/' + settings.zipCode, 
      data: 'o=json&key=AtyTM5gnsQayzc_m7o3XvAmSDUpmRR7BMA0X1LjyuYaAYbc8q0tJOOFuKnfj0Utn&jsonp=?', 
      success: function(response) {
        settings.callback(response.resourceSets[0].resources[0].address.locality);
      }
    });
  };
  
  /*
   * Homepage
   */
  
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(location) {
      getLocationByLatLng({
        lat: location.coords.latitude, 
        lng: location.coords.longitude, 
        callback: function(location) {
          if(location) {
            $('.bpd-postal-code').addClass('hidden');
            $('.bpd-location-city').html(location);
          }
        }
      });
    });
  }
  
  $('.bpd-postal-code').focus();
  
  $('.bpd-location-form').submit(function(e) {
    e.preventDefault();
    
    getLocationByZIP({
      zipCode: $('.bpd-postal-code').val(), 
      callback: function(location) {
        if(location) {
          $('.bpd-postal-code').addClass('hidden');
          $('.bpd-location-city').html(location);
        }
      }
    });
  });
  
  /*
   * Results
   */
  
  $('.bpd-location-change').click(function(e) {
    e.preventDefault();
  });
  
  $('.bpd-type-col .bpd-type').click(function(e) {
    e.preventDefault();
    
    if(!$(this).closest('.bpd-type-col').is('.active')) {
      $('.bpd-type-col.active').removeClass('active');
      $(this).closest('.bpd-type-col').addClass('active');
    }
  });
})(jQuery);