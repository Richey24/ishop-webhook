const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
     name: {
          type: String,
     },
     price: {
          type: Number,
     },
     description: {
          type: String,
     },
     email: {
          type: String,
     },
     phoneNumber: {
          type: String,
     },
     noOfTicket: {
          type: String,
     },
     category: {
          type: String,
          enum: [
               "Music",
               "Nightlife",
               "Performing & Visual Arts",
               "Holidays",
               "Health",
               "Hobbies",
               "Business",
               "Food & Drink",
          ],
     },
     format: {
          type: String,
          enum: [
               "Class",
               "Conference",
               "Festival",
               "Party",
               "Appearance",
               "Attraction",
               "Convention",
               "Expo",
               "Gala",
               "Game",
               "Networking",
               "Performance",
               "Race",
               "Rally",
               "Screening",
               "Tournament",
               "Tour",
               "Seminar",
          ],
     },
     status: {
          type: String,
          enum: ["paid", "free"],
     },
     startDate: {
          type: Date,
     },
     endDate: {
          type: Date,
     },
     country: {
          type: String,
     },
     city: {
          type: String,
     },
     state: {
          type: String,
     },
     address: {
          type: String,
     },

     coordinates: {
          lat: {
               type: Number,
               required: false,
          },
          lng: {
               type: Number,
               required: false,
          },
     },
     images: {
          type: Array,
     },
     published: {
          type: Boolean,
          default: false,
     },
     isAd: {
          type: Boolean,
          default: false,
     },
     tags: [String],
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
               eventId: {
                    type: String,
               },
          },
     ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
