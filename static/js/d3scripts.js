var w = 0;
var h = 100;
var barSpacing = 2;

var dataset = [ [100, "#F4A731"], [160, "#78BB66"], 
				[60, "#F4A731"], [120, "#ED5A69"] ];

for (i=0; i < dataset.length; i++) {
	w += dataset[i][0] + barSpacing;
}


var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

var cumLength = 0;
var barHeight = 14;

svg.selectAll("rect")
	.data(dataset)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
		xVal = cumLength;
		cumLength += d[0] + barSpacing;
		return xVal;
	})
	.attr("y", 0)
	.attr("width", function(d, i) {
		return d[0];
	})
	.attr("height", barHeight)
	.attr("fill", function(d) {
		return d[1]
	});

