(function($) {
  'use strict';
  
  /* given an address string, return a possible ZIP Code if one is found */
  var getZIPCodeFromAddress = function(addressString) {
    var address;
    
    if(addressString && $.trim(addressString) !== '') {
      address = $.trim(addressString);
    }
    
    if(!address) {
      throw new Error('getZIPCodeFromAddress() -> No address provided');
    }
    else {
      var possibleZIPCode;
      
      /* if nothing but a ZIP Code is provided, return it */
      if(!isNaN(address)) {
        if(address.length === 5) {
          possibleZIPCode = address;
        }
      }
      else {
        /* if a ZIP+4 is provided, return the first 5 digits */
        var addressSplitOnHypens = address.split('-');
        if(addressSplitOnHypens.length === 2 && !isNaN(addressSplitOnHypens[0]) && !isNaN(addressSplitOnHypens[1]) && addressSplitOnHypens[0].length === 5) {
          possibleZIPCode = addressSplitOnHypens[0];
        }
        
        /* for any other string, check the characters after the last space for a possible ZIP Code */
        var addressSplitOnSpaces = address.split(' ');
        if(addressSplitOnSpaces.length > 1) {
          var lastPieceOfString = addressSplitOnSpaces[addressSplitOnSpaces.length - 1];
          if(!isNaN(lastPieceOfString)) {
            possibleZIPCode = lastPieceOfString;
          }
          else {
            var lastPieceOfStringSplitOnHypens = lastPieceOfString.split('-');
            if(lastPieceOfStringSplitOnHypens.length === 2 && !isNaN(lastPieceOfStringSplitOnHypens[0]) && !isNaN(lastPieceOfStringSplitOnHypens[1]) && lastPieceOfStringSplitOnHypens[0].length === 5) {
              possibleZIPCode = lastPieceOfStringSplitOnHypens[0];
            }
          }
        }
      }
      
      return possibleZIPCode;
    }
  }, 
  
  /* API Key for Bing Maps */
  bingMapsApiKey = 'AtyTM5gnsQayzc_m7o3XvAmSDUpmRR7BMA0X1LjyuYaAYbc8q0tJOOFuKnfj0Utn', 
  
  /* given one of either lat/lng coordinates or an address string, return the request URL for the Bing Maps API */
  getBingMapsAPIUrl = function(options) {
    var settings = $.extend({}, options || {}), 
    baseUrl = 'http://dev.virtualearth.net/REST/v1/Locations', 
    lat = settings.lat, 
    lng = settings.lng, 
    address;
    
    if(settings.address && $.trim(settings.address) !== '') {
      address = $.trim(settings.address);
    }
    
    if(!((lat && lng) || address)) {
      throw new Error('getBingMapsAPIUrl() -> No lat/long or address provided');
    }
    else {
      if(lat && lng) {
        return baseUrl + '/' + lat + ',' + lng + '?o=json&key=' + bingMapsApiKey + '&jsonp=?';
      }
      
      if(address) {
        var possibleZIPCode = getZIPCodeFromAddress(address);
        
        return baseUrl + '?' + (possibleZIPCode ? ('countryRegion=US&postalCode=' + possibleZIPCode) : ('q=' + address)) + '&o=json&key=' + bingMapsApiKey + '&jsonp=?';
      }
    }
  }, 
  
  /* get a list of locations based on one of either lat/lng coordinates or an address string using the Bing Maps API */
  getLocations = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {}), 
    lat = settings.lat, 
    lng = settings.lng, 
    address, 
    requestUrl;
    
    if(settings.address && $.trim(settings.address) !== '') {
      address = $.trim(settings.address);
    }
    
    if(!((lat && lng) || address)) {
      throw new Error('getLocations() -> No lat/long or address provided');
    }
    else {
      requestUrl = getBingMapsAPIUrl({
        lat: lat, 
        lng: lng, 
        address: address
      });
      
      if(!requestUrl) {
        throw new Error('getLocations() -> requestUrl is undefined');
      }
      else {
        $.ajax({
          dataType: 'jsonp', 
          url: requestUrl, 
          success: function(response) {
            var resourceSet = response.resourceSets[0], 
            resources;
            
            if(resourceSet && resourceSet.resources && resourceSet.resources[0]) {
              $.each(resourceSet.resources, function() {
                if(this.address && this.address.CountryRegion && this.address.CountryRegion === 'United States') {
                  if(!resources) {
                    resources = [];
                  }
                  
                  resources.push(this);
                }
              });
            }
            
            settings.callback(resources);
          }
        });
      }
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
        if($('.bpd-postal-code').val() === '') {
          $('.bpd-postal-code').attr('disabled', 'disabled');
          
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
                    $('.bpd-postal-code').addClass('hidden');
                    $('.bpd-location-city').html((city ? (city + (stateProvince ? (', ' + stateProvince) : '') + ' ') : '') + postalCode);
                  }
                }
              }
              
              if(noLocation) {
                $('.bpd-postal-code').removeAttr('disabled');
                
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
          address: $('.bpd-postal-code').val(), 
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
                    $('.bpd-postal-code').addClass('hidden');
                    $('.bpd-location-city').html((city ? (city + (stateProvince ? (', ' + stateProvince) : '') + ' ') : '') + postalCode);
                  }
                }
              }
              else {
                $('.bpd-postal-code').removeAttr('disabled');
                
                /* TODO */
                /* issue #6: display a picklist */
              }
            }
            
            if(noLocation) {
              $('.bpd-postal-code').removeAttr('disabled');
              
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