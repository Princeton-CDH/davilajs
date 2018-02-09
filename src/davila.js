
// html5 drag & drop functionality adapted from
// http://www.html5rocks.com/en/tutorials/file/dndfiles/
// via altoviz https://github.com/emory-lits-labs/altoviz/
// NOTE: written with jquery; rewrite to use d3 only?

function handleFileSelect(evt) {
    $('#drop_zone').removeClass('active');
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. Add brief display of dropped file
    var output = [],
        list = $('#file-list');
    for (var i = 0, f; f = files[i]; i++) {
        // display information about the file
        var item = $('<li/>')
            .html('<strong>' + f.name + '</strong> ' +
            '(' + (f.type || 'n/a') + ') - ' + f.size + ' bytes, last modified ' +
             (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a'));
        list.append(item);

        /* read as text and parse as schema */
        var reader = new FileReader();
        reader.onload = function(e) {
          var schema_info = parse(reader.result);
          console.log(schema_info);
          davila_display(schema_info);
        }

        reader.readAsText(files[0]);
    }

    // if a url is dropped, assume it is an image
    // var dropped_uri = evt.dataTransfer.getData('text/uri-list')
    // if (dropped_uri) {
        // setImage(dropped_uri);
    // }
}



//$(document).ready(function() {

/*
    var dropZone = document.getElementById('drop_zone');
    function handleDragOver(evt) {
        $(dropZone).addClass('active');
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    function active(event) {
        $(dropZone).addClass('active');
        event.stopPropagation();
        event.preventDefault();
    }


    function inactive(evt) {
        $(dropZone).removeClass('active');
    }

    // Set up the drag&drop listeners.
    dropZone.addEventListener('dragenter', active, false);
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', inactive, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    // TODO/FUTURE: allow schema or json to be loaded via querystring parameter?
    // YES: do this soon to help with testing/reload!
    // TODO: test with much smaller schema than derrida! maybe footnotes module only?
    var schema_url = $.getUrlVar('schema');

    console.log('ready');*/

//});

var davila = {

  display: function davila_display(graph) {
console.log('loading graph');
console.log(graph);
var svg = d3.select("svg.d3"),
    width = + svg.attr("width"),
    height = + svg.attr("height");

// arrow head marker
svg.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 100)   // offset from end of path so it lands closer to half-way
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
    .style("stroke", "#4679BD")
    .style("opacity", "0.8");

var container = d3.select('.container');

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(200))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

// d3.json("mep-people.json", function(error, graph) {
  // if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.relationships)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
      .style("marker-end",  "url(#suit)");  /// add arrow



  var node = container.append('div')
    .attr('class', 'entities')
    .selectAll('div')
    .data(graph.entities)
    .enter().append('div')
        .attr('class', 'entity')
        .style("border-color", function(d) { return color(d.group); })
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.on("dblclick", function() {
    var el = d3.select(this);
      el.classed('collapsed', !el.classed('collapsed'));
    });
    // console.log(this); d3.select(this).classed("collapsed", !d3.select(this).classed('collapsed')); });


  node.append("p")
      .text(function(d) { return d.id; });

  var fieldlist = node.append('ul')
    .attr('class', 'fields');
/*
    var fields = fieldlist.selectAll('li')
        .data(function(d) { console.log(d); return 'fields' in d ? d.fields : []; })
        .enter().append('li')
          .attr('class', 'fields')
          .data(function(d) { return 'fields' in d ? d.fields : []; })
          .append('span').attr('class', 'name').text(function(d) { return d.name })
          .append('span').attr('class', 'type').text(function(d) { return d.type; }); */
  /*
    fields.selectAll('.field')
      .data(function(d, i) {console.log(d); return d;})
      .enter().append('div')
          .attr('class', 'field')
          .text(function(d) { console.log(d.name); return d.name; });*/
/*
var tr = d3.select("body")
  .append("table")
  .selectAll("tr")
  .data(matrix)
  .enter().append("tr");

var td = tr.selectAll("td")
  .data(function(d) { return d; })
  .enter().append("td")
    .text(function(d) { return d; });
*/
    // node.selectAll('.entity')
    //   .enter().append('div')
    //     .attr('class', 'field')
    //   .data(function(d, i, j) { console.log(i); console.log(this); console.log(d.fields); return d.fields; })
    //   .text('test');

    // node.selectAll('.field')
    //   .enter().append('span')
    //     .attr('class', 'name')
    //     .text(function(d) { console.log(d); return d.name; });



  // node.append("div")
  //   .attr("class", "fields")
  //   .text(function(d) {console.log(d.fields); return 'fields'; });

  // node.selectAll("div")
  //   .data(function(d) { return d; })
  //   .enter().append("div")
  //   .text(function(d) {console.log(d); return d; });


/*
d3.select("body")
  .selectAll("p")
  .data([4, 8, 15, 16, 23, 42])
  .enter().append("p")
    .text(function(d) { return "I’m number " + d + "!"; });
*/

  simulation
      .nodes(graph.entities)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.relationships);


  function ticked() {

    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        // .style("transform", function(d) { return 'translate(' + d.x + ', ' + d.y + ');'});
        .style("left", function(d) { return d.x - this.offsetWidth/2 + 'px'; })
        .style("top", function(d) { return d.y - this.offsetHeight/2 + 'px'; });
        // .style("left", function(d) { return d.x + 'px'; })
        // .style("top", function(d) { return d.y + 'px'; });
  }
// });

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
},

};


// access to query string parameters
// via http://stackoverflow.com/questions/7731778/jquery-get-query-string-parameters

// $.extend({
//       getUrlVars: function(){
//         var vars = [], hash;
//         var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
//         for(var i = 0; i < hashes.length; i++)
//         {
//           hash = hashes[i].split('=');
//           vars.push(hash[0]);
//           vars[hash[0]] = hash[1];
//         }
//         return vars;
//       },
//       getUrlVar: function(name){
//         return $.getUrlVars()[name];
//       }
//     });

//     //Second call with this:
//     // Get object of URL parameters
//     var allVars = $.getUrlVars();

//     // Getting URL var by its nam
// var byName = $.getUrlVar('name');
