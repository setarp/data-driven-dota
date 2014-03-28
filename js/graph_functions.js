//Angela Fan

//data global
var user_data;

//margins and bounding boxes for each graph visualization
var bb_win_loss, bb_hero_pie, bb_item_percent;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;

var height = 800 - margin.bottom - margin.top;

bb_win_loss = {
    x: 0,
    y: 0,
    w: 250,
    h: 30
};

bb_hero_pie = {
    x: 0,
    y: 100,
    w: 300,
    h: 300
};

bb_item_percent = {
    x: 400,
    y: 0,
    w: 600,
    h: 300
};

//set up those boxes
svg = d3.select("#stat_graphs").append("svg").attr({
	width: width + margin.left + margin.right,
	height: height + margin.bottom + margin.top
})
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var win_loss_graph = svg.append("g")
	.attr("class", "win_loss")
	.attr("visibility", "hidden")
	.attr("transform", "translate(" + bb_win_loss.x + "," + bb_win_loss.y + ")");

var hero_pie_graph = svg.append("g")
	.attr("class", "hero_pie")
	.attr("transform", "translate(" + (bb_hero_pie.x + (bb_hero_pie.w / 2)) + "," + (bb_hero_pie.y+(bb_hero_pie.h / 2 + 10)) + ")");;

var item_percent_graph = svg.append("g")
	.attr("class", "item_percent")
	.attr("visibility", "hidden")
	.attr("transform", "translate(" + bb_item_percent.x + "," + bb_item_percent.y + ")");;

var item_percent_x, item_percent_y, item_percent_xAxis, item_percent_yAxis, item_percent_color;

//tool tip setup
var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0,0]);

svg.call(tip);

//function calls
loadData("david");

draw_win_loss();

draw_item_percent();

function loadData(username) {
	 
	d3.json("../data/" + username + "_match_details.json", function(error,data) {

        //we want to look at the radiant win variable and indicate if our user won or lost
        //we want to pull out their player array 
        data.matches.forEach(function(d,i) {
            our_player = d.players.filter(function(e) {
                return (e.account_id == data.id32)
            })
            //pull out player array
            d.player_info = our_player[0];

            //figure out if player was on radiant or dire
            if (d.player_info.player_slot&128) {
                d.player_side = "dire";
            }
            else {
                d.player_side = "radiant";
            }

            //figure out if the player won or lost based on his/her side
            if ((d.player_side == "radiant" && d.radiant_win == true) ||
            	(d.player_side == "dire" && d.radiant_win == false)) {
                d.player_win = true;
            }
            else {
                d.player_win = false;
            }

        })

        user_data = data;

        update_win_loss(user_data);

        update_item_percent(user_data);

        create_flare(data);

    })
}


function draw_win_loss() {

	win_loss_graph.append("rect")
			.attr("width", bb_win_loss.w)
			.attr("height", bb_win_loss.h)
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "loss")

	win_loss_graph.append("rect")
			.attr("width", bb_win_loss.w/2)
			.attr("height", bb_win_loss.h)
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "win")

	win_loss_graph
			.append("text")
			.attr("x", 5)
			.attr("y", 20)
			.attr("class", "win text")
			.attr("text-anchor", "start")
			.text("HWELLO!!!")
			.style("fill", "black");

	win_loss_graph
			.append("text")
			.attr("x", 245)
			.attr("y", 20)
			.attr("class", "loss text")
			.attr("text-anchor", "end")
			.text("HWELLO!!!")
			.style("fill", "black");

	win_loss_graph.append("text")
			.attr("transform", "translate(130,-10)")
			.attr("text-anchor", "middle")
			.text("Win-Loss Percentage")
			.style("font-weight", null);
}


function update_win_loss(data) {

	var win_count = 0;
	var total_matches = data.matches.length;

	data.matches.map(function(d,i) {
		if (d.player_win == true) {
			win_count += 1;
		}
	});

	if (d3.select(".win_loss").attr("visibility") == "hidden") {
		var duration = 0;
	}
	else {
		duration = 250;
	}

	d3.select(".win")
		.transition()
		.duration(duration)
		.attr("width", (win_count/total_matches)*bb_win_loss.w)
		
	d3.select(".win.text")
		.text(((win_count/total_matches) * 100).toFixed(1) + "%");

	d3.select(".loss.text")
		.text(String((total_matches - win_count)/total_matches * 100) + "%");

	d3.select(".win_loss")
		.attr("visibility", null);

}


function capitalizeFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function hero_pie(data) {

	var radius = Math.min(bb_hero_pie.w, bb_hero_pie.h) / 2;

	var color = d3.scale.ordinal()
				.domain(["flare","agility", "strength", "intelligence"])
				//get them to be the correct dota colors
				.range(["white", "#2BAC00", "#E38800","#1A88FC"])
				//.range(["white","#167c13", "#b9500b", "#257dae"]);

	var x = d3.scale.linear()
    	.range([0, 2 * Math.PI]);

	var y = d3.scale.sqrt()
	    .range([0, radius]);

	var partition = d3.layout.partition()
    	.value(function(d) { return d.count; });

	var arc = d3.svg.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	var path = hero_pie_graph.selectAll("path")
	      	.data(partition.nodes(data))
	    .enter().append("path")
		    .attr("d", arc)
		    .attr("class", "hero_pie")
		    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
		    .on("click", click)
		    .on("mouseover", function(d) {
		    	var tooltip = true;

		    	var name;
		    	var number_text;

		    	if (d.value == 1) {
		    		number_text = " game";
		    	}
		    	else {
		    		number_text = " games"
		    	}

		    	if ("localized_name" in d) {
		    		name = d.localized_name;
		    	}
		    	else if (d.name == "flare") {
		    		tooltip = false
		    	}
		    	else {
		    		name = capitalizeFirstLetter(d.name) + " Heroes";
		    	}
		    
		    	tip.html("<strong>"+name +"</strong>"+ "<br>" + d.value + number_text + "</br>");

		    	if (tooltip) {
		    		tip.show(d);
		    	}

		    	d3.select(this)
		    		.style("fill", "#476291");
		    })
		    .on("mouseout", function(d) {
		    	tip.hide(d);

		    	d3.select(this)
		    		.style("fill", function(d) { return color((d.children ? d : d.parent).name); });
		    });

	function click(d) {
	    path.transition()
	      .duration(750)
	      .attrTween("d", arcTween(d));
  	}

	d3.select(self.frameElement).style("height", height + "px");

	// Interpolate the scales!
	function arcTween(d) {
	  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
	      yd = d3.interpolate(y.domain(), [d.y, 1]),
	      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	  return function(d, i) {
	    return i
	        ? function(t) { return arc(d); }
	        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
	  };
	}

	hero_pie_graph.append("text")
		.attr("text-anchor", "middle")
		.attr("y", -bb_hero_pie.h/2 - 10)
		.text("Heroes Played")

}

function create_flare(data) {
	
	hero_flare = {};

	hero_flare.name = "flare"
	hero_flare.children = [{},{},{}];

	hero_flare.children[0].name = "agility";
	hero_flare.children[1].name = "strength";
	hero_flare.children[2].name = "intelligence";

	hero_flare.children[0].children = [];
	hero_flare.children[1].children = [];
	hero_flare.children[2].children = [];

	d3.json("../data/heroes.json", function(error,dat) {

		dat.result.heroes.forEach(function(d,i) {
			d.count = 0;

			if (d.stat == "agility") {
				hero_flare.children[0].children.push(d)
			}

			if (d.stat == "strength") {
				hero_flare.children[1].children.push(d);
			}

			if (d.stat == "intelligence") {
				hero_flare.children[2].children.push(d);
			}

		})

		data.matches.forEach(function(d,i) {


			current_hero_stat = d2.getHeroStat(d.player_info.hero_id);

			if (current_hero_stat == "agility") {
				var cur = hero_flare.children[0].children;
				for (var i=0; i < cur.length; i++) {
					if (cur[i].localized_name == d2.getHeroName(d.player_info.hero_id)) {
						cur[i].count += 1;
					}
				}
			}

			if (current_hero_stat == "strength") {
				var cur = hero_flare.children[1].children;
				for (var i=0; i < cur.length; i++) {
					if (cur[i].localized_name == d2.getHeroName(d.player_info.hero_id)) {
						cur[i].count += 1;
					}
				}

			}

			if (current_hero_stat == "intelligence") {
				var cur = hero_flare.children[2].children;
				for (var i=0; i < cur.length; i++) {
					if (cur[i].localized_name == d2.getHeroName(d.player_info.hero_id)) {
						cur[i].count += 1;
					}
				}

			}

		})
	
		hero_pie(hero_flare);

	})
}

function draw_item_percent() {

	var formatPercent = d3.format(".0%");

	item_percent_color = d3.scale.linear();

	item_percent_x = d3.scale.ordinal()
			.rangeRoundBands([0, bb_item_percent.w], .1 ,1)
			.domain(["item1"]);

	item_percent_y = d3.scale.linear()
			.range([bb_item_percent.h,0])

	item_percent_xAxis = d3.svg.axis()
				.scale(item_percent_x)
				.orient("bottom")
				.ticks(0);

	item_percent_yAxis = d3.svg.axis()
			    .scale(item_percent_y)
			    .orient("left")
			    .tickFormat(formatPercent);

	item_percent_graph.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + bb_item_percent.h + ")")
				.call(item_percent_xAxis);

	item_percent_graph.append("g")
				.attr("class", "y axis")
				.call(item_percent_yAxis);

	item_percent_graph.append("g")
				.attr("class", "bars")
				.selectAll(".bar")
				.data([{"name": "item1", "percent": .5}], function(d) {
					return d.name;
				})
			  .enter().append("rect")
			  	.attr("class", "bar")
			  	.attr("x", function(d) {
			  		return item_percent_x(d.name);
			  	})
			  	.attr("y", function(d) {
			  		return item_percent_y(d.percent);
			  	})
			  	.attr("height", function(d) {
			  		return bb_item_percent.h - item_percent_y(d.percent);
			  	})
			  	.attr("width", function() {
			  		return item_percent_x.rangeBand();
			  	})
			  	.on("mouseover", function(d) {
			  		tip.html(d.name);
			  		tip.show(d);
			  	})
			  	.on("mouseout", function(d) {
			  		tip.hide(d);
			  	});

	item_percent_graph.append("text")
		.attr("text-anchor", "middle")
		.attr("y", -20)
		.attr("x", 350)
		.text("Items Purchased as Percentage of Games Played");

}

function update_item_percent(data) {

	//d3.selectAll(".x.axis .tick text").remove();


	var items = []

	//initialize all items with a count of 0
	d3.json("../data/items.json", function(error,dat) {
		dat.items.forEach(function(d,i) {
			d.count = 0;
		})

	var total_count = data.matches.length;

	//count all of the items
	data.matches.forEach(function(d,i) {
		for (var j = 0; j < dat.items.length; j++) {
			if (dat.items[j].id == d.player_info.item_0) {
				dat.items[j].count += 1;
			}		
			else if (dat.items[j].id == d.player_info.item_1) {
				dat.items[j].count += 1;
			}		
			else if (dat.items[j].id == d.player_info.item_2) {
				dat.items[j].count += 1;
			}		
			else if (dat.items[j].id == d.player_info.item_3) {
				dat.items[j].count += 1;
			}		
			else if (dat.items[j].id == d.player_info.item_4) {
				dat.items[j].count += 1;
			}		
			else if (dat.items[j].id == d.player_info.item_5) {
				dat.items[j].count += 1;
			}		
		}
	})

	//consolidate into correct form that we want
	for (var k = 0; k < dat.items.length; k++) {
		if (dat.items[k].count != 0 && dat.items[k].name != "empty") {
			dat.items[k].percent = dat.items[k].count/total_count
			items.push(dat.items[k])
		}
	}

	if (d3.select(".item_percent").attr("visibility") == "hidden") {
		var duration = 0;
	}
	else {
		duration = 250;
	}
	
	item_percent_x.domain(items.map(function(d) {
		return d.name;
	}));
	item_percent_y.domain(d3.extent(items, function(d) {
		return d.percent;
	}));

	var bars = item_percent_graph.select(".bars")
				.selectAll(".bar")
				.data(items, function(d) {
					return d.name;
				})

	bars.exit()
		.transition()
		.duration(duration)
		.attr("width", 0)
		.remove();

	bars.enter()
		.append("rect")
		.attr("class", "bar")
		.on("mouseover", function(d) {
	  		tip.html(d.name + "<br> Count: " + d.count + "</br>");
	  		tip.show(d);
	  	})
	  	.on("mouseout", function(d) {
	  		tip.hide(d);
	  	})
		.transition().duration(duration);
		
	bars
		.transition()
		.duration(duration)
		.attr("x", function(d) {
			return item_percent_x(d.name);
		})
		.attr("y", function(d) {
			return item_percent_y(d.percent);
		})
		.attr("height", function(d) {
			return bb_item_percent.h - item_percent_y(d.percent);
		})
		.attr("width", item_percent_x.rangeBand);

	item_percent_graph.select(".y.axis")
		.transition()
		.duration(duration)
		.call(item_percent_yAxis);

	item_percent_graph.select(".x.axis")
		.transition()
		.duration(duration)
		.call(item_percent_xAxis);

	d3.select(".item_percent")
		.attr("visibility", null);

})

	//sorting by value

	d3.select("input#value").on("change", change);

	var sortTimeout = setTimeout(function() {
	    d3.select("input").property("checked", true).each(change);
	  }, 2000);

	function change() {
	    clearTimeout(sortTimeout);

	    // Copy-on-write since tweens are evaluated after a delay.
	    var x0 = item_percent_x.domain(items.sort(this.checked
	        ? function(a, b) { return b.percent - a.percent; }
	        : function(a, b) { return d3.ascending(a.name, b.name); })
	        .map(function(d) { return d.name; }))
	        .copy();

	    var transition = svg.transition().duration(750),
	        delay = function(d, i) { return i * 10; };

	    transition.selectAll(".bar")
	        .delay(delay)
	        .attr("x", function(d) { return x0(d.name); });

	    transition.select(".x.axis")
	        .call(item_percent_xAxis)
	      .selectAll("g")
	        .delay(delay);
	}

	//sorting by item

	d3.select("input#item").on("change", change_item);

	function change_item() {

	    // Copy-on-write since tweens are evaluated after a delay.
	    var x0 = item_percent_x.domain(items.sort(this.checked
	        ? function(a, b) { return d3.ascending(a.name, b.name); }
	        : function(a, b) { return d3.ascending(a.percent, b.percent); })
	        .map(function(d) { return d.name; }))
	        .copy();

	    var transition = svg.transition().duration(750),
	        delay = function(d, i) { return i * 10; };

	    transition.selectAll(".bar")
	        .delay(delay)
	        .attr("x", function(d) { return x0(d.name); });

	    transition.select(".x.axis")
	        .call(item_percent_xAxis)
	      .selectAll("g")
	        .delay(delay);
	  }


}


// svg.append("rect")
// 	.attr("width", width)
// 	.attr("height", height)
// 	.attr("x", 0)
// 	.attr("y", 0)
// 	.attr("fill", "steelblue");

// console.log("hello");
