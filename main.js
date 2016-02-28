var express = require( "express" );
var Twitter = require( "twitter" );
var app = express();

var tokenList = [
  { name: "Consumer Key",        value: process.env.TWITTER_CONSUMER_KEY },
  { name: "Consumer Secret",     value: process.env.TWITTER_CONSUMER_SECRET },
  { name: "Access Token Key",    value: process.env.TWITTER_ACCESS_TOKEN_KEY },
  { name: "Access Token Secret", value: process.env.TWITTER_ACCESS_TOKEN_SECRET },
];

tokenList.forEach( function( item ) {
  if( item.value === void 0 /* undefined */ ) {
    console.log( "[ERROR] " + item.name + " is undefined. exit." );
    process.exit();
  }
} );

var client = new Twitter( {
  consumer_key:       process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:    process.env.TWITTER_CONSUMER_SECRET,
  access_token_key:    process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
} );

var port = 3000;

if( process.env.NODE_PORT !== void 0 ) {
  port = parseInt( process.env.NODE_PORT, 10 );
  if( isNaN( port ) ) {
    console.log( "[ERROR] Unrecognized NODE_PORT: " + process.env.NODE_PORT );
    process.exit();
  }
}

app.use( '/', express.static( 'public' ) );

app.get( '/test', function( req, res ) {
  client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response){
    console.log( "Tweets:" + JSON.stringify( tweets ));
    console.log( "Error:" + JSON.stringify(error ));
  });
  res.send( "Hello, World!" );
} );


app.listen( port );
console.log( "server is running on http://localhost:" + port + "/" );


