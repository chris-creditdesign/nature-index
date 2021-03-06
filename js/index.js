(function($) {
/*	Margin, Width and height */
var margin = {top: 30, right: 40, bottom: 15, left: 58};
var width = 940  - margin.left - margin.right;
var height = 350 - margin.top - margin.bottom;
/*	Global variable to control the length of D3 transitons */
var duration = 450;
/*	Global variable to hold the cc or ac choice */
var count = "ac"
/*	Global variable to hold the cc or ac choice */
var field = "all"
/*	Global variable to control which year to disylay */
var displayYear = "2012";
/*	Global Array to hold all the data we currently want to display */
var displayArray = [];
var sortArray = [];
var yearArray = [];
var checkArray = [];
/*	Arrays used to build the country and continent checkboxes */
var continentArray = [];
var uniqueContinentArray = ["All"];

var totalBarArray = [];
var addingBars = true;
/*	Global variables to control field and count text in axis label */
var displayCount = "Corrected count";
var displayField = "All fields";
/*	Colours for the bars */
var allBars = ["#1abc9c","#27ae60","#3498db","#5959b7","#34495e"];
			
/*	Create SVG element */
var svg = d3.select(".count-chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

/* Add a group for each row the text */
var blocks = svg.append("g");

/* Add a group for each row the text */
var groups = svg.append("g")
	.attr("class", "x axis")

/* Create JqueryUI buttons */
function buildUIelements() {
	$( "#check" ).button();
	$( ".count-select" ).buttonset();
	$( ".select-field" ).buttonset();
};

/* Create custom checkboxes */
function setupLabel() {
	var checkBox = ".checkbox";
	var checkBoxInput = checkBox + " input[type='checkbox']";
	var checkBoxChecked = "checked";

	if ($(checkBoxInput).length) {
		$(checkBox).each(function(){
			$(this).removeClass(checkBoxChecked);
		});
		$(checkBoxInput + ":checked").each(function(){
			$(this).parent(checkBox).addClass(checkBoxChecked);
		});
    };
};

/*	Function to sort data.year200X by country name */
function compareCountry(a,b) {
  if (a.country < b.country)
     return -1;
  if (a.country > b.country)
    return 1;
  return 0;
}

/*	Load in JSON data then call draw() */
d3.json('data/ranking-country-global.json', draw);

/*	The draw function is called only once the JSON file has fully loaded 
	and is responsible for building the barchart */
function draw(data) {

	/*	We know that javascript is enabled and that we are not in IE 6-8
		so hide the error message and show outer-wrapper */
	$(".outer-wrapper").css({"display":"block"});
	$(".status-message").css({"display":"none"});

	/* store this number to use to create a staggered transition */
	var numberOfBars = data.year2008.length;

	totalBarArray.push(numberOfBars);

	/*	Create an array containing each continent and the use $.each and $.inArray
		to remove all duplicates. The result will be stored in uniqueContinentArray */
	continentArray = data.year2008.map(function(d) { return d.continent; });

	$.each(continentArray, function(i, el){
		if($.inArray(el, uniqueContinentArray) === -1) {
			uniqueContinentArray.push(el);
		}
	});

	/* Create checkboxes for each continent inside the continent-select form */
	d3.selectAll(".continent-select")
		.selectAll("label")
		.data(uniqueContinentArray.sort())
		.enter()
		.append("label")
		.attr("class", "checkbox")
		.html(function (d) {
			var continentString = d.replace(/_/g, ' ');
    		return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots " + d +  "'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></svg></span><input type='checkbox' value='" + d + "' data-continent='" + d + "' checked>" + continentString;
		});


	/* Create checkboxes for each country inside the country-select form */
	d3.selectAll(".country-select")
		.selectAll("label")
		.data(data.year2008.slice(0).sort(compareCountry))
		.enter()
		.append("label")
		.attr("class", "checkbox")
		.html(function (d) {
			var countryString = d.country.replace(/_/g, ' ');
    		return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></svg></span><input type='checkbox' value='" + d.country + "' data-continent='" + d.continent + "' checked>" + countryString + " (" + d.countryCode + ")";
		});

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
				updateDisplayArray()
			}
		});
		$( ".select-year" ).change(function() {
			slider.slider( "value", this.selectedIndex + 1 );
		});
	};

	/*	When a field button is clicked update the field variable to represent the selected 
		field and call updateDisplayArray() */
	d3.selectAll(".select-field input").on("change", function(){
		field = this.value;
		updateDisplayArray();
	});

	/* 	When the CC or AC buttons are clicked update the count variable
		and call updateDisplayArray() */
	d3.selectAll(".count-select input").on("change", function() {
		count = this.value;
		updateDisplayArray();
	});

	/*	Call updateDisplayArray() when one of the country checkboxes is clicked */
	d3.selectAll(".country-select input").on("change", updateDisplayArray);

	/*	Call updateContinent() when one of the continent checkboxes is clicked */
	d3.selectAll(".continent-select input").on("change", updateContinent);	

	/*	Set up bars - one for each country in the chosen year */
	svg.selectAll("rect")
				.data(data.year2012, function(d, i) {
					return d.country;
				})
				.enter()
				.append("rect")
				.attr("width", 0)
				.attr("x", 0)
				.attr("height", 0)
				.attr("y", 0);

	/* 	Define Y scale range to go from height to 0
		Do not define the domaine yet */
	var yScale = d3.scale.linear()
		.range([height , 0]);

	/*	Define Y axis */
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickSize(3, 3)
		.orient("left");

	/*	Prepare the Y axis but do not call .call(yAxis) yet */
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

	var xScale = d3.scale.ordinal()
		.domain(d3.range(data.year2012.length))
		.rangeRoundBands([margin.left,(width + margin.right)], 0.1);

	/*	Function called when a continent button is clicked to turn on and off groups of countries */
	function updateContinent() {
		var thisContinent = $(this).val();

		if ( thisContinent === "All" ) {
			$(".continent-select input").prop("checked", $(this).prop("checked"));
			$(".country-select input").prop("checked", $(this).prop("checked"));
		} else {
			/*	Loop through the countries, if the data attribute for continent matches the
				value of the continent check box then make its propenty "checked" match the 
				continent checkbox calling the function i.e. turn it on or off */
			for (var i = 0; i < $(".country-select input").length; i++) {
				var checkBoxes = $(".country-select input").eq(i);

				if (thisContinent === checkBoxes.data('continent') ) {
					checkBoxes.prop("checked", $(this).prop("checked"));
				}
				
			};
		}

		updateDisplayArray();
	}			

	/*	function called to copy the relevant year's data into the displayArray array
		then add a property called choice that holds the relevant count and field value */
	function updateDisplayArray() {

		/* First remove the existing data from the arrays */
		while (displayArray.length > 0) {
			displayArray.shift();
			} 

		while (yearArray.length > 0) {
			yearArray.shift();
			} 

		while (checkArray.length > 0) {
			checkArray.shift();
			} 

		while (sortArray.length > 0) {
			sortArray.shift();
			} 

		while (sortArray.length > 0) {
			sortArray.shift();
			} 

		switch (displayYear) { 
			case "2008":
				yearArray = data.year2008.slice(0);
				break;
			case "2009":
				yearArray = data.year2009.slice(0);
				break;
			case "2010":
				yearArray = data.year2010.slice(0);
				break;
			case "2011":
				yearArray = data.year2011.slice(0);
				break;
			case "2012":
				yearArray = data.year2012.slice(0);
				break; 											 
			default:
				yearArray = data.year2012.slice(0);
				break;		
		}


		for (var i = 0; i < yearArray.length; i++) { 
				checkArray.push({});
		}

		for (var i = 0; i < checkArray.length; i++) {
			checkArray[i].country = yearArray[i].country;
			checkArray[i].countryCode = yearArray[i].countryCode;
			checkArray[i].continent = yearArray[i].continent;
		};

		if (count === "cc") {
			switch (field) {
				case "all":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].cc;
					};
					break;
				case "phys":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccPhys;
					};				
					break;
				case "life":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccLife;
					};
					break;
				case "earth":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccEarth;
					};
					break;
				case "chem":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccChem;
					};
				break;
				default:
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].cc;
					};										
			}
		} else if (count === "ac"){
			switch (field) {
				case "all":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ac;
					};
					break;
				case "phys":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acPhys;
					};				
					break;
				case "life":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acLife;
					};
					break;
				case "earth":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acEarth;
					};
					break;
				case "chem":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acChem;
					};
				break;
				default:
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ac;
					};										
			}
		};

		/*	Find out if each country is checked and if so copy their
			object from checkArray into displayArray */
		for (var i = 0; i < checkArray.length; i++) {
			var countryName = checkArray[i].country;

			if (d3.select(".country-select [value=" + countryName + "]").property("checked")) {
				displayArray.push(checkArray[i]);
			}
		};

		/*	Sort displayArray into the descending order 
			If the contries happen to have the same value for choice then they are sorted into alphabetical order */
		displayArray.sort(function(a, b) {
				if (b.choice < a.choice) {
					return -1;
				}
				else if (b.choice > a.choice) {
					return 1;
				} else if (b.choice === a.choice) {
					return a.country < b.country ? -1 : a.country > b.country ? 1 : 0;
				}
			})

		updateBars();
		updateHeader();
		setupLabel();
	}


	/* Transition the height of the bars to the ac or the cc value */
	function updateBars() {

		/*	Update the yScale domain the current highest value */
		yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);

		/*	Make sure that the bars don't get too fat by keeping the xScale range above 5 */
		if (displayArray.length > 5) {
			xScale.domain(d3.range(displayArray.length));
		} else {
			xScale.domain(d3.range(5));
		};		

		/*	Pass the new display array data to bars */
		var bars = blocks.selectAll("rect")
				.data(displayArray, function(d, i) {
					return d.country;
				});


		/*	Find out if bars are being taken away if so  addingBars = false; 
			in order to alter the delay of the exiting bars	*/
		totalBarArray.push(bars[0].length);

		if ( totalBarArray.slice(-2)[1] >= totalBarArray.slice(-2)[0] ) {
			addingBars = true;
		} else {
			addingBars = false;
		}

		totalBarArray.shift();

		/* Enter… */
		bars.enter()
			.append("rect")
			.attr("x", function(d, i){
				return xScale(i); 
			})
			.attr("width", xScale.rangeBand())
			.attr("y", height + margin.top)
			.attr("height", 0 )
			.attr("opacity",0.8)
			.attr("fill", function(d, i){
				switch (d.continent) {
					case "Australasia" :
						return allBars[0];
						break;
					case "North_America" :
						return allBars[1];
						break;							 
					case "Asia" :
						return allBars[2];
						break;	
					case "Europe" :
						return allBars[3];
						break;
					case "SAmerica" :
						return allBars[4];
						break;
					default:
						return allBars[0];
				}
			});

		/* 	Update… */
		bars.transition()
			.duration(duration)
			.delay(function() {
				if (!addingBars) {
					return duration; 
				} else {
					return 0;
				}
			})
			.attr("x", function(d, i){
				return xScale(i); 
			})
			.attr("width", xScale.rangeBand())
			.attr("y", function(d){
				return margin.top + yScale(d.choice); 
			})
			.attr("height", function(d){
				return height - yScale(d.choice);
			});	

		/*	Exit… */
		bars.exit()
			.transition()
			.duration(duration)
			.attr("x", function(d, i){
				return d3.select(this).attr("x"); 
			})
			.attr("width", function(d, i){
				return d3.select(this).attr("width"); 
			})
			.attr("y", height + margin.top)
			.attr("height", 0 )	
			.remove();


		/*	Repeat the bars Enter, Update and Exit for the text lables */
		var text = groups.selectAll("text")
				.data(displayArray, function(d, i) {
					return d.country;
				});

		/* Enter… */
		text.enter()
			.append("text")
			.attr("x", function(d, i){
				return xScale(i) + (xScale.rangeBand() / 2); 
			})
			.attr("y", function(d){
				return height + margin.top;
			})
			.attr("text-anchor", "middle")
			.text(function(d) { return d.countryCode; });

		/* 	Update… */
		text.transition()
			.duration(duration)
			.delay(function() {
				if (!addingBars) {
					return duration; 
				} else {
					return 0;
				}
			})
			.attr("x", function(d, i){
				return xScale(i) + (xScale.rangeBand() / 2); 
			})
			.attr("y", function(d){
				return margin.top + yScale(d.choice) - 2; 
			});

		/*	Exit… */
		text.exit()
			.transition()
			.duration(duration)
			.attr("x", function(d, i){
				return d3.select(this).attr("x"); 
			})
			.attr("y", height + margin.top)
			.remove();

		/* Call the Y axis to adjust it to the new scale */
		svg.select(".outer-wrapper .y")
			.transition()
			.duration(duration)
			.call(yAxis);
			
		/*	Extract the info needed to build the tooltip
			and send it to the makeTooltip function */
		bars.on("mouseover", function(d) {
				
				var country = d.country;
				var choice = d.choice;
				var x = d3.select(this).attr("x");
				var y = d3.select(this).attr("y");

				/*	Hover colour applied with javascript rather than CSS
					so that it can be trigged by the text too */
				d3.select(this)
					.attr("fill","#f1c40f");

				makeTooltip(country,choice,x,y);
			})
			.on("mouseout", function(d,i) {
				/* Return the bar to it's continent colour */
				d3.select(this).attr("fill", function(d, i){
					switch (d.continent) {
						case "Australasia" :
							return allBars[0];
							break;
						case "North_America" :
							return allBars[1];
							break;							 
						case "Asia" :
							return allBars[2];
							break;	
						case "Europe" :
							return allBars[3];
							break;
						case "SAmerica" :
							return allBars[4];
							break;
						default:
							return allBars[0];
					}
				});

				/* Hide the tooltip */
				hideTooltip()
			});

		/* Add the mouseover behaviour to the text to increase the target area */
		text.on("mouseover", function(d, i) {

				var country = d.country;
				var choice = d.choice;
				var x = d3.select(bars[0][i]).attr("x");
				var y = d3.select(bars[0][i]).attr("y");

				d3.select(bars[0][i])
					.attr("fill","#f1c40f");

				makeTooltip(country,choice,x,y);
			})
			.on("mouseout", function(d,i) {

				d3.select(bars[0][i]).attr("fill", function(d, i){
					switch (d.continent) {
						case "Australasia" :
							return allBars[0];
							break;
						case "North_America" :
							return allBars[1];
							break;							 
						case "Asia" :
							return allBars[2];
							break;	
						case "Europe" :
							return allBars[3];
							break;
						case "SAmerica" :
							return allBars[4];
							break;
						default:
							return allBars[0];
					}
				});

				/* Hide the tooltip */
				hideTooltip()
			});

	}

	function makeTooltip(country,choice,x,y) {

		/*	Create a var to hold the tooltip text string */
		var tooltipText = "";
		var countryString = country.replace(/_/g, ' ');

		/*	Find out if we are displaying the cc or the ac value
			and add the correct text to the tooltipText var */
		count === "cc" ? tooltipText =  "cc: " +  choice.toFixed(2) : tooltipText =  "ac: " +  choice;

		/* Update the tooltip text */
		d3.select(".tooltip")
			.select(".value")
			.html(countryString + "<br /> " + tooltipText);

		/* Get this bar's x/y values, then augment for the tooltip */
		var xPosition = parseInt(x) - (parseInt($(".tooltip").css("width"))/2);
		var yPosition = parseInt(y) - (parseInt($(".tooltip").css("height"))) - 43;

		/* Update the tooltip position and value */
		d3.select(".tooltip")
			.style("left", xPosition + "px")
			.style("top", yPosition + "px");

		/* Show the tooltip */
		d3.select(".tooltip")
			.classed("hidden", false)
			.transition()
			.duration(duration/2)
			.style("opacity", 1);

	}

	function hideTooltip() {
		d3.select(".tooltip")
			.transition()
			.duration(duration/2)
			.style("opacity", 0)
			.each("end", function() {
				d3.select(".tooltip").classed("hidden", true);
			});
	}

	function updateHeader() {
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
	}

	/* Build the slider */
	makeYearSlider();

	/* An inital call of updateDisplayArray()  */
	updateDisplayArray();

	/* Build the jQueryUI elements */
	buildUIelements();

	/* Build the custom checkboxes */
	setupLabel();

}
})(jQuery);




