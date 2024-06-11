const mongoose = require('mongoose');

const loggerSchema = mongoose.Schema(
    {
        userID: {
            type: String
        },
        eventType: {
            type: String
        }
    },
    {
        timestamps: true,
    }
)

const Logger = mongoose.model("logger", loggerSchema)

module.exports = Logger