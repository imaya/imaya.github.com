importScripts('./zip.min.js');

var global = this;
var USE_TYPEDARRAY = this.Uint8Array !== void 0;

global.addEventListener('message', function(ev) {
  var files = ev.data;
  var zip = new Zlib.Zip();
  var file;
  var data;
  var i;
  var il;
  var result;

  postMessage({
    status: 'download'
  });
  for (i = 0, il = files.length; i < il; ++i) {
    file = files[i];
    data = download(file.url);

    if (data === null) {
      continue;
    }

    zip.addFile(data, {
      filename: stringToByteArray(file.name)
    });
  }

  postMessage({
    status: 'compress'
  });
  result = zip.compress();

  postMessage({
    status: 'success',
    data: result
  });
}, false);

function download(url) {
  var xhr;

  xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.send();

  if (xhr.status !== 200) {
    return null;
  }

  return (xhr.response === void 0) ?
    stringToByteArray(xhr.responseText) :
    new Uint8Array(xhr.response);
}

function stringToByteArray(str) {
  var array = new (USE_TYPEDARRAY ? Uint8Array : Array)(str.length);
  var i;
  var il;

  for (i = 0, il = str.length; i < il; ++i) {
    array[i] = str.charCodeAt(i) & 0xff;
  }

  return array;
}