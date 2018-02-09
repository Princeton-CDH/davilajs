
var davila = {

  display: function (graph) {
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

      // temporary: toggle collapsed/uncollapsed on double click
      node.on("dblclick", function() {
        var el = d3.select(this);
          el.classed('details', !el.classed('details'));
        });

      node.append("p")
          .text(function(d) { return d.id; });

    // for each entity, load the list of attributes and data types (hidden by default)
    var fieldlist = node.append('ul')
        .attr('class', 'fields');

    var fields = fieldlist.selectAll('li')
        .data(function(d) { return 'fields' in d ? d.fields : []; })
        .enter().append('li')
         .attr('class', 'fields')
          .append('span').attr('class', 'name').text(function(d) { return d.name })
          .append('span').attr('class', 'type').text(function(d) { return d.type; });

    fields.selectAll('.field')
      .data(function(d, i) { return d;})
      .enter().append('div')
          .attr('class', 'field')
          .text(function(d) { return d.name; });

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
            .style("left", function(d) { return d.x - this.offsetWidth/2 + 'px'; })
            .style("top", function(d) { return d.y - this.offsetHeight/2 + 'px'; });
      }

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


  // export as node module when running under npm / command line
  if (typeof exports !== 'undefined') {
      exports.davila = davila;
  }



