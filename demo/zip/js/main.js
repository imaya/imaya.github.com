(function(global) {

//
// Web Worker
//
var worker = new Worker('./js/worker.js');
worker.addEventListener('message', function(ev) {
  var status = $('#status');
  var url;

  switch (ev.data.status) {
    case 'download':
      status.html('ダウンロードしています...');
      break;
    case 'compress':
      status.html('圧縮しています...');
      break;
    case 'success':
      url = createObjectURL(ev.data.data, 'application/zip');
      status.html('Zip ファイルを作成しました');
      saveAsPolyfill(url, 'zip_demo.zip');
      $('#modal').modal('hide');
      break;
  }
}, false);

//
// DOMCotentLoaded event
//
document.addEventListener('DOMContentLoaded', function() {
  var submit = document.getElementById('submit');
  submit.addEventListener('click', function(ev) {
    var urls = [];

    ev.preventDefault();
    $('#modal').modal({backdrop: 'static', keyboard: false});


    Array.prototype.forEach.call(
      document.getElementById('files').querySelectorAll('input[type="checkbox"]:checked'),
      function(input) {
        urls.push({
          url: '../' + input.value,
          name: input.value.split('/').pop()
        });
      }
    );

    worker.postMessage(urls);
  }, false);
}, false);

//
// save with filename ( using download attribute )
//
function saveAsPolyfill(url, name) {
  var a = document.createElement('a');
  var event;

  // download 属性非対応
  if (a.download === void 0) {
    location.href = url;
    return;
  }

  a.setAttribute('href', url);
  a.setAttribute('download', name);

  event = document.createEvent("MouseEvent");
  event.initMouseEvent(
    "click",
    true, true, window, 0,
    0, 0, 0, 0, false, false, false, false, 0, null
  );

  a.dispatchEvent(event);
}

//
// create object url
//
function createObjectURL(array, type) {
  var useTypedArray = (typeof Uint8Array !== 'undefined');
  var isSafari = (
    navigator.userAgent.indexOf('Safari') !== -1 &&
    navigator.vendor.indexOf('Apple')     !== -1
  );
  var data = '';
  var bb;
  var blob;
  var tmp;
  var i;
  var il;

  if (useTypedArray) {
    array = new Uint8Array(array);
  }

  // avoid blob url in safari
  if (!isSafari) {

    // Blob constructor
    try {
      blob = new Blob([array], {type: type});
    } catch(e) {
    }

    // BlobBuilder
    if (
      (tmp = window.WebkitBlobBuilder) !== void 0 ||
      (tmp = window.MozBlobBuilder) !== void 0 ||
      (tmp = window.MSBlobBuilder) !== void 0
    ) {
      bb = new tmp();
      bb.append(array.buffer);
      blob = bb.getBlob(type);
    }

    // createObjectURL
    if (blob && (
      ((tmp = window.URL)       && tmp.createObjectURL) ||
      ((tmp = window.webkitURL) && tmp.createObjectURL)
    )) {
      return tmp.createObjectURL(blob);
    }
  }

  // DataURL
  for (i = 0, il = array.length; i < il;) {
    data += String.fromCharCode.apply(
      null,
      useTypedArray ?
        array.subarray(i, i+= 0x7fff) :
        array.slice(i, i += 0x7fff)
    );
  }

  return 'data:' + type + ';base64,'+ window.btoa(data);
}

}).call(this);
