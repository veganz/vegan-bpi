(function($) {
  'use strict';
  
  /* API Key for Bing Maps */
  var bingMapsApiKey = 'AtyTM5gnsQayzc_m7o3XvAmSDUpmRR7BMA0X1LjyuYaAYbc8q0tJOOFuKnfj0Utn', 
  
  /* get a list of locations based on one of either lat/lng coordinates or a postal code using the Bing Maps API */
  getLocations = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {}), 
    lat = settings.lat, 
    lng = settings.lng, 
    postalCode = settings.postalCode;
    
    if(lat && lng || postalCode) {
      $.ajax({
        dataType: 'jsonp', 
        url: 'http://dev.virtualearth.net/REST/v1/Locations/' + 
             (lat && lng ? lat + ',' + lng : 'US/' + postalCode), 
        data: 'o=json&key=' + bingMapsApiKey + '&jsonp=?', 
        success: function(response) {
          var resourceSet = response.resourceSets[0], 
          resources;
          
          if(resourceSet && resourceSet.resources && resourceSet.resources.length > 0) {
            resources = resourceSet.resources;
          }
          
          settings.callback(resources);
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
    /* give postal code field focus */ 
    $('.bpd-postal-code').focus();
    
    /* onload, attempt to automatically locate the user if geolocation is supported */
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(location) {
        /* only set location if the user hasn't already manually typed one in */
        if($('#bpd-postal-code').val() === '') {
          $('#bpd-postal-code').attr('disabled', 'disabled');
          
          getLocations({
            lat: location.coords.latitude, 
            lng: location.coords.longitude, 
            callback: function(locations) {
              var noLocation;
              
              if(!locations) {
                noLocation = true;
              }
              else {
                var location = locations[0], 
                address = location.address, 
                city, 
                stateProvince, 
                postalCode;
                
                if(!address) {
                  noLocation = true;
                }
                else {
                  city = address.locality;
                  stateProvince = address.adminDistrict;
                  postalCode = address.postalCode;
                  
                  if(!postalCode) {
                    noLocation = true;
                  }
                  else {
                    $('#bpd-postal-code').addClass('hidden');
                    $('#bpd-location-city').html((city ? (city + (stateProvince ? (', ' + stateProvince) : '')) : '') + postalCode).removeClass('hidden');
                  }
                }
              }
              
              if(noLocation) {
                $('#bpd-postal-code').removeAttr('disabled');
                
                /* TODO */
                /* issue #7: display an error if no results found */
              }
            }
          });
        }
      });
    }
    
    /* when postal code form is submitted, locate the user */
    $('.bpd-location-form').submit(function(e) {
      e.preventDefault();
      
      if($('.bpd-postal-code').val() === '') {
        /* TODO */
      }
      else {
        getLocations({
          postalCode: $('.bpd-postal-code').val(), 
          callback: function(locations) {
            var noLocation;
            
            if(!locations) {
              noLocation = true;
            }
            else {
              if(locations.length === 1) {
                var location = locations[0], 
                address = location.address, 
                city, 
                stateProvince, 
                postalCode;
                
                if(!address) {
                  noLocation = true;
                }
                else {
                  city = address.locality;
                  stateProvince = address.adminDistrict;
                  postalCode = address.postalCode;
                  
                  if(!postalCode) {
                    noLocation = true;
                  }
                  else {
                    $('#bpd-postal-code').addClass('hidden');
                    $('#bpd-location-city').html((city ? (city + (stateProvince ? (', ' + stateProvince) : '')) : '') + postalCode).removeClass('hidden');
                  }
                }
              }
              else {
                $('#bpd-postal-code').removeAttr('disabled');
                
                /* TODO */
                /* issue #6: display a picklist */
              }
            }
            
            if(noLocation) {
              $('#bpd-postal-code').removeAttr('disabled');
              
              /* TODO */
              /* issue #7: display an error if no results found */
            }
          }
        });
      }
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