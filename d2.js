var d2 = (function() {

    // varable to return that holds the accessible functions
    d2 = {};

    var heroData = [];
    var itemData = [];

    function loadHeroJson()
    {
        d3.json("data/heroes.json", function (error, data)
        {
    	   // an array of all the hero names indexed appropriately - starting at 1
    	   heroData = data["result"]["heroes"];
        });
    };

    function loadItemJson()
    {
        d3.json("data/items.json", function (error, data)
        {
    	   // an array of all the hero names indexed appropriately - starting at 1
    	   itemData = data["items"];
        });
    };

    loadHeroJson();
    loadItemJson();

    // can change the function names
    // and the function args - depends on our implementation
    function idToHeroLocalizedName(id, heroData)
    {
        var hero = heroData[id];
        return hero["localized_name"];
    }


    function idToItemName(id, itemData)
    {
        var item = itemData[id];
        return item["name"];
    }

    function displayHeroImg(heroname){
        d3.select("body").select(".heropicture").remove();

        d3.select("body").selectAll(".heropicture").data([heroname.toLowerCase().replace(/ /g,"_")])
        .enter().append('img')
        .attr('class', 'heropicture')
        .attr('src', function(d) { return "../img/heroes/" +d+".jpg"; });
    };


    function displayItemImg(itemname){
        d3.select("body").select(".itempicture").remove();

        d3.select("body").selectAll(".itempicture").data([itemname])
        .enter().append('img')
        .attr('class', 'itempicture')
        .attr('src', function(d) { return "../img/items/" +d+".jpg"; });
    };

    var pubFunctionList = "getHeroName(id): returns hero name from ID\n"
                            + "getItemName(id): returns item name from ID\n"
                            + "displayHeroImg(name): displays the image for hero 'name'\n"
                            + "displayItemImg(name): displays the image for item 'name'\n"

    return {
        getHeroName: function(id) {
            return idToHeroLocalizedName(id, heroData)
        },

        getItemName: function(id) {
            return idToItemName(id, itemData)
        },

        displayHeroImg: displayHeroImg,

        displayItemImg: displayItemImg,

        functionList: function() {
            console.log(pubFunctionList)
        },

        id64To32: function(id) {
            return id -76561197960265728
        },

        id32To64: function(id) {
            return id + 76561197960265728
        }

    }

})();