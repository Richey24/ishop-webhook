const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
     userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Please include userid"],
     },
     url: {
          type: String,
     },
     email: {
          type: String,
     },
     title: {
          type: String,
     },
     type: {
          type: String,
     },
     tags: {
          type: Array,
     },
     price: {
          type: String,
     },
     description: {
          type: String,
     },
     dateCreated: {
          type: Date,
          default: Date.now(),
     },
     dateUpdated: {
          type: Date,
          default: Date.now(),
     },
     scheduledDate: {
          type: Date,
     },
     avialable: {
          type: Boolean,
          default: true,
     },
     visibility: {
          type: String,
     },
     duration: {
          type: String,
     },
     durationType: {
          type: String,
     },
     image: {
          type: String,
     },
     rating: {
          type: String,
     },
     numberOfPurchase: {
          type: Number,
          default: 0,
     },
     features: {
          type: Array,
     },
     variants: {
          type: Array,
     },
});

serviceSchema.virtual("reviews", {
     ref: "Review",
     foreignField: "service",
     localField: "_id",
});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
