if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // load d3 when running on command-line (e.g. for unit tests via mocha)
  d3 = require('d3');
}


function enable_schema_drop() {
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
            var schema_info = parse(event.target.result);
            console.log(schema_info);
            // if entities are found, then display them
            if (schema_info.entities.length) {
                console.log('calling davila display');
              davila_display(schema_info);
            }
          // TODO: display a message if no entities are found
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

}

// automatically turn on drop support when running in a browser
if (typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", function(e) {
        enable_schema_drop();
    });
}


// export as node module when running under npm / command line
if (typeof exports !== 'undefined') {
    exports.editor = {
        'enable_schema_drop': enable_schema_drop
    };
}



