const mongoose = require('mongoose');
const User = require('./user.model');
const {Schema} = mongoose;

const SubscriptionSchema = new Schema({
 subscriber: {
    type: Schema.Types.ObjectId,// One who is subscribing
    ref: "User",
 },
 channel:{
    type: Schema.Types.ObjectId, // one who have a channel 
    ref: "User"
 }
},{
    timestamps: true
})

const Subscription = mongoose.model("Subscription" , SubscriptionSchema);

module.exports = Subscription ;
