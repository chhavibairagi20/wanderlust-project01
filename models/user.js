const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    }
});

userSchema.plugin(
  passportLocalMongoose.default || passportLocalMongoose
);//automatically add username and password to schema with hashing and salting

module.exports = mongoose.model('User', userSchema);