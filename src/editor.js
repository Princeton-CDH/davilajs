
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
        reader.onload = function(e) {
          var schema_info = parse(reader.result);
          console.log(schema_info);
          // TODO: check that parse returns entity relationship object
          davila_display(schema_info);
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


// automatically turn on drop support
document.addEventListener("DOMContentLoaded", function(e) {
    enable_schema_drop();
});


