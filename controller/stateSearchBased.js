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
                hotels: [],
                localShops: [],
                touristPlaces: [],
                statename: statename 
            });
        }
        
        const stateId = stateFound._id;
        const [hotels, localShops, touristPlaces] = await Promise.all([
            Listing.find({ 
                state: stateId,   
            }),
            Shop.find({ 
                state: stateId,      
            }),
            Place.find({ 
                state: stateId, 
            }),
        ]);

        // Pass the three separate arrays to the EJS template
        res.render("searchBased.ejs", { hotels, localShops, touristPlaces, statename });

    } catch (err) {
        console.error("Error fetching items by state:", err);
        res.status(500).send("An error occurred while fetching data for the state.");
    }
};
