const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
     theme: { type: String, required: true },
     props: { type: mongoose.Schema.Types.Mixed },
});

const sectionSchema = new mongoose.Schema({
     name: { type: String, required: true },
     content: String,
     component: componentSchema,
});

const pageSchema = new mongoose.Schema({
     name: { type: String, required: true },
     layout: String,
     sections: [sectionSchema],
});

const conditionSchema = new mongoose.Schema({
     target: {
          type: String,
          enum: ["quantity", "price"],
     },
     count: {
          type: Number,
     },
});

const freeConditionSchema = new mongoose.Schema({
     condition: conditionSchema,
     enabled: Boolean,
});

const shippingSchema = new mongoose.Schema({
     free: freeConditionSchema,
});

const siteSchema = new mongoose.Schema({
     theme: { type: String, required: true },
     pages: [pageSchema],
     pageLinks: [String],
     header: sectionSchema,
     footer: sectionSchema,
     topAds: sectionSchema,
     shipping: shippingSchema,
     company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
     },
     styles: {
          colors: [String],
          mode: String,
          demoLink: String,
     },
});

const Site = mongoose.model("Site", siteSchema);

module.exports = Site;
