var express = require( "express" );
var twitter = require( "twitter" );
var app = express();

var tokenList = [
  { name: "Consumer Key",        value: process.env.TWITTER_CONSUMER_KEY },
  { name: "Consumer Secret",     value: process.env.TWITTER_CONSUMER_SECRET },
  { name: "Access Token Key",    value: process.env.TWITTER_ACCESS_TOKEN_KEY },
  { name: "Access Token Secret", value: process.env.TWITTER_ACCESS_TOKEN_SECRET },
];

var port = 3000;
if( process.env.NODE_PORT !== void 0 ) {
  port = parseInt( process.env.NODE_PORT, 10 );
  if( isNaN( port ) ) {
    console.log( "[ERROR] Unrecognized NODE_PORT: " + process.env.NODE_PORT );
    process.exit();
  }
}

app.use( '/', express.static( 'public' ) );

tokenList.forEach( function( item ) {
  if( item.value === void 0 /* undefined */ ) {
    console.log( "[ERROR] " + item.name + " is undefined. exit." );
    process.exit();
  }
} );

app.listen( port );
console.log( "server is running on http://localhost:" + port + "/" );
