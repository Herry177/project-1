const Place = require("../modules/place.js");
const Shop  = require("../modules/shop.js");
const Listing = require("../modules/listing.js");
const State = require("../modules/state.js")

module.exports.showTrendingAndFiveStarByState = async (req, res) => {
    try {
        const { statename } = req.params;
        const stateFound = await State.findOne({ name: statename });

        if (!stateFound) {
            return res.render("searchBased.ejs", { 
                trendingListings: [],
                trendingShops: [],
                trendingPlaces: [],
                statename: statename 
            });
        }
        
        const stateId = stateFound._id;
        const [trendingListings, trendingShops, trendingPlaces] = await Promise.all([
            Listing.find({ 
                state: stateId, 
                $or: [{ category: "Trending" }, { category: "5-star" }] 
            }),
            Shop.find({ 
                state: stateId, 
                $or: [{ category: "Trending" }, { category: "5-star" }] 
            }),
            Place.find({ 
                state: stateId, 
                $or: [{ type: "Trending" }, { type: "5-star" }] 
            }),
        ]);

        console.log(trendingListings, trendingPlaces, trendingShops)

        console.log(trendingListings, trendingPlaces, trendingShops)

        console.log(trendingListings, trendingPlaces, trendingShops)
        // Pass the three separate arrays to the EJS template
        res.render("searchBased.ejs", { trendingListings, trendingShops, trendingPlaces, statename });

    } catch (err) {
        console.error("Error fetching items by state:", err);
        res.status(500).send("An error occurred while fetching data for the state.");
    }
};
