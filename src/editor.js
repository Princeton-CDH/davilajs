if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // load d3 when running on command-line (e.g. for unit tests via mocha)
  d3 = require('d3');
  parse = require('../src/parse.js').parse;
  davila = require('../src/davila.js').davila;
}


var editor = {

  enable_schema_drop: function () {
    // turn on file drag & drop to allow users to load a schemas for display


    // html5 drag & drop functionality adapted from
    // http://www.html5rocks.com/en/tutorials/file/dndfiles/
    // via altoviz https://github.com/emory-lits-labs/altoviz/
    // rewritten with d3.js with help from
    // https://stackoverflow.com/questions/17140020/combining-d3-js-with-html5-drag-and-drop-files

    function drag_active() {
        d3.select(this).classed('active', true);
        d3.event.stopPropagation();
        d3.event.preventDefault();
        d3.event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    function drag_inactive() {
        d3.select(this).classed('active', false);
    }

    function drop() {
        d3.event.stopPropagation();
        d3.event.preventDefault();

        var files = d3.event.dataTransfer.files;

        // if somehow there are no files, exit
        if (! files.length) {
            return;
        }

        d3.selectAll('#file-list').append('ul').selectAll('li').data(files)
            .enter().append('li')
            .html(function(d) {
                return 'Loading <strong>' + d.name + '</strong> (' +
                    d.size + ' bytes, last modified ' +
                    (d.lastModifiedDate ? d.lastModifiedDate.toLocaleDateString() : 'n/a')
                    + ')';
            });

        // TODO: check that file can be parsed or looks like a mysql schema?

        /* read file as text and parse as schema */
        var reader = new FileReader();
        reader.onload = function(event) {
            // NOTE: using event.target instead of reader because
            // it's easier to stub in the unit tests
            editor.parse_and_display(event.target.result);
        }
        reader.readAsText(files[0]);
        // TODO error handling
    }

    // allow dropping the schema anywhere on the page
    d3.select('body')
        .on('dragenter', drag_active)
        .on('dragover', drag_active)
        .on('dragleave', drag_inactive)
        .on('drop', drop);

  },

  get_querystring_opts: function(location_search) {
    // read query string parameters (if any) into an object
    var query_opts = {};
    // return if there is not at least one variable set
    if (location_search.indexOf('=') == -1 ) {
        return query_opts;
    }
    var query_string = location_search.replace('\?','').split('&');
    query_string.forEach(function(element) {
        var parts = element.split('=');
        query_opts[parts[0]] = parts[1];
    })
    return query_opts;
  },

  parse_and_display: function(content) {
    // parse and display content (whether loaded from dropped file or remote uri)
    var schema_info = parse(content);
    // if entities are found, then display them
    if (schema_info.entities.length) {
      davila.display(schema_info);
    }
  // todo: display a message if no entities are found
  },

  parse_uri: function (uri) {
    // load remote uri as text, then parse and display as mysql schema
    d3.text(uri, function(error, data) {
        if (error) throw error;
        editor.parse_and_display(data);
    });
  }

};

// automatically turn on drop support when running in a browser
if (typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", function(e) {
        editor.enable_schema_drop();
    });

    // load schema via query string parameter if set
    var query_opts = editor.get_querystring_opts(window.location.search);
    if (query_opts.uri) {
        editor.parse_uri(query_opts.uri);
    }

}


// export as node module when running under npm / command line
if (typeof exports !== 'undefined') {
    exports.editor = editor;
}



