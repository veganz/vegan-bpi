(function($) {
  /* get a location based on one of either lat/lng coordinates or a postal code using the Bing Maps API */
  var getLocation = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {}), 
    lat = settings.lat, 
    lng = settings.lng, 
    postalCode = settings.postalCode, 
    requestUrl;
    
    if(lat && lng || postalCode) {
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://dev.virtualearth.net/REST/v1/Locations/' + 
             (lat && lng ? lat + ',' + lng : 'US/' + postalCode), 
        data: 'o=json&key=AtyTM5gnsQayzc_m7o3XvAmSDUpmRR7BMA0X1LjyuYaAYbc8q0tJOOFuKnfj0Utn&jsonp=?', 
        success: function(response) {
          settings.callback(response.resourceSets[0].resources[0].address.locality);
        }
      });
    }
    else {
      throw new Error('No lat/long or ZIP Code provided.');
    }
  };
  
  /*
   * Homepage
   */
  
  if($('body').is('.home')) {
    /* onload, attempt to automatically locate the user */
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(location) {
        getLocation({
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
    
    /* give postal code field focus if geolocation is unsuccessful */ 
    $('.bpd-postal-code').focus();
    
    /* when postal code form is submitted, locate the user */
    $('.bpd-location-form').submit(function(e) {
      e.preventDefault();
      
      getLocation({
        postalCode: $('.bpd-postal-code').val(), 
        callback: function(location) {
          if(location) {
            $('.bpd-postal-code').addClass('hidden');
            $('.bpd-location-city').html(location);
          }
        }
      });
    });
  }
  
  /*
   * All Pages but Homepage
   */
  
  else {
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
  }
})(jQuery);