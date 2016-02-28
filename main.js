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

app.get( '/friends', function( req, res ) {
  client.get('friends/ids', {screen_name: "@rmn_e", count: 100}, function(error, result, response){
    var userIdList = result.ids
    var allNum = userIdList.length;
    var finishedNum = 0;
    var succeededNum = 0;
    var avgTimeList = new Array( allNum );
    var stop = false;

    for( var i = 0; i < allNum; i++ ) {
      ( function ( i ) {
        getAverageIntervalByUser( userIdList[ i ], function( tStatus, avgDiff) {
          if( stop ) return;
          if( tStatus === "success" ) {
            avgTimeList[ i ] = { id: userIdList[ i ], average: avgDiff };
            succeededNum++;
          } else if( tStatus === "ratelimit"  ) {
            console.log( "Rate Limit Exceeded!" );
            stop = true;
            return;
          } else if( tStatus === "error" ) {
            // 鍵垢などの理由で取得失敗
            console.log( "取得失敗: " + userIdList[ i ] );
          }
          console.log( tStatus + " " + i + ": " + avgDiff );
          if( ++finishedNum === allNum ) {
            avgTimeList.sort( function( a, b ) {
              return b.average - a.average; // 降順ソート
            } );
            console.log( result ); console.log( avgTimeList );
          }
        } );
      } ) ( i ); 
    }
    console.log( "Tweets:" + JSON.stringify( result ));
    console.log( "Error:" + JSON.stringify(error ));
  });
  res.send( "フォローしているユーザ一覧を取得中, しばらくお待ちください" );
} );


function getAverageIntervalByUser( userId, callBack ) {
  client.get('statuses/user_timeline', {user_id: userId }, function(error, result, response) {
    if( error === null ) {
      console.log( "ENTER with " + userId );

      var postedTimeDiffList = result.map( function( tweet ) {
        return new Date( tweet.created_at ).getTime() / 1000;
      } ).map( function( cur, idx, array ) {
        if( idx === array.length - 1 ) { return void 0; }
        return cur - array[ idx + 1 ];
      } );

      postedTimeDiffList.pop();

      var len = postedTimeDiffList.length;

      var avgDiff = postedTimeDiffList.reduce( function( prev, cur ) {
        return prev + cur;
      } ) / len;

      console.log( "average:" + avgDiff + "[sec]" );
      callBack( "success", avgDiff );
    } else {

      if( error[ 0 ].code === 88 ) {
        callBack( "ratelimit" );
      } else {
        callBack( "error" );
      }
    }
  } );
}

app.listen( port );
console.log( "server is running on http://localhost:" + port + "/" );


