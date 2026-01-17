const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logeed in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req, res, next)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
};

module.exports.validationListing = (req, res, next) =>{
    // Normalize empty image fields so Mongoose defaults can apply
    if (req.body && req.body.listing && req.body.listing.image) {
        const img = req.body.listing.image;
        if (typeof img === 'string') {
            if (img.trim() === '') delete req.body.listing.image;
        } else if (typeof img === 'object') {
            const url = img.url;
            const filename = img.filename;
            if ((!url || String(url).trim() === '') && (!filename || String(filename).trim() === '')) {
                delete req.body.listing.image;
            }
        }
    }

    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    return next();

}

module.exports.validationReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    return next();
};


module.exports.isReviewAuthor = async(req, res, next)=>{
    const {id,reviewId} = req.params;
    const newReview = await Review.findById(reviewId);
        if(!newReview.author._id.equals(res.locals.currUser._id)){
            req.flash("error","You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
};