const Listing = require("../modules/listing.js");
const Shop = require("../modules/shop.js");
const Place = require("../modules/place.js");

module.exports.search = async (req, res, next) => {
  try {
    let { search, type } = req.query; // type comes from dropdown
    type = type || "listing"; // default to listing

    let results = [];
    let Model;

    // Determine model based on type
    switch (type) {
      case "listings":
        Model = Listing;
        break;
      case "shops":
        Model = Shop;
        break;
      case "places":
        Model = Place;
        break;
      default:
        req.flash("error", "Invalid search type.");
        return res.redirect("/listings");
    }

    // Numeric search for listings only
    if (!isNaN(search) && type === "listing") {
      search = Number(search);
      results = await Model.find({ price: search })
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner")
        .populate("state");
    } else {
      // Text search
      let searchQuery = {};

      if (type === "shops") {
        searchQuery = { name: { $regex: search, $options: "i" } };
      } else if (type === "places") {
        searchQuery = {
          $or: [
            { place_name: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
          ],
        };
      } else {
        // listing
        searchQuery = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
          ],
        };
      }

      results = await Model.find(searchQuery)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner")
        .populate("state");
    }

    if (!results || results.length === 0) {
      req.flash("error", "No results found for your search.");
      return res.redirect("/listings");
    }
    res.render("search.ejs", { listings: results, type });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong during search.");
    return res.redirect("/listings");
  }
};
