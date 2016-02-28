var express = require( "express" );
var twitter = require( "twitter" );
var app = express();

var token = [
  { name: "Consumer Key",        value: process.env.TWITTER_CONSUMER_KEY },
  { name: "Consumer Secret",     value: process.env.TWITTER_CONSUMER_SECRET },
  { name: "Access Token Key",    value: process.env.TWITTER_ACCESS_TOKEN_KEY },
  { name: "Access Token Secret", value: process.env.TWITTER_ACCESS_TOKEN_SECRET },
];

app.get( '/', function( req, res ) {
  res.send( "Hello, World!" );
} );

token.forEach( function( item ) {
  if( item.value === void 0 /* undefined */ ) {
    console.log( "[ERROR] " + item.name + " is undefined. exit." );
    process.exit();
  }
} );

app.listen(3000);
console.log( "server is running on http://localhost:3000/" );
