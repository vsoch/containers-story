test( "Popcorn Markdown Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 4,
      count = 0,
      markdownDiv = document.querySelector( "#markdown-div" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "markdown" in popped, "markdown is a method of the popped instance" );
  plus();

  equal( markdownDiv.innerHTML, "", "initially, there is nothing inside the markdown-div" );
  plus();

  // Static strings
  popped.markdown({
    start: 0,
    end: 4,
    markdown: "# markdown - test 1/2",
    target: "markdown-div",
    dynamic: false
  })
  .markdown({
    start: 4,
    end: 5,
    markdown: "# markdown - test 2/2" ,
    target: "markdown-div",
    dynamic: false
  });

  function runTest( a, b ) {
    let thisInstance = markdownDiv.querySelector(`#markdowndiv${a}`)
    console.log(thisInstance.innerHTML);
    equal( thisInstance.innerHTML, "<h1>markdown - test " + (a + 1) + "/2<\/h1>\n", "Markdown template rendered" );
    plus();
  }

  popped.cue( 2.5, function() {
    runTest( 0 );
  })
  .cue( 4.5, function() {
    runTest( 1 );
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.markdown({});

  popped.volume( 0 );
  setTimeout (() => popped.play(), 3);
});
