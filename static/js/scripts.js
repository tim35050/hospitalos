//GLOBAL
// Variables used across this file
var currentContentID = '#home';

// NAVIGATION
// Handles menu item clicks and page navigation
$( 'ul.navigation li a').click(function() {
	// Only do stuff if the button clicked isn't already active
	if (!$(this).hasClass('active-link')) {
		// Set the previously-active button to inactive
		$(this).parent().parent().children().each(function() {
			$(this).children().removeClass('active-link');
			var className = $(this).children().attr('class');
			var activeSuffix = '-active';
			if (className.length > activeSuffix.length) {
				var suffixStartPos = className.length - activeSuffix.length;
				if (className.substring(suffixStartPos, className.length) == activeSuffix) {
					// Currently selected menu item
					var inactiveClassName = className.substring(0, suffixStartPos);
					$(this).children().removeClass();
					$(this).children().addClass(inactiveClassName);
					currentContentID = '#' + inactiveClassName.substring(4, inactiveClassName.length);
				}
			}
		});
		// Set the clicked button to active
		var buttonName = $(this).attr('class');
		$(this).removeClass(buttonName);
		var activeButtonName = buttonName + '-active';
		$(this).addClass(activeButtonName);
		$(this).addClass('active-link');
		// Show the new content
		newContentID = '#' + buttonName.substring(4, buttonName.length);
		$( currentContentID ).fadeOut(500);
		$( newContentID ).fadeIn(500);
	}
});

// VITALS
// Load some D3 stuff at the way beginning
$( document ).ready(function() {
	loadD3Vitals();
});

// Handle vital selections and the vital overlay
$( ".vital" ).click(function() {
	var vo = $(this).children('.vital-overlay');
    vo.fadeIn(500, function() {
    	voc = vo.children('.vital-overlay-content');
    	classes = voc.children('.vital-stats').attr('class').split(' ');
    	vital = classes[1];
    	vitalRisk = classes[2];
    	vov = voc.children('.vital-overlay-value');
    	var vitalValues = [];
    	vov.children().each(function() {
    		vitalValues.push($(this).html());
    	});
    	subVitals = animateVital(vital, vitalRisk, vitalValues);
    	if (subVitals != null) {
    		for (i=vitalValues.length - 1; i >= 0; i--) {
				displayHistogram(vital, subVitals[i], vitalValues[i]);
			}
    	}
    });
});
$( ".vital-overlay" ).click(function() {
	event.stopPropagation();
});

$( ".close-overlay" ).click(function() {
	$(this).parent().fadeOut(300);
	event.stopPropagation();
});

var animatedVitals = [];
var displayedHistograms = [];

function animateVital(vital, vitalRisk, values) {
	// the following doesn't work for IE 8 and below
	if (animatedVitals.indexOf(vital) == -1) {
		subVitals = [];
		imgUrl = getSmileyUrl(vitalRisk);
		index = 0;
		scaled_values = []
		index = 0;
		d3.selectAll('.' + vital + ' svg').each(function() {
			svg = d3.select(this);
			svg.append("image")
				.attr("x", padding - smileyWidth/2)
				.attr("y", barYPos - smileyHeight)
				.attr("xlink:href", imgUrl)
				.attr("src", imgUrl)
				.attr("width", smileyWidth)
				.attr("height", smileyHeight)
				.attr("class", svg.attr("class"));
			subVitals.push(svg.attr("class"));
		});
		
		d3.selectAll('.' + vital + ' image').each(function() {
			img = d3.select(this);
			vitalValue = values[index];
			className = img.attr("class");
			scaledValue = scaleFunctions[vital + '-' + className](vitalValue);
		 	img.transition()
		 		.duration(1000)
		 		.attr("x", scaledValue - smileyWidth/2);
		 	index += 1;
		});
		animatedVitals.push(vital);
		return subVitals;
	}
	return null;
}

function getSmileyUrl(vitalRisk) {
	baseUrl = '../static/css/images/smiley-';
	return baseUrl + vitalRisk + '.png'
}

// D3 Variables
var scaleFunctions = {};
var w = 550;
var h = 80;
var barSpacing = 2;
var barHeight = 14;
var barYPos = 42;
var padding = 25;
var smileyWidth = 33;
var smileyHeight = 36;

function loadD3Vitals() {

	var vitals = getVitalRanges();

	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];

		for (j = 0; j < vital.dataset.length; j++) {
			dataset = vital.dataset[j];

			var svg = d3.select('.' + vital.id)
						.append("svg")
						.attr("width", w)
						.attr("height", h)
						.attr("class", dataset.name);

			var xScalePos = d3.scale.linear()
									.domain([dataset.min, dataset.max])
									.range([padding, w - padding]);

			var xScaleVal = d3.scale.linear()
									.domain([0, dataset.max - dataset.min])
									.range([padding, w - padding]);

			scaleFunctions[vital.id + '-' + dataset.name] = xScalePos;
			var cumLength = 0;

			svg.selectAll("rect")
				.data(dataset.value)
				.enter()
				.append("rect")
				.attr("x", function(d) {
					xVal = xScaleVal(cumLength);
					cumLength += d[0];
					return xVal;
				})
				.attr("y", barYPos)
				.attr("width", function(d) {
					return xScaleVal(cumLength) - xScaleVal(cumLength - d[0]) - barSpacing;
				})
				.attr("height", barHeight)
				.attr("fill", function(d) {
					return d[1]
				});

			svg.append("text")
				.attr("class", "vital-stats-label")
				.attr("x", padding)
				.attr("y", barYPos - 4)
			    .text(dataset.name);

			var xAxis = d3.svg.axis()
								.scale(xScalePos)
								.tickValues(xScalePos.domain())
								.orient("bottom");
			svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(xAxis);
		}
	}
}

// Histogram
function displayHistogram(vital, subVital, vitalValue) {
	histogramID = vital + "-" + vitalValue;
	if (displayedHistograms.indexOf(histogramID) == -1) {
		d3.csv("../static/data/" + vital + "-" + subVital + ".csv", function(data) {
	    	dataset = data.map(function(d) { return parseFloat(d[vital + "-" + subVital]); });
	    	generateVis(vital, subVital, vitalValue);
		});
		displayedHistograms.push(histogramID);
	}
}

function generateVis(vital, subVital, vitalValue) {
	if (vital == 'bmi') {
		console.log(dataset);
	}
	vitalValue = vitalValue;

    var formatCount = d3.format(",.0f");
	var formatAsPercentage = d3.format("1%");
    var margin = {top: 30, right: 30, bottom: 50, left: 40},
        width = 550 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    minData = d3.min(dataset, function(d) { return d; });
    //minData = Math.max(minData, 10);
    maxData = d3.max(dataset, function(d) { return d; });
    //maxData = Math.min(maxData, 190);

    var xData = d3.scale.linear()
        .domain([ minData , maxData ])
        .range([ 0, width ]);

    var x = d3.scale.linear()
        .domain([ 0, maxData - minData ])
        .range([ 0, width ]);

    data = d3.layout.histogram()
        .bins(xData.ticks(25))
        (dataset);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { 
            return d.y / dataset.length; 
        })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xData)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(4)
        .tickFormat(formatAsPercentage);

    var svg = d3.select('.' + vital).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { 
            //return "translate(" + xData(d.x) + ", " + y(d.y / dataset.length) + ")"; 
            return "translate(" + xData(d.x) + ", 0)";
        });

    var subVitalRange = getSubVitalRange(subVital);

    bar.append("rect")
        .attr("x", 1)
        .attr("y", height)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", 0)
        .attr("fill", function(d) {
            var xBucket = d.x + d.dx;
            var threshold0 = subVitalRange.value[0][0] + subVitalRange.min;
            var threshold1 = threshold0 + subVitalRange.value[1][0];
            var threshold2 = threshold1 + subVitalRange.value[2][0];
            if (xBucket <= (threshold0)) {
                return "#F7A649";
            } else if(xBucket <= threshold1) {
                return "#78BB66";
            } else if(xBucket <= threshold2) {
                return "#F7A649";
            } else {
                return "#ED5A69";
            }
        });

    svg.selectAll("rect")
    	.transition()
    	.duration(1000)
        .attr("height", function(d) {
            return height - y(d.y / dataset.length);
        })
        .attr("y", function(d) {
        	return y(d.y / dataset.length);
        });

	riskString = getRangeRisk(vitalValue, subVitalRange.value, subVitalRange.min, 1);

    bar.filter(function(d) {
    		xBucketMax = d.x + d.dx;
    		xBucketMin = d.x;
    		return (xBucketMin <= vitalValue) && (xBucketMax > vitalValue);
    	}).append("image")
    	.attr("x", function(d) {
    		return x(d.dx/2) - 8;
    	})
    	.attr("y", height - 44)
    	.transition()
    	.duration(1000)
    	.attr("y", function(d) {
    		return y(d.y / dataset.length)-44;
    	})
		.attr("xlink:href", function(d) {
			return '../static/css/images/person-' + riskString + '.png'
		})
		.attr("src", function(d) {
			return '../static/css/images/person-' + riskString + '.png'
		})
		.attr("width", 17)
		.attr("height", 44);

    svg.append("g")
        .attr("class", "x histogram-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")
        .attr("class", "x histogram-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .text(subVital.toUpperCase() + " " + vital.toUpperCase());

    svg.append("g")
        .attr("class", "y histogram-axis")
        .call(yAxis);

}

function getRangeRisk(value, ranges, min, colorOrRisk) {
	cumValue = 0;
	for (i=0; i<ranges.length; i++) {
		cumValue += ranges[i][0];
		if (value <= (cumValue + min)) {
			if (colorOrRisk == 0) {
				// return color
				return ranges[i][1];
			} else {
				return getRangeRiskString(i);
			}
			if ((i == ranges.length - 1) && (value > (cumValue + min))) {
				if (colorOrRisk == 0) {
					return ranges
				} else {
					return getRangeRiskString(i);
				}
			}
		}
	}
}

function getRangeRiskString(id) {
	if (id == 0 || id == 2) {
		return "medium-risk";
	} else if (id == 1) {
		return "low-risk";
	} else if (id == 3) {
		return "high-risk"
	}
}

function getSubVitalRange(subvital) {
	var vitalRanges = getVitalRanges();
    for (i=0; i < vitalRanges.length; i++) {
    	var vitalRangeID = vitalRanges[i].id;
    	if (vitalRangeID == vital) {
    		for (j=0; j < vitalRanges[i].dataset.length; j++) {
    			if (vitalRanges[i].dataset[j].name == subvital) {
    				return vitalRanges[i].dataset[j];
    			}
    		}
    	}
    }
}

function getVitalRanges() {
	vr = [
			{ 	
				id: 'bloodpressure',
				dataset:
					[
						{
							name: 'systolic',
							min: 40,
							max: 180,
							value: 
								[
									[50, "#F4A731"], [30, "#78BB66"], 
									[20, "#F4A731"], [40, "#ED5A69"]
								]
						},
						{
							name: 'diastolic',
							min: 40,
							max: 120,
							value:
								[
									[20, "#F4A731"], [20, "#78BB66"], 
									[10, "#F4A731"], [30, "#ED5A69"]
								]
						}
					]
			},
			{
				id: 'bloodglucose',
				dataset:
					[
						{
							name: '',
							min: 20,
							max: 280,
							value: 
								[
									[50, "#F4A731"], [80, "#78BB66"], 
									[30, "#F4A731"], [100, "#ED5A69"]
								]
						}
					]
			},
			{
				id: 'cholesterol',
				dataset:
					[
						{
							name: 'total',
							min: 140,
							max: 300,
							value:
								[
									[20,'#F4A731'], [40,'#78BB66'], 
									[20,'#F4A731'],[80,'#ED5A69']
								]
						},
						{
							name: 'hdl',
							min: 15,
							max: 100,
							value:
								[
									[10,'#F4A731'], [10,'#78BB66'], 
									[20,'#F4A731'], [45,'#ED5A69']
								]
						},
						{
							name: 'ldl',
							min: 60,
							max: 200,
							value:
								[
									[20,'#F4A731'], [20,'#78BB66'], 
									[40,'#F4A731'], [60, '#ED5A69']
								]
						}
					]
			},
			{
				id: 'bmi',
				dataset:
					[
						{
							name: '',
							min: 10,
							max: 40,
							value: 
								[
									[8.5, "#F4A731"], [6.5, "#78BB66"], 
									[5, "#F4A731"], [10, "#ED5A69"]
								]
						}
					]
			}
		];
	return vr;
}
