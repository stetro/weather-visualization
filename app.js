$(function() {
	d3.json("data.json", function(error, data) {

		var width = 860,
			height = 600,
			radius = Math.min(width, height) / 2 - 60;

		var degree = d3.scale.linear()
			.domain([-30, 35])
			.range([0, radius]);

		var rainfall = d3.scale.linear()
			.domain([0.0, 30.0])
			.range([0, 35])

		var time = d3.time.scale()
			.domain([new Date(2015, 0, 1), new Date(2015, 11, 31)])
			.range([-90, 270]);

		var months = time.ticks(d3.time.month);
		var days = time.ticks(d3.time.day);
		var colors = tinygradient(
			[{
				color: 'blue',
				pos: 0.5
			}, {
				color: 'green',
				pos: 0.52
			}, {
				color: 'yellow',
				pos: 0.6
			}, {
				color: 'red',
				pos: 0.8
			}]).rgb(Math.floor(radius), true);
		var line = d3.svg.line.radial()
			.radius(function(d) {
				return degree(d[1]);
			})
			.angle(function(d) {
				return -d[0] + Math.PI / 2;
			});

		var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var degreeAxis = svg.append("g")
			.attr("class", "r axis")
			.selectAll("g")
			.data(degree.ticks(5).slice(1))
			.enter().append("g");

		degreeAxis.append("circle")
			.attr("r", degree);

		degreeAxis.append("text")
			.attr("y", function(d) {
				return -degree(d) - 4;
			})
			.attr("transform", "rotate(15)")
			.style("text-anchor", "middle")
			.text(function(d) {
				return d + "°";
			});

		var monthAxis = svg.append("g")
			.attr("class", "a axis month")
			.selectAll("g")
			.data(months)
			.enter().append("g")
			.attr("transform", function(d) {
				return "rotate(" + time(d) + ")";
			});

		monthAxis.append("line")
			.attr("x2", radius);

		monthAxis.append("text")
			.attr("x", radius + 6)
			.attr("dy", ".35em")
			.style("text-anchor", function(month) {
				d = time(month);
				return d < 270 && d > 90 ? "end" : null;
			})
			.attr("transform", function(month) {
				d = time(month);
				return d < 270 && d > 90 ? "rotate(180 " + (radius + 6) + ",0)" : null;
			})
			.text(function(month) {
				return moment(month).format('MMM');
			});



		var dayPlot = svg.append("g")
			.attr("class", "a day")
			.selectAll("g")
			.data(days)
			.enter().append("g")
			.attr("transform", function(day) {
				return "rotate(" + time(day) + ")";
			});

		dayPlot.append("circle")
			.attr("cx", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].temperature - 4.0);
			})
			.attr("r", function(day) {
					day = moment(day);
				return rainfall(data[day.format('MM')][day.format('DD')].rainfall);
			})

		dayPlot.append("line")
			.attr("x2", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].temperature - 8.0);
			})
			.attr("x1", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].temperature);
			})
			.attr("style", function(day) {
				day = moment(day);
				return "stroke:" + colors[Math.floor(degree(data[day.format('MM')][day.format('DD')].temperature))] + " ;"
			});

	});
});