/*	Margin, Width and height */
var margin = {top: 20, right: 40, bottom: 70, left: 58};
var width = 940  - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
/*	Global variable to control the length of D3 transitons */
var duration = 400;
/*	Global variable to hold the cc or ac choice */
var count = "cc"
/*	Global variable to hold the cc or ac choice */
var field = "all"
/*	Global variable to control which year to disylay */
var displayYear = 2012;
/*	Global variables to control field and count text in axis label */
var displayCount = "Corrected count";
var displayField = "All fields";

/*	Colours for the bars */
var allBars = "#A0BEC5";

/*	A to determine if the scale should be adjustedq§ */
var adjustScaleCheck = false;
			
/*	Create SVG element */
var svg = d3.select(".count-chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

/* JqueryUI create button */
$(function() {
	$( "#check" ).button();
	$( ".count-select" ).buttonset();
	$( ".select-field" ).buttonset();
});

/*	1 - First  Load in JSON data */
d3.json('data/ranking-country-global.json', draw);

/*	2 - The draw function is called only once the JSON file has fully loaded 
	and is responsible for building the barchart */
function draw(data) {

	/* Two jqueryUI functions to build the year and field sliders */
	function makeYearSlider () {
		var select = $( ".select-year" );
		var slider = $( "<div id='slider'></div>" ).insertAfter( select ).slider({
			min: 1,
			max: 5,
			range: "min",
			value: select[ 0 ].selectedIndex + 1,
			slide: function( event, ui ) {
				select[ 0 ].selectedIndex = ui.value - 1;
				switch(ui.value) {
					case 5:
						displayYear = "2012";
						break;
					case 4:
						displayYear = "2011";
						break;
					case 3:
						displayYear = "2010";
						break;
					case 2:
						displayYear = "2009";
						break;
					case 1:
						displayYear = "2008";
						break;
					default:
						displayYear = "2012";
						break;																	
				};
				updateYear();
			}
		});
		$( ".select-year" ).change(function() {
			slider.slider( "value", this.selectedIndex + 1 );
		});
	};

	/* store this number to use to create a staggered transition */
	var numberOfBars = data.year2008.length;

	/*	Set the display year and call updateYear()
		When the slider or the select box are changed */

	d3.selectAll(".select-year").on("change", function(){
		displayYear = this.value;
		updateYear();
	});

	d3.selectAll(".select-field input").on("change", function(){
		
		field = this.value;
		updateBars();
	});

	/*	function called to select a new year from the json file 
		and transition the circle's radii to these values */
	function updateYear() {

		switch (displayYear) { 
			case "2008":
				bars.data(data.year2008, function(d, i) {
					return d.country;
				});
				updateBars();
				break;
			case "2009":
				bars.data(data.year2009, function(d, i) {
					return d.country;
				});
				updateBars();
				break;
			case "2010":
				bars.data(data.year2010, function(d, i) {
					return d.country;
				});
				updateBars();
				break;
			case "2011":
				bars.data(data.year2011, function(d, i) {
					return d.country;
				});
				updateBars();
				break;
			case "2012":
				bars.data(data.year2012, function(d, i) {
					return d.country;
				});
				updateBars();
				break; 											 
			default:
				bars.data(data.year2012, function(d, i) {
					return d.country;
				});			
				updateBars();
				break;		
		}

	}

	/* 	When the CC or AC buttons are clicked update the count variable
		and call update bars */
	d3.selectAll(".count-select input").on("change", function() {
		count = this.value;
		/* Redraw the graph - taking into account the count choice */
		updateBars();
	});

	/* Event listner for when the user changes the adjust scale checkbox */
	d3.selectAll(".adjust-scale input").on("change", function() {
		adjustScaleCheck = d3.select(this).property("checked");

		/* Redraw the graph - taking into account the adjust scale choice */
		updateBars();
	});

	/* 	Define Y scale 
		Use the extent values to define a scale for the bar's height */
	var yScale = d3.scale.linear()
		.range([height , 0]);

	//Define Y axis
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickSize(3, 3)
		.orient("left");

	//Draw Y axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	  .append("g")
		.attr("class", "axisLabel")
	  .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin.left)
		.attr("x", -height/2)
		.attr("dy", ".9em")
		.style("text-anchor", "middle");						

	/* Define the X Ordinal Scale */
	var xScale = d3.scale.ordinal()
		.domain(data.year2012.map(function(d) { return d.country; }))
		.rangeRoundBands([margin.left,(width + margin.right)], 0.02);				

	//Define X axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.tickSize(3, 0)
		.orient("bottom");

	//Draw X axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + 0 + "," + (height + margin.top) + ")")
		.call(xAxis);			

	/*	Rotate the x axis text so that it is legible */
	d3.selectAll(".x text")
		.attr("text-anchor", "left")
		.attr("transform", function(d) {
			return "translate(" + (this.getBBox().width / 2 ) + "," + 2 + "), rotate( 45 " + this.getBBox().x + " " + this.getBBox().y + ")";
		});


	/*	Set up bars - one for each country in the chosen year */
	var bars = svg.selectAll("rect")
				.data(data.year2012, function(d, i) {
					return d.country;
				})
				.enter()
				.append("rect")
				.attr("width", xScale.rangeBand())
				.attr("x", function(d, i){
					return xScale(i); 
				})
				// .style("opacity", 0.75)
				.style("fill", allBars)
				.on("mouseover", function(d) {
					/* Get this bar's x/y values, then augment for the tooltip */
					// var xPosition = parseFloat(d3.select(this).attr("x")) + (xScale.rangeBand()/2);
					// var yPosition = parseInt(d3.select(this).attr("y") ) + (parseInt(d3.select(this).attr("height")) / 2);
					// var yPosition = d3.mouse(this)[1];
					var tooltipText = "";

					/*	Find out if we are displaying the cc or the ac value
						and add the correct text to the tooltipText var */
					switch (count) { 
						case "cc":
							switch (field) {
								case "all":
									tooltipText =  "cc: " +  d.cc;
									break;
								case "phys":
									tooltipText =  "cc: " +  d.ccPhys;						
									break;
								case "life":
									tooltipText =  "cc: " +  d.ccLife;	
									break;
								case "earth":
									tooltipText =  "cc: " +  d.ccEarth;	
									break;
								case "chem":
									tooltipText =  "cc: " +  d.ccChem;	
								break;
								default:
									tooltipText =  "cc: " +  d.cc;
									break;																	
							}
							break;

						case "ac":
							switch (field) {
								case "all":
									tooltipText =  "ac: " +  d.ac;
									break;
								case "phys":
									tooltipText =  "ac: " +  d.acPhys;
									break;
								case "life":
									tooltipText =  "ac: " +  d.acLife;
									break;
								case "earth":
									tooltipText =  "ac: " +  d.acEarth;
									break;
								case "chem":
									tooltipText =  "ac: " +  d.acChem;
									break;
								default:
									tooltipText =  "ac: " +  d.ac;
									break;																	
							}
							break;
						default:
							tooltipText =  "cc: " +  d.cc;
							break;		
					}


					/* Update the tooltip text */
					d3.select(".tooltip")
						.select(".value")
						.html(d.country + "<br /> " + tooltipText);

					var xPosition = parseInt(d3.select(this).attr("x")) - (parseInt($(".tooltip").css("width"))/2);
					var yPosition = parseInt(d3.select(this).attr("y") ) - (parseInt($(".tooltip").css("height"))) - 30;

					/* Update the tooltip position and value */
					d3.select(".tooltip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px");

					/* Show the tooltip */
					d3.select(".tooltip")
						.classed("hidden", false)
						.transition()
						.duration(duration)
						.style("opacity", 1);
				})
				.on("mouseout", function() {
					/* Hide the tooltip */
					d3.select(".tooltip")
						.transition()
						.duration(duration)
						.style("opacity", 0)
						.each("end", function() {
							d3.select(".tooltip").classed("hidden", true);
						});
				});

	/* Transition the height of the bars to the ac or the cc value */
	function updateBars() {

		/* Update the header */
		d3.select(".outer-wrapper #year").html([displayYear]);

		switch (count) { 
			case "cc":
				d3.select(".outer-wrapper #count").html(["Corrected count"]);
				displayCount = "Corrected count";
				break;
			case "ac":
				d3.select(".outer-wrapper #count").html(["Article count"]);
				displayCount = "Article count";
				break;
			default:
				d3.select(".outer-wrapper #count").html(["Corrected count"]);
				displayCount = "Corrected count";
			break;		
		}

		switch (field) {
			case "all":
				d3.select(".outer-wrapper #field").html(["All fields"]);
				displayField = "All fields";
				break;
			case "phys":
				d3.select(".outer-wrapper #field").html(["Physics"]);
				displayField = "Physics";
				break;
			case "life":
				d3.select(".outer-wrapper #field").html(["Life sciences"]);
				displayField = "Life sciences";
				break;
			case "earth":
				d3.select(".outer-wrapper #field").html(["Earth sciences"]);
				displayField = "Earth sciences";
				break;
			case "chem":
				d3.select(".outer-wrapper #field").html(["Chemistry"]);
				displayField = "Chemistry";
				break;
			default:
				d3.select(".outer-wrapper #field").html(["All fields"]);
				displayField = "All fields";
				break;																	
		}

		d3.selectAll(".y .axisLabel text")
			.text(displayCount + " " + displayYear + " " + displayField);

		switch (count) { 
			case "cc":
				yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
				
				switch (field) {
					case "all":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.cc;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.cc;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.cc;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.cc;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.style("fill", allBars)
							.attr("y", function(d){
								return margin.top + yScale(d.cc); 
							})
							.attr("height", function(d){
								return height - yScale(d.cc);
							});
						break;
					case "phys":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ccPhys;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ccPhys;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ccPhys;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ccPhys;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccPhys;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccPhys;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ccPhys); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ccPhys)
							});							
						break;
					case "life":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ccLife;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ccLife;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ccLife;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ccLife;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccLife;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccLife;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ccLife); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ccLife)
							});
						break;
					case "earth":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ccEarth;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ccEarth;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ccEarth;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ccEarth;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccEarth;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccEarth;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ccEarth); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ccEarth)
							});
						break;
					case "chem":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ccChem;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ccChem;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ccChem;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ccChem;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccChem;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ccChem;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ccChem); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ccChem)
							});						break;
					default:

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.cc;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.cc;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.cc;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.cc;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.cc); 
							})
							.attr("height", function(d){
								return height  - yScale(d.cc)
							});
						break;																	
				}
				break;

			case "ac":
				yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);

				switch (field) {
					case "all":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ac;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ac;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ac;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ac;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ac); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ac)
							});
						break;
					case "phys":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.acPhys;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.acPhys;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.acPhys;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.acPhys;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acPhys;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acPhys;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.acPhys); 
							})
							.attr("height", function(d){
								return height  - yScale(d.acPhys)
							});
						break;
					case "life":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.acLife;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.acLife;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.acLife;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.acLife;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acLife;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acLife;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.acLife); 
							})
							.attr("height", function(d){
								return height  - yScale(d.acLife)
							});
						break;
					case "earth":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.acEarth;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.acEarth;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.acEarth;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.acEarth;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acEarth;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acEarth;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.acEarth); 
							})
							.attr("height", function(d){
								return height  - yScale(d.acEarth)
							});
						break;
					case "chem":

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.acChem;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.acChem;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.acChem;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.acChem;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acChem;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.acChem;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.acChem); 
							})
							.attr("height", function(d){
								return height  - yScale(d.acChem)
							});
						break;
					default:

						if (adjustScaleCheck) {
							switch (displayYear) { 
								case "2008":
									yScale.domain([0, d3.max(data.year2008, function(d) { return d.ac;} )]);
									break;
								case "2009":
									yScale.domain([0, d3.max(data.year2009, function(d) { return d.ac;} )]);
									break;
								case "2010":
									yScale.domain([0, d3.max(data.year2010, function(d) { return d.ac;} )]);
									break;
								case "2011":
									yScale.domain([0, d3.max(data.year2011, function(d) { return d.ac;} )]);
									break;
								case "2012":
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);
									break; 											 
								default:
									yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);
									break;		
							}
						};

						bars.transition()
							.duration(duration)
							.delay(function(d, i) { 
								return i / numberOfBars * duration; 
							})
							.attr("y", function(d){
								return margin.top + yScale(d.ac); 
							})
							.attr("height", function(d){
								return height  - yScale(d.ac)
							});
						break;																	
				}
				break;
			default:
				if (adjustScaleCheck) {
					switch (displayYear) { 
						case "2008":
							yScale.domain([0, d3.max(data.year2008, function(d) { return d.cc;} )]);
							break;
						case "2009":
							yScale.domain([0, d3.max(data.year2009, function(d) { return d.cc;} )]);
							break;
						case "2010":
							yScale.domain([0, d3.max(data.year2010, function(d) { return d.cc;} )]);
							break;
						case "2011":
							yScale.domain([0, d3.max(data.year2011, function(d) { return d.cc;} )]);
							break;
						case "2012":
							yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
							break; 											 
						default:
							yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
							break;		
					}
				};

				bars.transition()
						.duration(duration)
						.delay(function(d, i) { 
							return i / numberOfBars * duration; 
						})
						.attr("y", function(d){
							return margin.top + yScale(d.cc); 
						})
						.attr("height", function(d){
							return height  - yScale(d.cc)
						});

			break;		
		}

		/* Call the Y axis to adjust it to the new scale */
		svg.select(".outer-wrapper .y")
			.transition()
			.duration(duration)
			.call(yAxis);


	}

	/* An inital call of updateCircles() to show the circles on page load */
	updateBars();

	/* Build the slider */
	makeYearSlider();


}





