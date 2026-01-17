const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validationListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const{storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/",)
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single('image'),
    validationListing,
    wrapAsync(listingController.createListing)
);


//new route to show form to create new listing
router.get('/new',isLoggedIn,listingController.renderNewForm);


router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single('image'),
    validationListing,
    wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


//edit route to show form to edit a listing
router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;