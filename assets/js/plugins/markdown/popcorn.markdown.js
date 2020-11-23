// PLUGIN: Markdown

(function ( Popcorn ) {

  /**
   * Markdown Popcorn Plug-in
   *
   * Adds the ability to render Markdown using markdown-it on the fly rendering.
   * Largely copied from Mustache plugin by David Humphrey.
   *
   * In initial form, uses opinionated defaults consistent with student expectations in
   * https://github.com/DigitalHistory/advanced-topics. We therefore enable tables & use
   * `attrs`, `emoji`, and `footnote` plugins.
   *
   * @param {Object} options
   *
   * Required parameters: start, end, markdown, and target.
   *
   *   start: the time in seconds when the markdown template should be rendered
   *          in the target div.
   *
   *   end: the time in seconds when the rendered markdown template should be
   *        removed from the target div.
   *
   *   target: a String -- the target div's id.
   *
   *   text: the markdown text to be rendered using the markdown template.  Should be a string.
   *
   *
   * Example:
     var p = Popcorn('#video')

        // Example using strings.
        .markdown({
          start: 5, // seconds
          end:  15,  // seconds
          target: 'markdown',
          markdown: `## Header 2
Paragraph with **bold** _ital_ and :rocket: emoji`
        } )

  *
  */

  
  // I don't really understand what this external scope context is, but it seems I can
  // set some variables out here which will persist across all the markdown plugin instances
  // and that let works as well as var.
  // It also doesn't seem to pollute the global scope.
  let i = 0;
  
  Popcorn.plugin( "markdown" , function( options ){

    var markdown;

    Popcorn.getScript( "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/10.0.0/markdown-it.js",
                       function () {
                         Popcorn.getScript("https://cdn.jsdelivr.net/npm/markdown-it-attrs@2.3.2/markdown-it-attrs.browser.js");
                         Popcorn.getScript("https://cdn.jsdelivr.net/npm/markdown-it-footnote@3.0.1/dist/markdown-it-footnote.min.js");
                         Popcorn.getScript("https://cdn.jsdelivr.net/npm/markdown-it-emoji@1.4.0/dist/markdown-it-emoji.js");
                       });

    var target = document.getElementById( options.target );

    let newdiv;
    
    newdiv = document.createElement( "div" );
    newdiv.id = "markdowndiv" + i;
    newdiv.classList.add("markdown-plugin");
    newdiv.style.display = "none";
    i++;
    if (target)
    {target.appendChild( newdiv );}

    markdown = options.text || "" ;
    
    options.container = target || document.createElement( "div" );

    return {
      start: function( event, options ) {
        
        var interval = function() {

          if( !window.markdownitEmoji || !window.markdownitFootnote || !window.markdownItAttrs ) {
            // console.log ('markdownit tests fail');
            // console.log(window.markdownitEmoji);
            // console.log(window.markdownitFootnote);
            // console.log(window.markdownItAttrs);
            setTimeout( function() {
              interval();
            }, 100 );
          } else {
            // console.log("md should have all plugins loaded")
            let parser = window.markdownit('commonmark', {
              html: true,
              linkify: true});
            /* use footnote, attribute and emoji plugins */
            parser.use(window.markdownItAttrs);
            parser.use(window.markdownitFootnote);
            parser.use(window.markdownitEmoji);
            /* enable tables */
            parser.enable('table');
            
            let html = parser.render( markdown
                                       ).replace( /^\s*/mg, "" );
            newdiv.innerHTML = html;
            newdiv.style.display = "block";
          }
        };

        interval();

      },

      end: function( event, options ) {
        //newdiv.innerHTML = "";
        newdiv.style.display = "none";
      },
      _teardown: function( options ) {
        markdown = null;
      }
    };
  },
  {
    about: {
      name: "Popcorn Markdown Plugin",
      version: "0.1",
      author: "David Humphrey (@humphd), Matt Price (@titaniumbones)",
      website: "https://github.com/DigitalHistory"
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
      target: "markdown-container",
      text: {
        elem: "input",
        type: "text",
        label: "Markdown Text"
      }
    }
  });
})( Popcorn );
