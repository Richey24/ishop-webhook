const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const orderController = require("./controller/orderController");
const subscribeController = require("./controller/subscribeController");
const adsController = require("./controller/adsController");
const morgan = require("morgan");
const { default: mongoose } = require("mongoose");
const dropshipController = require("./controller/dropshipController");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
    express.json({
        limit: "5mb",
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    }),
);
app.use(morgan("dev")); // configire morgan


mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("Database is connected");
    })
    .catch((err) => {
        console.log({ database_error: err });
    });




app.get("/", (req, res) => {
    console.log("Hello MEVN Soldier");
    res.status(201).json({ message: "working" });
});


app.post("/api/webhook/order", orderController)
app.post("/api/webhook/subscribe", subscribeController)
app.post("/api/webhook/ads", adsController)
app.post("/api/webhook/dropship", dropshipController)



app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});