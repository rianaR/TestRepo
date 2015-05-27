var PhotoCapture;
var fs = require('fs'), path = require('path');
PhotoCapture = function PhotoCapture(name, deps) {
  if (!(this instanceof PhotoCapture))
    return new PhotoCapture(name, deps);
  console.log('This is where photocapture code would execute in the node process.');
  this.listen(deps);
  deps.globalEventLoop.on('photo-added', function (filename) {
    deps.cockpit.emit('plugin.photoCapture.photos.added', filename);
    console.log('sending photo to web client');
  });
};
PhotoCapture.prototype.listen = function listen(deps) {
  var photoc = this;
  var dep = deps;

    photoc.enumeratePhotos(dep, function (photos) {
      deps.cockpit.emit('plugin.photoCapture.photos.updated', photos);
      console.log('emitting updated photots to clients');
    });

    deps.cockpit.on('plugin.photoCapture.snapshot', function () {
      console.log('PhotoCapure:snapshot found');
      dep.camera.snapshot(function (filename) {
        console.log('Photo taken: ' + filename);
        deps.cockpit.emit('plugin.photoCapture.photos.added', '/photos/' + path.basename(filename));
      });
    });
};
PhotoCapture.prototype.enumeratePhotos = function (deps, callback) {
  fs.readdir(deps.config.preferences.get('photoDirectory'), function (err, files) {
    if (err)
      throw err;
    var myfiles = [];
    files.forEach(function (file) {
      myfiles.push('/photos/' + path.basename(file));
    });
    callback(myfiles);
  });
};
module.exports = PhotoCapture;