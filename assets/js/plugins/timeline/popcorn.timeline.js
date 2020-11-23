// PLUGIN: Timeline
(function ( Popcorn ) {

  /**
     * timeline popcorn plug-in
     * Adds data associated with a certain time in the video, which creates a scrolling view of each item as the video progresses
     * Options parameter will need a start, target, title, and text
     * -Start is the time that you want this plug-in to execute
     * -End is the time that you want this plug-in to stop executing, tho for this plugin an end time may not be needed ( optional )
     * -Target is the id of the DOM element that you want the timeline to appear in. This element must be in the DOM
     * -Title is the title of the current timeline box
     * -Text is text is simply related text that will be displayed
     * -innerHTML gives the user the option to add things such as links, buttons and so on
     * -direction specifies whether the timeline will grow from the top or the bottom, receives input as "UP" or "DOWN"
     * @param {Object} options
     *
     * Example:
      var p = Popcorn("#video")
        .timeline( {
         start: 5, // seconds
         target: "timeline",
         title: "Seneca",
         text: "Welcome to seneca",
         innerHTML: "Click this link <a href='http://www.google.ca'>Google</a>"
      } )
    *
  */

  var i = 1;

  Popcorn.plugin( "timeline" , function( options ) {

    var target = document.getElementById( options.target ),
        contentDiv = document.createElement( "div" ),
        container,
        goingUp = true;
    return {

      _setup: function ( options ) {
        options.id = options.id || "timelineDiv" + i;
        if (!target) {
          target = document.querySelector('body').appendChild(document.createElement('div'));
          target.id = options.target;
        }
        container = target.querySelector(`#${options.id}`);

        if ( !container ) {
          container = document.createElement( "div" );
          target.appendChild ( container );
          container.style.width = "inherit";
          container.style.height = "inherit";
          container.style.overflow = "auto";
          container.id = options.id;
          container.classList.add("timeline-plugin");
        } 

        //  Default to up if options.direction is non-existant or not up or down
        options.direction = options.direction || "up";
        if ( options.direction.toLowerCase() === "down" ) {
          goingUp = false;
        }
 
        // if this isnt the first div added to the target div
        if( goingUp ){
          console.log('going up');
            // insert the current div before the previous div inserted
            container.insertBefore( contentDiv, container.firstChild );
          }
        else {

            container.appendChild( contentDiv );
        }
        contentDiv.style.display = "none";
        contentDiv.classList.add("timeline-plugin-item");

        options.innerHTML = options.innerHTML || "";

        contentDiv.innerHTML =`${options.title ?"<h3 >" + options.title + "</h3>" : ""}
${options.text? "<p>" + options.text + "</p>" : ""} ${options.innerHTML}`;


        // console.log(contentDiv.textContent);
        i++;

      },

    start: function( event, options ) {
        contentDiv.style.display = "block";

        if( options.direction === "down" ) {
          container.scrollTop = container.scrollHeight;
        }
      },

      end: function( event, options ) {
        contentDiv.style.display = "none";
      },

      _teardown: function( options ) {

        ( container && contentDiv ) && container.removeChild( contentDiv ) && !container.firstChild && target.removeChild( container );
      }
    };
  },
  {

    about: {
      name: "Popcorn Timeline Plugin",
      version: "0.1",
      author: "David Seifried @dcseifried",
      website: "dseifried.wordpress.com"
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
      target: "feed-container",
      title: {
        elem: "input",
        type: "text",
        label: "Title"
      },
      text: {
        elem: "input",
        type: "text",
        label: "Text"
      },
      innerHTML: {
        elem: "input",
        type: "text",
        label: "HTML Code",
        optional: true
      },
      direction: {
        elem: "select",
        options: [ "DOWN", "UP" ],
        label: "Direction",
        optional: true
      }
    }
  });

})( Popcorn );
