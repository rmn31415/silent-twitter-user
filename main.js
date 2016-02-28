var express = require( "express" );
var cookieParser = require( "cookie-parser" );
var session = require( "express-session" );
var Twitter = require( "twitter" );
var OAuth = require( "oauth" ).OAuth;
var app = express();
var requestId = 0;

app.use( cookieParser() );
app.use( session( {
  saveUninitialized: false,
  secret: 'secret',
  resave: false,
  cookie: { maxAge: 60000 } } ) );

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

function createClient( accessTokenKey, accessTokenSecret ) {
  return new Twitter( {
    consumer_key:       process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:    process.env.TWITTER_CONSUMER_SECRET,
    access_token_key:    accessTokenKey,
    access_token_secret: accessTokenSecret
  } );
}

var debug_client = createClient(
  process.env.TWITTER_ACCESS_TOKEN_KEY,
  process.env.TWITTER_ACCESS_TOKEN_SECRET
);

var port = 3000;

var oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    "1.0",
    "http://127.0.0.1:" + port + "/auth/twitter/callback",
    "HMAC-SHA1"
);

if( process.env.NODE_PORT !== void 0 ) {
  port = parseInt( process.env.NODE_PORT, 10 );
  if( isNaN( port ) ) {
    console.log( "[ERROR] Unrecognized NODE_PORT: " + process.env.NODE_PORT );
    process.exit();
  }
}

app.use( '/', express.static( 'public' ) );

app.get( '/auth/twitter', function( req, res ) {
  oauth.getOAuthRequestToken( function( error, token, secret, result ) {
    if( error ) {
      console.log( error );
      res.send( "OAuthリクエストトークンの取得に失敗しました。" );
      return;
    }
    req.session.oauth = { token: token, token_secret: secret };
//    console.log( 'Token:' +  req.session.oauth.token );
//    console.log( 'Secret: ' + req.session.oauth.token_secret );
    res.redirect( 'https://twitter.com/oauth/authenticate?oauth_token=' + token )
  } );
} );

app.get( '/auth/twitter/callback', function( req, res ) {
  if( !req.session.oauth ) {
    res.send( "Twitterアカウントでログインしてからアクセスしてください。" );
    return;
  }
  req.session.oauth.verifier = req.query.oauth_verifier; 
  oauth.getOAuthAccessToken(
      req.session.oauth.token,
      req.session.oauth.token_secret,
      req.session.oauth.verifier,
      function ( error, accessToken, accessTokenSecret, result ) {
        if( error ) { 
          console.log( error );
          res.send( "OAuthアクセストークンの取得に失敗しました。" );
          return;
        }
        req.session.oauth.access_token = accessToken;
        req.session.oauth.access_token_secret = accessTokenSecret;
        req.session.twitter = {
          user_id: result.user_id,
          screen_name: result.screen_name
        };
        console.log( result );
        res.send( "OK!" );
      }
  );
} );

app.get( '/start', function( req, res ) {
  if( !req.session.oauth ) {
    res.status( 403 );
    res.set( { "Content-Type": "application/json;charset=UTF-8" } );
    res.send( JSON.stringify( {
      type: "error",
      message: "Twitterアカウントでログインしてからアクセスしてください。"
    } ) );
    return;
  }
  var client = createClient(
      req.session.oauth.access_token,
      req.session.oauth.access_token_secret
   );
  client.get('friends/ids', {user_id: req.session.twitter.user_id, count: 100}, function(error, result, response){
    var userIdList = result.ids
    var allNum = userIdList.length;
    var finishedNum = 0;
    var succeededNum = 0;
    var avgTimeList = new Array( allNum );
    var stop = false;

    for( var i = 0; i < allNum; i++ ) {
      ( function ( i ) {
        getAverageIntervalByUser( client, userIdList[ i ], function( tStatus, avgDiff) {
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
  } );
  res.status( 200 );
  res.set( { "Content-Type": "application/json;charset=UTF-8" } );
  res.send( JSON.stringify( {
    type: "success",
    request_id: requestId++,
    message: "受理されました。"
  } ) );
} );


function getAverageIntervalByUser( client, userId, callBack ) {
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
      console.log( error );
      if( error != void 0 && error[ 0 ] != void 0 && error[ 0 ].code === 88 ) {
        callBack( "ratelimit" );
      } else {
        callBack( "error" );
      }
    }
  } );
}

app.listen( port );
console.log( "server is running on http://localhost:" + port + "/" );


