const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sendAdvertisementNotificationEmail } = require("../mailer");
const Company = require("../model/Company");
const Event = require("../model/Event")

const adsController = async (req, res) => {
    try {
        const payload = req.rawBody;
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, process.env.ADS_SECRET);
            if (event.data.object.mode !== "payment") {
                return res.status(200).json("wrong webhook");
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                if (session.payment_status === "paid") {
                    const expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

                    if (session.metadata && session.metadata.type === "event") {
                        const event = await Event.findOne({
                            "adsSubscription.sessionId": session.id,
                        });
                        const subscriptionIndex = event.adsSubscription.findIndex(
                            (sub) => sub.sessionId === session.id,
                        );
                        if (subscriptionIndex !== -1) {
                            const subscription = event.adsSubscription[subscriptionIndex];

                            event.adsSubscription[subscriptionIndex] = {
                                ...event.adsSubscription[subscriptionIndex],
                                sessionId: session.id,
                                subscriptionId: session.payment_intent,
                                status: "active",
                                currentPeriodEnd: expiryDate,
                                advertId: subscription.advertId,
                            };

                            await event.save();
                        }
                    } else if (session.metadata && session.metadata.type === "ad") {
                        const company = await Company.findOne({
                            "adsSubscription.sessionId": session.id,
                        });

                        const subscriptionIndex = company.adsSubscription.findIndex(
                            (sub) => sub.sessionId === session.id,
                        );

                        if (subscriptionIndex !== -1) {
                            const subscription = company.adsSubscription[subscriptionIndex];
                            let advertisement;

                            if (subscription.advertId) {
                                advertisement = await Advert.findById(subscription.advertId);

                                if (advertisement) {
                                    advertisement.status = "ACTIVE";
                                    await advertisement.save();
                                }
                            }

                            company.adsSubscription[subscriptionIndex] = {
                                ...company.adsSubscription[subscriptionIndex],
                                sessionId: session.id,
                                subscriptionId: session.payment_intent,
                                status: "active",
                                currentPeriodEnd: expiryDate,
                                advertId: subscription.advertId,
                            };

                            await company.save();

                            const users = await User.find({ sales_opt_in: true });

                            for (const user of users) {
                                sendAdvertisementNotificationEmail(
                                    user.email,
                                    user.firstname,
                                    {
                                        productService: advertisement?.title,
                                        description: advertisement?.description,
                                    },
                                    advertisement?.targetUrl,
                                );
                            }
                        }
                    }
                }

                break;
            }
        }
        res.status(200).send("successful");
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = adsController