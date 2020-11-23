// PLUGIN: LEAFLET
( function ( Popcorn ) {

  /**
   * leaflet popcorn plug-in
   * Adds a leaflet map and open map tiles (OpenStreetMap [default], Mapbox Satellite/Terrain,
   * or Stamen (toner/wateroclor/terrain))
   * 
   * Based on the openmap popcorn plug-in. No StreetView support
   *
   * Options parameter will need a start, end, target, type, zoom, lat and lng, and apikKy
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Type [optional] either: ROADMAP (OpenStreetMap), SATELLITE (Mapbox Satellite),  TERRAIN (Mapbox Outdoors), or COMIC (Mapbox Comic).
   *                          The Stamen custom map types can also be used (http://maps.stamen.com): STAMEN-TONER,
   *                          STAMEN-TERRAIN, or STAMEN-WATERCOLOR.
   * -Zoom [optional] defaults to 2
   * -Lat and Lng are the coordinates of the map if location is not named
   * -Location is a name of a place to center the map, geocoded to coordinates using Mapbox geocoding API
   * -Markers [optional] is an array of map marker objects, with the following properties:
   * --Icon is the URL of a map marker image
   * --Size [optional] is the radius in pixels of the scaled marker image (default is 14)
   * --Text [optional] is the HTML content of the map marker -- if your popcorn instance is named 'popped', use <script>popped.currentTime(10);</script> to control the video
   * --Lat and Lng are coordinates of the map marker if location is not specified
   * --Location is a name of a place for the map marker, geocoded to coordinates using mapbox
   *  Note: using location requires extra loading time; also failure to  specify one of lat/lng or location will
   * cause a JavaScript error.
   * - apiKey is your Mpabox API Key. This is required, and recommended to be set using
   *   Popcorn's `defaults` property
   * - fly is an object that moves the map from the initial location to a desired endpoint
   * -- endpoint is either a lat/long array or a string to be geocoded
   * -- wait is the length of time to wait after the start evnet fires
   * -- flightLength is the length of time ti take moving the map
   * @param {Object} options
   *
   * Example:
     var p = Popcorn( '#video' )
        .leaflet({
          start: 5,
          end: 15,
          type: 'ROADMAP',
          target: 'map',
          lat: 43.665429,
          lng: -79.403323
        })
   *
   */

  //console.log(options);
  var newdiv, persistentmap , persistentFlyEndpoint,
      i = 1;

  function toggle( container, display ) {
    if ( container.map ) {
      container.map.div.style.display = display;
      return;
    }

    setTimeout(function() {
      toggle( container, display );
    }, 10 );
  }

  function flyMap (map, flyOptions) {
    // console.log(flyOptions);
    setTimeout ( function () {
     map.panTo(flyOptions.endpoint, {animate: true, duration: flyOptions.flightLength});
    }, flyOptions.wait * 1000);
  }
  
  Popcorn.plugin( "leaflet", function( options ){
    var newdiv,
        centerlonlat,
        projection,
        displayProjection,
        pointLayer,
        selectControl,
        popup,
        isGeoReady,
        target = document.getElementById( options.target );

    // create a new div within the target div
    // this is later passed on to the maps api
    newdiv = document.createElement( "div" );
    newdiv.style.display = "none";
    newdiv.id = "leafletdiv" + i;
    newdiv.classList.add("leaflet-plugin");
    newdiv.style.width = "100%";
    newdiv.style.height = "100%";
    i++;

    if (target)
    {target.appendChild( newdiv );}
    
    var center;


    return {
      /**
       * @member leaflet
       * The setup function will be executed when the plug-in is instantiated
       */
      _setup: async function( options ) {
        // grab the leafvar css, we need it!
        var head = document.querySelector('head');
        var link = document.createElement('link');
        link.rel = 'stylesheet';  
        link.type = 'text/css'; 
        link.href = "https://unpkg.com/leaflet@1.5.1/dist/leaflet.css";
        // insert leaflet api script once
        if ( !window.L ) {
          head.appendChild(link);
          Popcorn.getScript( "https://unpkg.com/leaflet@1.5.1/dist/leaflet.js" , function() {
              console.log('empty callback');
            // insert jquery -- not sure why I need this though!
            //  Popcorn.getScript( "https://code.jquery.com/jquery-3.4.1.min.js" );
          } );
        }

        gc = async function( location ) {
          let point;
          let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?limit=1&access_token=${options.apiKey}`;
          return await fetch (url)
            .then ( (response) => response.json() )
            .then ( (json) => {let c = json.features[0].center;  return L.latLng([ c[1], c[0] ]); } );
        };

        // callback function fires when the script is run
        isGeoReady = async function() {
          if ( ! ( window.L  ) ) {
            setTimeout(function() {
              isGeoReady();
            }, 50);
          } else {
            if ( options.location ) {
              center =  await gc(options.location);
            } else {
              options.lat = options.lat || 51;
              options.lng = options.lng || -1.5;
              center = L.latLng( options.lat, options.lng );
            }
            // console.log ('center is ' + center + options.location || '');

            persistentmap = options.map = L.map(newdiv).setView(center, options.zoom || 12);

            // persistentmap ? console.log('pmap exists') : console.log ('pmap does NOT exist');
            options.type = options.type || "ROADMAP";// XXX: 
            switch( options.type ) {
            case "SATELLITE" :
              L.tileLayer(`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGl0YW5pdW1ib25lcyIsImEiOiJjazF0bTdlNXQwM3gxM2hwbXY0bWtiamM3In0.FFPm7UIuj_b15xnd7wOQig`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              })
                .addTo(options.map);
              // console.log(options.map);
              break;
            case "TERRAIN":
              // add terrain map ( USGS )
              L.tileLayer(`https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGl0YW5pdW1ib25lcyIsImEiOiJjazF0bTdlNXQwM3gxM2hwbXY0bWtiamM3In0.FFPm7UIuj_b15xnd7wOQig`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              })
                .addTo(options.map);
              break;
            case "STAMEN-TONER":
             L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	        subdomains: 'abcd',
	        minZoom: 0,
	        maxZoom: 20,
	        ext: 'png'
              })
                .addTo(options.map);
                break;
            case "STAMEN-WATERCOLOR":
              L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}{r}.{ext}', {
	        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	        subdomains: 'abcd',
	        minZoom: 0,
	        maxZoom: 20,
	        ext: 'png'
              })
              // L.tileLayer(`https://api.mapbox.com/v4/mapbox.comic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGl0YW5pdW1ib25lcyIsImEiOiJjazF0bTdlNXQwM3gxM2hwbXY0bWtiamM3In0.FFPm7UIuj_b15xnd7wOQig`, {
              //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              // })
                .addTo(options.map);
              break;
            case "STAMEN-TERRAIN":
              console.log("st terrain")
              L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	        subdomains: 'abcd',
	        minZoom: 0,
	        maxZoom: 20,
	        ext: 'png'
              })
                .addTo(options.map);
              break;
            case "COMIC":
              L.tileLayer(`https://api.mapbox.com/v4/mapbox.comic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGl0YW5pdW1ib25lcyIsImEiOiJjazF0bTdlNXQwM3gxM2hwbXY0bWtiamM3In0.FFPm7UIuj_b15xnd7wOQig`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              })
                .addTo(options.map);
  
            default: /* case "ROADMAP": */
                // add OpenStreetMap layer
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(options.map);
                break;
            }
            if (options.fly && options.fly.endpoint ) {
              switch (typeof (options.fly.endpoint)) {
              case "string":
                persistentFlyEndpoint = await gc(options.fly.endpoint);
                break;
              case "array":
                persistentFlyEndpoint = options.fly.endpoint;
                break;
              }
            }

            
            if ( options.map ) {
              options.map.div = newdiv;
            }
          }
        };

        await isGeoReady();

        var isReady = async function() {
          // wait until OpenLayers has been loaded, and the start function is run, before adding map
          if ( !options.map ) {
            setTimeout(function() {
              isReady();
            }, 13 );
          } else {

            // default zoom is 2
            options.zoom = options.zoom || 2;

            // make sure options.zoom is a number
            if ( options.zoom && typeof options.zoom !== "number" ) {
              options.zoom = +options.zoom;
            }

            // reset the location and zoom just in case the user played with the map
            options.map.setView( center, options.zoom );
            if ( options.markers )  {

              for (var m of options.markers) {
                var o;
                if (m.location) {
                  o = L.marker(await gc(m.location)).addTo(options.map);
                  if (m.text) o.bindPopup(m.text);
                } else if (m.lat && m.lng) {
                  o = L.marker([m.lat, m.lng]).addTo(options.map);
                  if (m.text) o.bindPopup(m.text);
                } else {console.log ("marker is missing lat/lng and location, unable to add")}
              }
              
            }
          }
          //persistentmap ? console.log('pmap exists') : console.log ('pmap does NOT exist');

        };

        await isReady();
      },

      /**
       * @member leaflet
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ) {
        //persistentmap ? console.log('pmap exists') : console.log ('pmap does NOT exist');

        toggle( options, "block" );
        if (options.fly) {
          //console.log (persistentmap)
          if (persistentFlyEndpoint) {options.fly.endpoint = persistentFlyEndpoint}
          flyMap (persistentmap, options.fly);
        }
      },
        /**
         * @member leaflet
         * The end function will be executed when the currentTime
         * of the video reaches the end time provided by the
         * options variable
         */
        end: function( event, options ) {
          toggle( options, "none" );
      },

      _teardown: function( options ) {

        target && target.removeChild( newdiv );
        newdiv = map = centerlonlat = projection = displayProjection = pointLayer = selectControl = popup = null;
      }
    };
  },
  {
    about:{
      name: "Popcorn Leaflet Plugin",
      version: "0.1",
      author: "@mapmeld, @titaniumbones",
      website: "https://digitalhistory.github.io"
    },
    options:{
      start: {
        elem: "input",
        type: "number",
        label: "Start"
      },
      end: {
        elem: "input",
        type: "number",
        label: "End"
      },
      target: "map-container",
      type: {
        elem: "select",
        options: [ "ROADMAP", "SATELLITE", "TERRAIN" ],
        label: "Map Type",
        optional: true
      },
      zoom: {
        elem: "input",
        type: "number",
        label: "Zoom",
        "default": 2
      },
      lat: {
        elem: "input",
        type: "text",
        label: "Lat",
        optional: true
      },
      lng: {
        elem: "input",
        type: "text",
        label: "Lng",
        optional: true
      },
      location: {
        elem: "input",
        type: "text",
        label: "Location",
        "default": "Toronto, Ontario, Canada"
      },
      markers: {
        elem: "input",
        type: "text",
        label: "List Markers",
        optional: true
      },
      apiKey: {
        elem: "input",
        type: "text",
        label: "ApiKey",
        optional: false
      }
    }
  });
}) ( Popcorn );
