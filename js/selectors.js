/*
d2.loadJson(function ()
{
	hero_keys = d2.getKeys("heroes");
	var intheroes = new Array();
	var agiheroes = new Array();
	var strheroes = new Array();
	for (var i = 1; i < hero_keys.length; i++)
	{
		var hero = d2.getHeroInfo(hero_keys[i]);;
		if (hero)
		{
			if (hero.stat == "strength")
			{
				strheroes.push(hero);
			}
			else if (hero.stat == "agility")
			{
				agiheroes.push(hero);
			}
			else if (hero.stat == "intelligence")
			{
				intheroes.push(hero);
			}
		}
	};
	strheroes.sort(sorting);
	agiheroes.sort(sorting);
	intheroes.sort(sorting);
	strheroes.forEach(function (d)
	{
		var heroname = d.name;
		d3.select("#strimages").append("img").attr("id", heroname).attr("class", "pic");
		d3.select("#strimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
		d3.select("#strimages").select("#" + heroname).on("click", highlight);
	});
	agiheroes.forEach(function (d)
	{
		var heroname = d.name;
		d3.select("#agiimages").append("img").attr("id", heroname).attr("class", "pic");
		d3.select("#agiimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
		d3.select("#agiimages").select("#" + heroname).on("click", highlight);
	});
	intheroes.forEach(function (d)
	{
		var heroname = d.name;
		d3.select("#intimages").append("img").attr("id", heroname).attr("class", "pic");
		d3.select("#intimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
		d3.select("#intimages").select("#" + heroname).on("click", highlight);
	});
});*/

// selecting label headings, highlights or unhighlights all imgs in that div
var labels = ["str", "int", "agi"];
labels.forEach(function (d) {
    d3.select("#" + d + "label").on("click", function () {
        var images = d3.select("#" + d + "images").selectAll("img");
        var numselected = d3.select("#" + d + "images").selectAll(".pic.selected")[0].length;
        if (numselected != images[0].length) {
            images.attr("class", "pic selected");
            images.style("border", "2px solid red");
        } else if (numselected == images[0].length) {
            images.classed("selected", false);
            images.style("border", "2px solid black");
        }
    });
});


function highlight()
{
	if (!this.classList.contains("selected"))
	{
		d3.select(this).attr("class", "pic selected");
		d3.select(this).style("border", "2px solid red");
	}
	else
	{
		$(this).removeClass("selected");
		d3.select(this).style("border", "2px solid black");
	}
}

function selected()
{
	var selectedheroes = d3.selectAll(".selected")[0];
	selectedarr = new Array();
	selectedheroes.forEach(function (d)
	{
		selectedarr.push(+d.getAttribute("value"));
	});

	console.log(selectedarr);

	filtered_data = {
		id32: user_data.id32,
		id64: user_data.id64,
		matches: [],
		user: user_data.user
	}

	var filtered_matches = user_data.matches.filter(function(d,i) {
		var player_hero_id = d.player_info.hero_id;

		return selectedarr.indexOf(player_hero_id) > -1
	})

	filtered_data.matches = filtered_matches;

	update_win_loss(filtered_data);

    update_item_percent(filtered_data);

    create_flare(filtered_data);

    create_matrix(filtered_data);

    update_gpm(filtered_data);

    update_xpm(filtered_data);
}

function sorting(a, b)
{
	return a.dname.localeCompare(b.dname)
};
