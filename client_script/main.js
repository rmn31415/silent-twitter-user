window.addEventListener( "load", function() {
  var button = document.getElementById( "get-info-button" );
  button.addEventListener( "click", function() {
    button.setAttribute( "disabled", "disabled" );
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", "/api/user/silent" );
    xhr.onreadystatechange = function() {
      if( xhr.readyState === 4 ) {
        if( xhr.status === 0 ) {
          setMessage( "caution", "取得失敗" );
          setMessage( "notice", "" );
          return;
        }

        if( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ) {
          setMessage( "caution", "" );
          setMessage( "notice", "情報取得しました. 描画中..." );
          render( JSON.parse( xhr.responseText ) );
          return;
        }

        setMessage( "caution", "取得失敗" );
        setMessage( "notice", "ステータスコード: " + xhr.status );
      }
    };
    xhr.send( null );
    setMessage( "caution", "" );
    setMessage( "notice", "情報取得中... しばらくお待ちください" );
  } );

} );

function setMessage( id, message ) {
  var elm = document.getElementById( id )
  elm.textContent = message;
}

function render( obj ) {
  var status = obj.status;
  if( status === "success" ) {
    var result = obj.result;
    var targetTable = document.getElementById( "target-table" );
    result.forEach( function( item, idx, array ) {
      targetTable.appendChild(
          createTableRow(
            item.detail.profile_image_url,
            item.detail.screen_name,
            item.detail.name,
            item.average
            )
          );

    } );
    if( obj.rate_limit === true ) {
      setMessage( "caution", "API制限の都合上、正しい結果が出ていません。" );
    }
    setMessage( "notice", "完了しました!" );
  }
}

function createTableRow( image_url, screen_name, name, ave_sec ) {
  var tr = document.createElement( "tr" );
  var img = new Image();
  img.src = image_url;
  tr.appendChild( createTableColElm( img ) );
  tr.appendChild( createTableColTxt( "@" + screen_name ) );
  tr.appendChild( createTableColTxt( name ) );
  tr.appendChild( createTableColTxt( ave_sec === null ? "---" : ( ave_sec + " sec" ) ) );
  return tr;
}

function createTableColElm( elm ) {
  var td = document.createElement( "td" );
  td.appendChild( elm );
  return td;
}

function createTableColTxt( txt ) {
  var td = document.createElement( "td" );
  td.textContent = txt;
  return td;
}

