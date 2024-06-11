const mongoose = require("mongoose");

const companySchema = mongoose.Schema({
     user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
     },
     status: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
     },
     site: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Site",
     },
     company_id: {
          type: Number,
          // required: [true, "Company id is required"],
     },
     company_name: {
          type: String,
          required: [true, "Company Name is required"],
     },
     company_type: {
          type: String,
     },
     subdomain: {
          type: String,
          required: [true, "Subdomain is a required field"],
     },
     phone: {
          type: String,
          default: "123456789",
     },
     theme: {
          type: String,
          required: [true, "Theme is a required field"],
     },
     logo: {
          type: String,
     },
     brandcolor: {
          type: Array,
          required: [true, "brandcolor is a required feild"],
     },
     subscription: {
          type: String,
     },
     country: {
          type: String,
          required: [true, "country is a required field"],
     },
     city: {
          type: String,
          required: [true, "city is a required field"],
     },
     address: {
          type: String,
     },
     facebookLink: {
          type: String,
     },
     twitterLink: {
          type: String,
     },
     linkedinLink: {
          type: String,
     },
     categories: {
          type: Array,
          required: false,
     },
     subscribed: {
          type: Boolean,
          default: false,
     },
     trial_end_date: {
          type: String,
     },
     type: {
          type: String,
     },
     serviceType: {
          type: String,
     },
     selectedCarriers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Carrier" }],
     adsSubscription: [
          {
               _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
               sessionId: {
                    type: String,
                    default: null,
               },
               subscriptionId: {
                    type: String,
                    default: null,
               },
               status: {
                    type: String,
                    default: null,
               },
               currentPeriodEnd: {
                    type: Date,
                    default: null,
               },
               advertId: {
                    type: String,
               },
          },
     ],
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
