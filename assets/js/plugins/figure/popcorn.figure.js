// PLUGIN: FIGURE

(function ( Popcorn ) {

/**
 * Figures popcorn plug-in
 * Shows an figure element
 * Options parameter will need a start, end, href, target and src.
 * Start is the time that you want this plug-in to execute
 * End is the time that you want this plug-in to stop executing
 * href is the url of the destination of a anchor - optional
 * Target is the id of the document element that the iframe needs to be attached to,
 * this target element must exist on the DOM
 * Src is the url of the image that you want to display
 * text is the overlayed text on the figure - optional
 *
 * @param {Object} options
 *
 * Example:
   var p = Popcorn('#video')
      .figure({
        start: 5, // seconds
        end: 15, // seconds
        href: 'http://www.drumbeat.org/',
        src: 'http://www.drumbeat.org/sites/default/files/domain-2/drumbeat_logo.png',
        text: 'DRUMBEAT',
        target: 'figurediv'
      } )
 *
 */

  let i=0;

  Popcorn.plugin( "figure", function (options) {

    return {
      _setup: function( options ) {
        // console.log(options);
      let figure = options.figure =  document.createElement( "figure" ),
          img = document.createElement( "img" ),
          target = document.getElementById( options.target );
      figure.appendChild(img);
      figure.style.display = "none";
      figure.classList.add("figure-plugin");
      figure.id = options.id || `popcorn-figure${i}`;
      i++;
      if (options.text) {
        let caption = document.createElement ("figcaption");
        caption.innerHTML = options.text;
        figure.appendChild(caption);
      }
        // options.anchor = document.createElement( "a" );
        // options.anchor.style.position = "relative";
        // options.anchor.style.textDecoration = "none";
        // options.anchor.style.display = "none";

        // add the widget's div to the target div.
        // if target is <video> or <audio>, create a container and routinely
        // update its size/position to be that of the media
        if ( target ) {
            target.appendChild( options.figure );
        }


        img.src = options.src;

        // options.toString = function() {
        //   var string = options.src || options._natives.manifest.options.src[ "default" ],
        //       match = string // .replace( /.*\//g, "" );
        //   return match.length ? match : string;
        // };
      },

      /**
       * @member figure
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
    start: function( event, options ) {
      // options.anchor.style.display = "inline";
      options.figure.style.display = "block";
      },
      /**
       * @member figure
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options.figure.style.display = "none";
      },
      _teardown: function( options ) {
        if ( options.trackedContainer ) {
          options.trackedContainer.destroy();
        }
        else if ( options.anchor.parentNode ) {
          options.figure.parentNode.removeChild( options.figure );
        }
      }
    };
  },
                  
  {
    about: {
      name: "Popcorn Figure Plugin",
      version: "0.1",
      author: "Scott Downe, Matt Price",
      website: "http://scottdowne.wordpress.com/"
    },
    options: {
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
      src: {
        elem: "input",
        type: "url",
        label: "Figure URL",
        "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png"
      },
      href: {
        elem: "input",
        type: "url",
        label: "Link",
        "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png",
        optional: true
      },
      id: {
        elem: "input",
        type: "text",
        label: "Figure ID",
        optional: true
      },
      target: "figure-container",
      text: {
        elem: "input",
        type: "text",
        label: "Caption",
        "default": "popcorn-container",
        optional: true
      }
    }
  });
})( Popcorn );
