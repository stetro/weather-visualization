$(function() {
	var FORECAST_API_KEY = "REMOVED";
	//$.getJSON("https://api.forecast.io/forecast/" + FORECAST_API_KEY + "/" + 50.937531 + "," + 6.960278600000038 + "?units=si&callback=?", function(data) {
	$.getJSON("data.json", function(data) {
		console.log(data)
			// settings
		var width = 575,
			height = 520,
			marginTop = 45,
			marginLeft = 25;

		// adding svg element to body and apply settings
		var container = d3.select("#diagram").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

		addButtons(data, container, 0);

		setCurrentWeatherInformation(data, "Cologne", container);
		setCurrentWeatherTemperatureGraph(data, container);
		addWeekdays(data, container);
	});

	function addButtons(data, container, activeIndex) {
		var buttonWidth = 90;
		var buttonHeight = 30;
		var buttonTop = 160;
		var buttonLeft = 225;

		function buttonClickEvent(d, i) {
			addButtons(data, container, i);
			switch (i) {
				case 0:
					setCurrentWeatherTemperatureGraph(data, container);
					break;
				case 1:
					setCurrentWeatherPrecipitationGraph(data, container);
					break;
				case 2:
					setCurrentWeatherWindGraph(data, container);
					break;
			}
		}
		
		container.selectAll("g.graph").remove();
		container.selectAll("g#buttons").remove();
		buttonContainer = container.append("g").attr("id", "buttons");
		buttonContainer.style("opacity", 0.0).transition().style("opacity", 1.0);
		
		// add buttons background and text
		var buttons = buttonContainer.selectAll("g.button")
			.data(["Temperature", "Precipitation", "Wind"])
			.enter()
			.append("g")
			.attr("class", function(d, i) {
				if (i == activeIndex) {
					return "button active";
				}
				return "button";
			});
		buttons.append("rect")
			.attr("width", buttonWidth)
			.attr("height", buttonHeight)
			.attr("y", buttonTop)
			.attr("x", function(d, i) {
				return i * buttonWidth + buttonLeft;
			})
			.on('click', buttonClickEvent);
		buttons.append("text")
			.text(function(d) {
				return d;
			})
			.attr("y", buttonTop + buttonHeight / 2 + 4)
			.attr("x", function(d, i) {
				return i * buttonWidth + buttonLeft + buttonWidth / 2;
			})
			.on('click', buttonClickEvent);
	}

	function mapWeatherToIconContent(iconName) {
		switch (iconName) {
			case "clear-day":
				return "\uf00d";
			case "clear-night":
				return "\uf02e";
			case "rain":
				return "\uf008";
			case "snow":
				return "\uf00a";
			case "sleet":
				return "\uf0b2";
			case "wind":
				return "\uf085";
			case "fog":
				return "\uf014";
			case "cloudy":
				return "\uf041";
			case "partly-cloudy-day":
				return "\uf002";
			case "partly-cloudy-night":
				return "\uf086";
			default:
				return "";
		}
	}

	function setCurrentWeatherPrecipitationGraph(data, container) {
		var chartHeight = 60;
		var chartPosition = 230;

		// remove current visualization if already available
		container.selectAll("g#precipitationgraph").remove();
		container = container.append("g").attr("id", "precipitationgraph").attr("class", "graph");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// linechart scales
		var precipAccessor = function(d) {
			return d.precipProbability;
		}

		var xScale = d3.time.scale().range([0, 525])
			.domain([
				moment.tz(data.hourly.data[0].time * 1000, data.timezone),
				moment.tz(data.hourly.data[23].time * 1000, data.timezone)
			]);
		var yScale = d3.scale.linear().range([0, chartHeight])
			.domain([
				d3.min(data.hourly.data.slice(0, 24), precipAccessor),
				d3.max(data.hourly.data.slice(0, 24), precipAccessor)
			]);

		// linechart axis
		var lookUpTable = data.hourly.data.slice(0, 24).map(function(d) {
			return moment.tz(d.time * 1000, data.timezone);
		});
		var xAxisTime = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						break;
					}
				}
				if (index < 23) {
					return moment.tz(d, data.timezone).format("HH:mm")
				}
				return "";
			});
		var xAxisPrecipitation = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				var precipProbability = data.hourly.data[index].precipProbability;
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						precipProbability = data.hourly.data[index].precipProbability;
						break;
					}
				}
				if (index < 23) {
					return numeral(precipProbability * 100).format('0') + "%";
				}
				return "";
			});

		// chart with rects
		var rects = container.selectAll("rect")
			.data(data.hourly.data.slice(0, 24))
			.enter();
		rects.append("rect")
			.attr("width", 22)
			.attr("height", function(d) {
				return yScale(d.precipProbability);
			})
			.attr("transform", function(d) {
				var x = xScale(moment.tz(d.time * 1000, data.timezone)) - (xScale(moment.tz(d.time * 1000, data.timezone)) / 18);
				var y = (chartHeight - yScale(d.precipProbability) + chartPosition);
				return "translate(" + x + ", " + y + ")";
			});
		rects.append("rect")
			.attr("width", 22)
			.attr("height", 1)
			.attr("class", "stroke")
			.attr("transform", function(d) {
				var x = xScale(moment.tz(d.time * 1000, data.timezone)) - (xScale(moment.tz(d.time * 1000, data.timezone)) / 18);
				var y = (-yScale(d.precipProbability) + chartHeight + chartPosition);
				return "translate(" + x + ", " + y + ")";
			});

		// draw axis
		container.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (chartPosition + 10 + chartHeight) + ")")
			.call(xAxisTime)
			.selectAll("text")
			.style("text-anchor", "start");
		container.append("g")
			.attr("class", "x axis precipitation")
			.attr("transform", "translate(0," + (chartPosition) + ")")
			.call(xAxisPrecipitation)
			.selectAll("text")
			.style("text-anchor", "start");;
	}

	function setCurrentWeatherWindGraph(data, container) {
		var chartHeight = 60;
		var chartPosition = 230;

		// remove current visualization if already available
		container.selectAll("g#windgraph").remove();
		container = container.append("g").attr("id", "windgraph").attr("class", "graph");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// linechart scales
		var windAccessor = function(d) {
			return d.windSpeed;
		}

		var xScale = d3.time.scale().range([0, 525])
			.domain([
				moment.tz(data.hourly.data[0].time * 1000, data.timezone),
				moment.tz(data.hourly.data[23].time * 1000, data.timezone)
			]);
		var yScale = d3.scale.linear().range([0, 3])
			.domain([
				d3.min(data.hourly.data.slice(0, 24), windAccessor),
				d3.max(data.hourly.data.slice(0, 24), windAccessor)
			]);

		// linechart axis
		var lookUpTable = data.hourly.data.slice(0, 24).map(function(d) {
			return moment.tz(d.time * 1000, data.timezone);
		});
		var xAxisTime = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						break;
					}
				}
				if (index < 23) {
					return moment.tz(d, data.timezone).format("HH:mm")
				}
				return "";
			});
		var xAxisWind = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				var windSpeed = data.hourly.data[index].windSpeed;
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						windSpeed = data.hourly.data[index].windSpeed;
						break;
					}
				}
				if (index < 23) {
					return numeral(windSpeed).format('0') + " km/h";
				}
				return "";
			});

		// chart with arrows
		var arrows = container.selectAll("text.arrow")
			.data(data.hourly.data.slice(0, 24).filter(function(d, i) {
				return ((i + 1) % 3) == 0 && (i < 23);
			}))
			.enter();
		arrows.append("text")
			.attr("class", "arrow")
			.text("\uf058")
			.attr("style", function(d) {
				var em = 1.0;
				em = em + yScale(d.windSpeed);
				return "font-size: " + em + "em";
			})
			.attr("transform", function(d) {
				var x = xScale(moment.tz(d.time * 1000, data.timezone)) + 25;
				var y = chartPosition + 40;
				return "translate(" + x + ", " + y + ") rotate(" + d.windBearing + ")";
			});

		// draw axis
		container.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (chartPosition + 10 + chartHeight) + ")")
			.call(xAxisTime)
			.selectAll("text")
			.style("text-anchor", "start");
		container.append("g")
			.attr("class", "x axis wind")
			.attr("transform", "translate(0," + (chartPosition) + ")")
			.call(xAxisWind)
			.selectAll("text")
			.style("text-anchor", "start");;
	}

	function setCurrentWeatherTemperatureGraph(data, container) {
		var chartHeight = 60;
		var chartPosition = 230;

		// remove current visualization if already available
		container.selectAll("g#temperaturegraph").remove();
		container = container.append("g").attr("id", "temperaturegraph").attr("class", "graph");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// linechart scales
		var temperatureAccessor = function(d) {
			return d.temperature;
		}

		var xScale = d3.time.scale().range([0, 525])
			.domain([
				moment.tz(data.hourly.data[0].time * 1000, data.timezone),
				moment.tz(data.hourly.data[23].time * 1000, data.timezone)
			]);
		var yScale = d3.scale.linear().range([0, chartHeight])
			.domain([
				d3.max(data.hourly.data.slice(0, 24), temperatureAccessor),
				d3.min(data.hourly.data.slice(0, 24), temperatureAccessor) - 5
			]);

		// linechart axis
		var lookUpTable = data.hourly.data.slice(0, 24).map(function(d) {
			return moment.tz(d.time * 1000, data.timezone);
		});
		var xAxisTime = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						break;
					}
				}
				if (index < 23) {
					return moment.tz(d, data.timezone).format("HH:mm")
				}
				return "";
			});
		var xAxisTemperature = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(d3.time.hours, 3)
			.outerTickSize(0)
			.tickFormat(function(d) {
				var index = 0
				var temperature = data.hourly.data[index].temperature;
				for (index = 0; index < 24; index++) {
					if (moment(d).isSame(lookUpTable[index])) {
						temperature = data.hourly.data[index].temperature;
						break;
					}
				}
				if (index < 23) {
					return numeral(temperature).format('0') + "\u00B0";
				}
				return "";
			});

		// chart with line and background area
		var line = d3.svg.line().interpolate("basis")
			.x(function(d) {
				return xScale(moment.tz(d.time * 1000, data.timezone));
			})
			.y(function(d) {
				return yScale(d.temperature);
			});
		var area = d3.svg.area().interpolate("basis")
			.x(function(d) {
				return xScale(moment.tz(d.time * 1000, data.timezone));
			})
			.y0(chartHeight)
			.y1(function(d) {
				return yScale(d.temperature);
			});

		// draw both
		container.append("path")
			.datum(data.hourly.data.slice(0, 24))
			.attr("class", "area")
			.attr("d", area)
			.attr("transform", "translate(0," + chartPosition + ")");
		container.append("path")
			.datum(data.hourly.data.slice(0, 24))
			.attr("class", "line")
			.attr("d", line)
			.attr("transform", "translate(0," + chartPosition + ")");

		// draw axis
		container.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (chartPosition + 10 + chartHeight) + ")")
			.call(xAxisTime)
			.selectAll("text")
			.style("text-anchor", "start");
		container.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (chartPosition) + ")")
			.call(xAxisTemperature)
			.selectAll("text")
			.style("text-anchor", "start");;
	}

	function addWeekdays(data, container) {
		var dayPosition = 340;

		// remove current visualization if already available
		container.selectAll("g#weekdays").remove();
		container = container.append("g").attr("id", "weekdays");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		var dayWidth = 65;

		// days
		var day = container.selectAll("g")
			.data(data.daily.data)
			.enter()
			.append("g");

		// highlight
		day.append("rect")
			.attr("class", "dayRect")
			.attr("x", function(day, index) {
				return index * dayWidth;
			})
			.attr("y", dayPosition)
			.attr("width", dayWidth)
			.attr("height", 100);

		// day name
		day.append("text")
			.text(function(day) {
				return moment.tz(day.time * 1000, data.timezone).format("dd.")
			})
			.attr("class", "dayName")
			.attr("y", dayPosition + 20)
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});

		// day icon
		day.append("text")
			.text(function(day) {
				return mapWeatherToIconContent(day.icon);
			})
			.attr("class", "dayIcon")
			.attr("y", dayPosition + 65)
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});

		// day temperatures
		var dayTemperatures = day.append("text")
			.attr("y", dayPosition + 90)
			.attr("class", "dayTemperatures")
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});
		dayTemperatures.append("tspan")
			.text(function(day) {
				return numeral(day.temperatureMax).format('0') + "\u00B0"
			})
			.attr("class", "dayTemperatureMax");
		dayTemperatures.append("tspan")
			.text(function(day) {
				return numeral(day.temperatureMin).format('0') + "\u00B0"
			})
			.attr("dx", 4)
			.attr("class", "dayTemperatureMin");
	}

	function setCurrentWeatherInformation(data, location, container) {
		var detailPosition = 90;
		// remove current visualization if already available
		container.selectAll("g#current").remove();
		container = container.append("g").attr("id", "current");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// title
		container.append("text")
			.attr("class", "title")
			.attr("x", 0)
			.attr("y", 0)
			.text(location);

		// summary
		var summary = container.append("text")
			.attr("class", "summary")
			.attr("x", 0)
			.attr("y", 25);
		summary.append("tspan")
			.attr("x", 0)
			.text(moment.tz(data.currently.time * 1000, data.timezone).format('dddd, HH:mm'));
		summary.append("tspan")
			.attr("x", 0)
			.attr("dy", "1.4em")
			.text(data.currently.summary);

		// detail
		var detail = container.append("text")
			.attr("class", "detail")
			.attr("x", 225)
			.attr("y", detailPosition);
		detail.append("tspan")
			.attr("x", 225)
			.text("Precipitation: " + numeral(data.currently.precipIntensity * 100).format('0.0') + "%");
		detail.append("tspan")
			.attr("x", 225)
			.attr("dy", "1.4em")
			.text("Humidity: " + numeral(data.currently.humidity * 100).format('0.0') + "%");
		detail.append("tspan")
			.attr("x", 225)
			.attr("dy", "1.4em")
			.text("Windspeed: " + numeral(data.currently.windSpeed).format('0.0') + " km/h");

		// weather icon
		var icon = container.append("text")
			.attr("class", "icon")
			.attr("x", 0)
			.attr("y", detailPosition + 30)
			.text(mapWeatherToIconContent(data.currently.icon));

		// degree 
		var degree = container.append("text")
			.attr("x", 80)
			.attr("y", detailPosition + 30);
		degree.append("tspan")
			.attr("class", "degree")
			.text(numeral(data.currently.temperature).format('0'));
		degree.append("tspan")
			.attr("class", "unit")
			.attr("dy", "-1.6em")
			.attr("dx", "0.5em")
			.text("C\u00B0");
	}

});