test( "Popcorn wikipedia Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 13,
      count = 0,
      theArticle = document.getElementById( "wikidiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "wikipedia" in popped, "wikipedia is a method of the popped instance" );
  plus();

  equal( theArticle.innerHTML, "", "initially, there is nothing in the wikidiv" );
  plus();

  popped.wikipedia({
      start: 1,
      end: 3,
      src: "http://en.wikipedia.org/wiki/Cape_Town",
      title: "this is an article",
      target: "wikidiv",
      paragraphs: 4
    })
    .wikipedia({
      start: 4,
      end: 5,
      src: "http://en.wikipedia.org/wiki/S%C3%A3o_Paulo",
      target: "wikidiv",
      paragraphs: 5
    })
    .wikipedia({
      start: 2,
      end: 4,
      src: "http://en.wikipedia.org/wiki/Bunny",
      title: "This is an article about bunnies",
      target: "wikidiv",
      paragraphs: 20
    })
    .volume( 0 )
    .play();

  popped.cue( 2, function() {
    let thisInstance = theArticle.querySelector('div');
    console.log("starting test 1");
    console.log(thisInstance);
    notEqual( thisInstance.innerHTML, "", "wikidiv now contains information" );
    plus();
    equal( thisInstance.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    equal( thisInstance.querySelector('h1 a').innerHTML, "this is an article", "wikidiv has the right title" );
    plus();
    notEqual( thisInstance.querySelector('div.mw-parser-output').innerHTML, "", "wikidiv has some content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equal( thisInstance.querySelectorAll('div.mw-parser-output p').length, 4, "wikidiv contains 4 paragraphs" );
    plus();
  });

  popped.cue( 3, function() {
    equal( theArticle.childElementCount, 1, "first wikipedia article was cleared properly" );
    plus();
  });

  popped.cue( 4, function() {
    let thisInstance = theArticle.querySelector('#wikidiv2');
    notEqual( thisInstance.innerHTML, "", "wikidiv2 now contains information" );
    plus();
    equal( thisInstance.childElementCount, 2, "wikidiv2 now contains two child elements" );
    plus();
    notEqual( thisInstance.querySelector('div.mw-parser-output').innerHTML, "", "wikidiv has some content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equal( thisInstance.querySelectorAll('div.mw-parser-output p').length, 20, "wikidiv contains 43 words" );
    plus();
  });

  popped.cue( 6, function() {
    popped.pause().removeTrackEvent( popped.data.trackEvents.byStart[ 4 ]._id );
    equal( theArticle.innerHTML, "", "wikidiv is now empty" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.wikipedia({});
});

asyncTest( "Overriding default toString", 2, function() {
  var p = Popcorn( "#video" ),
      srcText = "http://en.wikipedia.org/wiki/Jungle",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.wikipedia({
    src: srcText
  });
  testLastEvent( srcText, "Custom text displayed with toString" );

  p.wikipedia({});
  testLastEvent( "http://en.wikipedia.org/wiki/Cat", "Custom text displayed with toString using default" );

  start();
});
