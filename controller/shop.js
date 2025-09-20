const Shop = require("../modules/shop.js");
const State = require("../modules/state.js");

// INDEX ROUTE - ALL SHOPS
module.exports.index = async (req, res) => {
  const allStates = await State.find({}); // fetch all states
  let filter = {};
  if (req.query.state) {
    filter.state = req.query.state; // filter by state id
  }

  const allShops = await Shop.find(filter).populate("state");
  res.render("shops/index.ejs", { allShops, allStates, selectedState: req.query.state || "" });
};

// NEW SHOP FORM
module.exports.renderNewForm = async (req, res) => {
  const states = await State.find({});
  res.render("shops/new.ejs", { states });
};

// CREATE ROUTE
module.exports.createShop = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    req.flash("error", "Please upload at least one image");
    return res.redirect("/shops/new");
  }

  const newShop = new Shop(req.body.shop);
  newShop.owner = req.user._id;

  for (let file of req.files) {
    newShop.image.push({ url: file.path, filename: file.filename });
  }

  await newShop.save();
  req.flash("success", "New shop created!");
  res.redirect("/shops");
};

// EDIT FORM
module.exports.editShop = async (req, res) => {
  const { id } = req.params;
  const shop = await Shop.findById(id).populate("state");

  if (!shop) {
    req.flash("error", "Shop not found");
    return res.redirect("/shops");
  }

  const states = await State.find({});
  res.render("shops/edit.ejs", { shop, states });
};

// UPDATE ROUTE
module.exports.updateShop = async (req, res) => {
  const { id } = req.params;
  const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop }, { new: true });

  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      shop.image.push({ url: file.path, filename: file.filename });
    }
    await shop.save();
  }

  req.flash("success", "Shop updated!");
  res.redirect(`/shops/${id}`);
};

// DELETE ROUTE
module.exports.deleteShop = async (req, res) => {
  const { id } = req.params;
  await Shop.findByIdAndDelete(id);
  req.flash("success", "Shop deleted!");
  res.redirect("/shops");
};

// SHOW ROUTE
module.exports.showShop = async (req, res) => {
  const { id } = req.params;
  const shop = await Shop.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .populate("state");

  if (!shop) {
    req.flash("error", "Shop not found");
    return res.redirect("/shops");
  }

  let sum = 0, count = 0;
  for (review of shop.reviews) { sum += review.rating; count++; }
  sum = shop.reviews.length > 0 ? sum / shop.reviews.length : 0;

  res.render("shops/show.ejs", { shop, sum, count });
};

// Show all shops created by the logged-in user
module.exports.seeYoursShops = async (req, res) => {
  const { curruserid } = req.params;
  const shops = await Shop.find({ owner: curruserid }).populate("state"); // if shops have state
  if (shops.length > 0) {
    return res.render("shops/your_shops.ejs", { shops });
  }
  req.flash("error", "You haven't created any shops!");
  res.redirect("/shops");
};

// CATEGORY ROUTE
module.exports.category = async (req, res) => {
  const { name } = req.params;
  const shops = await Shop.find({ category: name }).populate("state");
  if (shops.length > 0) {
    return res.render("shops/category.ejs", { shops, name });
  }
  req.flash("error", "No listings match this category!");
  res.redirect("/shops");
};

