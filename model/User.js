const mongoose = require("mongoose");
const { USER_ROLE } = require("./user.schema");

const currentDate = new Date();

const DropshipperSchema = new mongoose.Schema({
     name: {
          type: String,
          required: [true, "Dropshipper name is required"],
     },
     apiKey: {
          type: String,
          required: [true, "API Key is required"],
     },
     shopID: {
          type: String,
          required: [true, "API Key is required"],
     },
     verified: {
          type: Boolean,
          default: false,
     },
     createdAt: {
          type: Date,
          default: Date.now,
     },
});

const userSchema = mongoose.Schema({
     firstname: {
          type: String,
          required: [true, "Please Include your first name"],
     },
     tour: {
          type: String,
     },
     lastname: {
          type: String,
          required: [true, "Please include your last Name"],
     },

     email: {
          type: String,
          required: [true, "Please Include your email"],
     },
     currentSiteType: {
          type: String,
     },

     chatID: {
          type: String,
     },

     image: {
          type: String,
     },

     status: {
          type: String,
          enum: ["active", "suspended", "banned"],
          default: "active",
     },
     suspensionEndDate: {
          type: Date,
          default: null,
     },
     role: {
          type: String,
          default: USER_ROLE.USER,
          enum: [
               USER_ROLE.USER,
               USER_ROLE.ADMIN,
               USER_ROLE.VENDOR,
               USER_ROLE.CUSTOMER,
               USER_ROLE.DEVELOPER,
               USER_ROLE.FREELANCER,
          ],
          required: [true, "Please include user role"],
     },
     githubUsername: {
          type: String,
     },
     portfolioUrl: {
          type: String,
     },
     password: {
          type: String,
          required: [true, "Please Include your password"],
     },
     onboarded: {
          type: Boolean,
          default: false,
     },
     phone: {
          type: Number,
     },
     partner_id: {
          type: Number,
     },
     paid: {
          type: Boolean,
          default: false,
     },
     subCanceled: {
          type: Boolean,
          default: false,
     },
     expiryDate: {
          type: Date,
     },
     stripeID: {
          type: String,
     },
     subscriptionID: {
          type: String,
     },
     subscriptionPlan: {
          type: String,
     },
     rated: {
          type: Array,
          default: [],
     },
     subscription: {
          sessionId: { type: String, default: null },
          planId: { type: String, default: null },
          planType: { type: String, default: null },
          planStartDate: { type: String, default: null },
          planEndDate: { type: String, default: null },
          planDuration: { type: Number, default: null },
     },
     order_products: {
          type: Array,
          default: [],
     },
     order_reported: {
          type: Array,
          default: [],
     },
     suspensionCount: {
          type: Number,
          default: 0,
     },
     banReason: {
          type: [String],
          default: [],
     },
     suspensionReasons: {
          type: [String],
          default: [],
     },
     stripeConnectedAccountId: {
          type: String,
     },
     isStripeConnectedAccountVerified: {
          type: Boolean,
          default: false,
     },
     partner_ids: [
          {
               id: { type: Number },
               domain: { type: String },
          },
     ],
     sales_opt_in: {
          type: Boolean,
     },
     salesEmailReport: {
          status: { type: Boolean, default: true },
          frequency: { type: String, enum: ["Per sales", "Once daily"], default: "Per sales" },
          time: { type: String },
     },
     created_at: {
          type: Date,
          default: Date.now,
     },
     company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
     },
     position: {
          type: String,
          required: [false, "Position is not required"],
     },
     batch: {
          type: Number,
          default: 1,
     },
     address: {
          type: String,
     },
     timeZone: {
          type: String,
     },
     languages: [
          {
               type: String,
          },
     ],
     skills: [
          {
               type: String,
          },
     ],
     about: {
          type: String,
     },
     serviceWishlist: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Service",
          },
     ],
     tokens: [
          {
               token: {
                    type: String,
                    required: true,
               },
          },
     ],
     navigation: {
          type: Array,
     },
     show_phone: {
          type: Boolean,
     },
     dropshippers: [DropshipperSchema],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
