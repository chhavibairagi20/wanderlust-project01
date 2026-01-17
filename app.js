require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log('Connected to MongoDB');

}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.success = [];
app.locals.error = [];
app.locals.currUser = null;


const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600, // 24 hours

});
 

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,//for 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use((req, res, next) => {
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
});


app.use(session(sessionOptions));
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});





    // normalize image on update as well
//     const listingData = { ...req.body.listing };
//     if (listingData.image) {
//         if (typeof listingData.image === 'string' && listingData.image.trim() === '') {
//             delete listingData.image;
//         }
//         if (typeof listingData.image === 'object') {
//             const url = listingData.image.url;
//             const filename = listingData.image.filename;
//             if ((!url || String(url).trim() === '') && (!filename || String(filename).trim() === '')) {
//                 delete listingData.image;
//             }
//         }
//     }
//     await Listing.findByIdAndUpdate(id, listingData, { runValidators: true, new: true });
//     res.redirect(`/listings/${id}`);
// }));



// app.get("/demouser",async(req, res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com" ,
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })
   
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//root route

// app.get('/', (req, res) => {
//     res.send('hi i am root');
// });



// app.get("/testListing", (req, res) => {
//     let sampleListing = new Listing({
//         title: "Beautiful Beach House",
//         description: "A lovely beach house with stunning ocean views.",
//         price :1200,
//         Location: "Goa",
//         country: "India"
//     });

// sampleListing.save()
// .then(() => {
//     res.send('Sample listing saved to the database!');
//     console.log('Sample listing saved to the database!');
//     }).catch(err => {
//         res.status(500).send('Error saving listing: ' + err);
//     });

// });

// Catch-all for unknown routes -> create a 404 ExpressError
app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found!'));
});

app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});