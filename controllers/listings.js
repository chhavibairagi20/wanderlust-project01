const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/* INDEX */
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  return res.render("listings/index.ejs", { allListings });
};

/* NEW FORM */
module.exports.renderNewForm = (req, res) => {
  return res.render("listings/new.ejs");
};

/* SHOW */
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  return res.render("listings/show", {
    listing,
    mapToken,
  });
};

/* CREATE */
module.exports.createListing = async (req, res) => {
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    })
    .send();

  if (!geoResponse.body.features.length) {
    req.flash("error", "Location not found.");
    return res.redirect("/listings/new");
  }

  if (!req.file) {
    req.flash("error", "Please upload an image.");
    return res.redirect("/listings/new");
  }

  const { path: url, filename } = req.file;

  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  listing.image = { url, filename };
  listing.geometry = geoResponse.body.features[0].geometry;

  await listing.save();

  req.flash("success", "New Listing Created!");
  return res.redirect("/listings");
};

/* EDIT FORM */
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  return res.render("listings/edit.ejs", { listing });
};

/* UPDATE */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  return res.redirect(`/listings/${id}`);
};

/* DELETE */
module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);

  req.flash("success", "Listing Deleted!");
  return res.redirect("/listings");
};

