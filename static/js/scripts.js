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

// D3 Variables
var xScaleFunctions = {};
var xHistScaleFunctions = {};
var yScaleFunctions = {};
var w = 290;
var h = 55;
var barSpacing = 2;
var barHeight = 10;
var barYPos = 24;
var padding = 16;
var chartPaddingBottom = 24;
var smileyWidth = 22;
var smileyHeight = 24;
var margin = {top: 20, right: padding, bottom: 34, left: 44};
var histogramHeight = 230 - margin.top - margin.bottom;
var histogramWidth = w - margin.left - margin.right;

// Load some D3 stuff at the way beginning
$( document ).ready(function() {
	$(".vital-overlay").niceScroll({cursorcolor:"rgba(255,255,255,0)"});
	initializeData();
});

$(window).load(function() {
	// Page is loaded
	$("body").fadeIn(2000);
});

function initializeData() {

	var vitals = getVitalRanges();
	setRiskLevels(vitals);
	vitalData = {};
	d3.csv("../static/data/histogram-data.csv", function(data) {
		for (i = 0; i < vitals.length; i++) {
			vital = vitals[i];
			for (j = 0; j < vital.ranges.length; j++) {
				subVital = vital.ranges[j];
		    	dataset = data.map(function(d) { return parseFloat(d[vital.id + "-" + subVital.name]); });
		    	vitalData[ vital.id + "-" + subVital.name ] = dataset;
			}
		}
   		loadVitalVisuals();
	});
}

function setRiskLevels(vitals) {
	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];
   		var index = 0;
		$('.vital-overlay-content .' + vital.id).children().each(function() {
			ranges = vital.ranges[index];
		   	for (k = 0; k < ranges.value.length; k++) {
	   			cutoff = ranges.value[k][0];
	   			if ($(this).html() < cutoff) {
	   				setRiskLevel(vital.id, ranges.value[k][2]);
	   				break;
	   			}
		   	}
	   		index += 1;
		});
	}
}

function setRiskLevel(vital, risk) {
	$('span.' + vital).addClass(risk);
	$('.vital-stats.' + vital).addClass(risk);
	$('.vital-overlay.' + vital).addClass(risk + "-border-top");
	$('.vital.' + vital).addClass(risk + "-border-left")
}

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
    	animateVital(vital, vitalRisk, vitalValues);
    	//if (subVitals != null) {
    		//for (i=vitalValues.length - 1; i >= 0; i--) {
				animateHistogram(vital, vitalRisk, vitalValues);
			//}
    	//}
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
var animatedHistograms = [];

function animateVital(vital, vitalRisk, values) {
	// the following doesn't work for IE 8 and below
	if (animatedVitals.indexOf(vital) == -1) {
		imgUrl = getSmileyUrl(vitalRisk);
		index = 0;
		scaled_values = [];
		d3.selectAll('.' + vital + ' svg.chart').each(function() {
			svg = d3.select(this);
			svg.append("image")
				.attr("x", padding - smileyWidth/2)
				.attr("y", barYPos - smileyHeight)
				.attr("xlink:href", imgUrl)
				.attr("src", imgUrl)
				.attr("width", smileyWidth)
				.attr("height", smileyHeight)
				.attr("class", svg.attr("class"));
			subVitalName = svg.attr("class").split(' ')[1]
		});
		
		d3.selectAll('.' + vital + ' image.chart').each(function() {
			img = d3.select(this);
			vitalValue = values[index];
			className = img.attr("class");
			subVitalName = className.split(' ')[1];
			scaledValue = xScaleFunctions[vital + '-' + subVitalName](vitalValue);
		 	img.transition()
		 		.duration(1000)
		 		.attr("x", scaledValue - smileyWidth/2);
		 	index += 1;
		});
		animatedVitals.push(vital);
	}
}

function animateHistogram(vital, vitalRisk, values) {
	if (animatedHistograms.indexOf(vital) == -1) {
		//riskString = getRangeRisk(vitalValue, ranges.value, minData, 1);
		index = 0;
		d3.selectAll('.' + vital + ' svg.histogram').each(function() {
			svg = d3.select(this);
			bar = svg.selectAll(".bar");
			className = svg.attr("class");
			subVitalName = className.split(' ')[1];
			vitalValue = values[index];
			xScale = xHistScaleFunctions[vital + '-' + subVitalName];
			yScale = yScaleFunctions[vital + '-' + subVitalName];
			addPersonToHistogram(bar, vitalRisk, vitalValue, xScale);
			animateHistogramBars(svg, yScale);
			animateHistogramPerson(bar, yScale);
		    index += 1;
		});
		animatedHistograms.push(vital);
	}
}

function getSmileyUrl(vitalRisk) {
	baseUrl = '../static/css/images/smiley-';
	return baseUrl + vitalRisk + '.png';
}

function getPersonUrl(vitalRisk) {
	baseUrl = '../static/css/images/person-';
	return baseUrl + vitalRisk + '.png';
}

function addPersonToHistogram(bar, vitalRisk, vitalValue, xScale) {
	imgUrl = getPersonUrl(vitalRisk);
	personWidth = 11;
	personHeight = 29;
	bar.filter(function(d) {
    		xBucketMax = d.x + d.dx;
    		xBucketMin = d.x;
    		return (xBucketMin <= vitalValue) && (xBucketMax > vitalValue);
    	}).append("image")
    	.attr("x", function(d) {
    		return xScale(d.dx/2) - personWidth / 2;
    	})
    	.attr("y", histogramHeight - personHeight)
    	.attr("xlink:href", imgUrl)
		.attr("src", imgUrl)
		.attr("width", personWidth)
		.attr("height", personHeight);
}

function animateHistogramBars(svg, yScale) {
    svg.selectAll("rect")
		.transition()
		.duration(1000)
    	.attr("height", function(d) {
        	return histogramHeight - yScale(d.y / dataset.length);
    	})
    	.attr("y", function(d) {
    		return yScale(d.y / dataset.length);
    	});
}

function animateHistogramPerson(bar, yScale) {
	bar.selectAll("image")
		.transition()
		.duration(1000)
		.attr("y", function(d) {
			return yScale(d.y / dataset.length)-personHeight;
		});
}

function loadVitalVisuals() {

	var vitals = getVitalRanges();

	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];

		for (j = 0; j < vital.ranges.length; j++) {
			ranges = vital.ranges[j];
			loadVitalCharts(vital, ranges);
		}
		for (j = 0; j < vital.ranges.length; j++) {
			ranges = vital.ranges[j];
			loadVitalHistograms(vital, ranges);
		}	
	}
}

function loadVitalCharts(vital, ranges) {

	dataset = vitalData[vital.id + "-" + ranges.name];
	minData = d3.min(dataset);
    maxData = d3.max(dataset);

	var svg = d3.select('.vital-stats.' + vital.id)
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class", "chart " + ranges.name);

	var xScalePos = d3.scale.linear()
							.domain([minData, maxData])
							.range([padding, w - padding]);

	var xScaleVal = d3.scale.linear()
							.domain([0, maxData - minData])
							.range([padding, w - padding]);

	xScaleFunctions[vital.id + '-' + ranges.name] = xScalePos;

	var lastVal1 = minData;
	var lastVal2 = minData;

	svg.selectAll("rect")
		.data(ranges.value)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			xVal = xScalePos(lastVal1);
			lastVal1 = d[0];
			return xVal;
		})
		.attr("y", barYPos)
		.attr("width", function(d) {
			wVal = xScalePos(Math.min(d[0], maxData)) - xScalePos(lastVal2) - barSpacing;
			lastVal2 = d[0];
			return wVal;
		})
		.attr("height", barHeight)
		.attr("fill", function(d) {
			return d[1];
		});

	svg.append("text")
		.attr("class", "vital-stats-label")
		.attr("x", padding)
		.attr("y", barYPos - 5)
	    .text(ranges.name);

	var xAxis = d3.svg.axis()
						.scale(xScalePos)
						.tickValues(xScalePos.domain())
						.orient("bottom");
	svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (h - chartPaddingBottom) + ")")
			.call(xAxis);
}

// Called from function that loads data into 'dataset' variable
function loadVitalHistograms(vital, ranges) {

	dataset = vitalData[vital.id + "-" + ranges.name];
	var formatCount = d3.format(",.0f");
	var formatAsPercentage = d3.format("1%");

    minData = d3.min(dataset);
    maxData = d3.max(dataset);

    var xData = d3.scale.linear()
        .domain([ minData , maxData ])
        .range([ 0, histogramWidth ]);

    var x = d3.scale.linear()
        .domain([ 0, maxData - minData ])
        .range([ 0, histogramWidth ]);

    xHistScaleFunctions[vital.id + '-' + ranges.name] = x;

    data = d3.layout.histogram()
        .bins(xData.ticks(25))
        (dataset);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { 
            return d.y / dataset.length; 
        })])
        .range([histogramHeight, 0]);

    yScaleFunctions[vital.id + '-' + ranges.name] = y;

    var xAxis = d3.svg.axis()
        .scale(xData)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(4)
        .tickFormat(formatAsPercentage);

    var svg = d3.select('.vital-stats.' + vital.id).append("svg")
        .attr("width", histogramWidth + margin.left + margin.right)
        .attr("height", histogramHeight + margin.top + margin.bottom)
        .attr("class", "histogram " + ranges.name)
      	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { 
            return "translate(" + xData(d.x) + ", 0)";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("y", histogramHeight)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", 0)
        .attr("fill", function(d) {
            var xBucket = d.x + d.dx;
            var threshold0 = ranges.value[0][0];
            var threshold1 = ranges.value[1][0];
            var threshold2 = ranges.value[2][0];
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

    svg.append("g")
        .attr("class", "x histogram-axis")
        .attr("transform", "translate(0," + histogramHeight + ")")
        .call(xAxis);

    svg.append("text")
        .attr("class", "x histogram-label")
        .attr("text-anchor", "middle")
        .attr("x", histogramWidth / 2)
        .attr("y", histogramHeight + 30)
        .text(ranges.name.toUpperCase() + " " + vital.name.toUpperCase());

    svg.append("g")
        .attr("class", "y histogram-axis")
        .call(yAxis);

    svg.append("text")
        .attr("class", "y histogram-label")
        .attr("x", -histogramHeight + 12)
        .attr("y", -33)
        .text("PERCENT OF PEOPLE LIKE YOU");

}

function getRangeRisk(value, ranges, min, colorOrRisk) {
	for (i=0; i<ranges.length; i++) {
		if (value <= ranges[i][0]) {
			if (colorOrRisk == 0) {
				// return color
				return ranges[i][1];
			} else {
				return getRangeRiskString(i);
			}
			if ((i == ranges.length - 1) && (value > ranges[i][0])) {
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
    		for (j=0; j < vitalRanges[i].ranges.length; j++) {
    			if (vitalRanges[i].ranges[j].name == subvital) {
    				return vitalRanges[i].ranges[j];
    			}
    		}
    	}
    }
}

function getVitalRanges() {
	vr = [
			{ 	
				id: 'bloodpressure',
				name: 'blood pressure',
				ranges:
					[
						{
							name: 'systolic',
							value: 
								[
									[90, "#F4A731",'medium-risk'], [120, "#78BB66",'low-risk'], 
									[140, "#F4A731", 'medium-risk'], [800, "#ED5A69", 'high-risk']
								]
						},
						{
							name: 'diastolic',
							value:
								[
									[60, "#F4A731", 'medium-risk'], [80, "#78BB66", 'low-risk'], 
									[90, "#F4A731", 'medium-risk'], [700, "#ED5A69", 'high-risk']
								]
						}
					]
			},
			// {
			// 	id: 'bloodglucose',
			// 	ranges:
			// 		[
			// 			{
			// 				name: '',
			// 				value: 
			// 					[
			// 						[70, "#F4A731"], [150, "#78BB66"], 
			// 						[180, "#F4A731"], [280, "#ED5A69"]
			// 					]
			// 			}
			// 		]
			// },
			{
				id: 'cholesterol',
				name: 'cholesterol',
				ranges:
					[
						{
							name: 'total',
							value:
								[
									[160,'#F4A731','medium-risk'], [200,'#78BB66','low-risk'], 
									[240,'#F4A731','medium-risk'],[700,'#ED5A69','high-risk']
								]
						},
						// {
						// 	name: 'hdl',
						// 	value:
						// 		[
						// 			[25,'#ED5A69'], [35,'#F4A731'], 
						// 			[55,'#78BB66'], [700,'#F4A731']
						// 		]
						// },
						{
							name: 'ldl',
							value:
								[
									[80,'#F4A731','medium-risk'], [130,'#78BB66','low-risk'], 
									[160,'#F4A731','medium-risk'], [700, '#ED5A69','high-risk']
								]
						}
					]
			},
			{
				id: 'bmi',
				name: 'bmi',
				ranges:
					[
						{
							name: '',
							value: 
								[
									[17, "#F4A731",'medium-risk'], [22, "#78BB66",'low-risk'], 
									[25, "#F4A731",'medium-risk'], [700, "#ED5A69",'high-risk']
								]
						}
					]
			}
		];
	return vr;
}
