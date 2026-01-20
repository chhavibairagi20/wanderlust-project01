const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

/* ✅ FIXED: ASYNC PRE-VALIDATE HOOK (NO next) */
// listingSchema.pre("validate", async function () {
//   if (
//     !this.geometry ||
//     !this.geometry.coordinates ||
//     this.geometry.coordinates.length !== 2
//   ) {
//     if (!this.location) {
//       throw new Error("Location is required to generate coordinates");
//     }

//     const geoData = await geocoder
//       .forwardGeocode({
//         query: this.location,
//         limit: 1,
//       })
//       .send();

//     if (!geoData.body.features.length) {
//       throw new Error("Could not find coordinates for location");
//     }

//     this.geometry = {
//       type: "Point",
//       coordinates: geoData.body.features[0].geometry.coordinates,
//     };
//   }
// });

/* ✅ SAFE DELETE HOOK */
// listingSchema.post("findOneAndDelete", async function (listing) {
//   if (listing) {
//     await Review.deleteMany({ _id: { $in: listing.reviews } });
//   }
// });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


