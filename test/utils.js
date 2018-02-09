// utility methods for unit testing
// - load fixture methods for in-browser or command line

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // tests running on command-line via mocha

  fs = require('fs');

  function load_fixture(filename, callback) {
    // utility method to load fixture files relative to the
    // directory where this test file is located
    fs.readFile(__dirname + '/' + filename, function(err, data) {
      callback(data.toString());
    });
  }

} else {

  function load_fixture(filename, callback) {
    // utility method to load fixture files
    var relative_path = "/test/" + filename;
    var load_method;
    // load as xml if the filename includes .xml
    if (filename.indexOf('.xml') !== -1) {
      load_method = d3.xml;
    //otherwise load as text
    } else {
      load_method = d3.text;
    }

    load_method(relative_path, function(error, data) {
      if (error) throw error;
      callback(data);
    })
  }

}


// export as node module when running under npm / command line
if (typeof exports !== 'undefined') {
    exports.load_fixture = load_fixture;
}
