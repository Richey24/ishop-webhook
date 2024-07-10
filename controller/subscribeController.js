const stripe = require("stripe")(process.env.STRIPE_KEY);
const User = require("../model/User");
const Logger = require("../model/Logger");
const { deleteCompany } = require("../utils");
const Company = require("../model/Company");
const { sendSubscriptionNotification } = require("../mailer");


const subscribeController = async (req, res) => {
    try {
        const payload = req.rawBody;
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, process.env.VENDOR_SECRET);
        } catch (err) {
            console.log(err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                if (session.mode !== "subscription") {
                    return res.status(200).json("wrong webhook");
                }
                if (session.payment_status === "paid") {
                    const expiryDate =
                        session.metadata.plan === "monthly"
                            ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                            : new Date(new Date().setMonth(new Date().getMonth() + 12));
                    const user = await User.findOneAndUpdate(
                        { email: session.metadata.email },
                        {
                            paid: true,
                            expiryDate: expiryDate,
                            stripeID: session.customer,
                            subscriptionID: session.subscription,
                            subscriptionPlan: session.metadata.plan,
                        },
                        { new: true },
                    );
                    const company = await Company.findOne({ user_id: user._id });
                    sendSubscriptionNotification(user.email, company?.company_name || "Not available", company?.subdomain || "Not created", user.phone)
                    await Logger.create({
                        userID: user._id,
                        eventType: "user subscribed",
                    });
                    res.status(200).send("successful");
                }

            case "customer.subscription.deleted": {
                const session = event.data.object;
                const user = await User.findOne({ stripeID: session.customer });
                if (user) {
                    await deleteCompany(user.company)
                    await Logger.create({
                        userID: user._id,
                        eventType: "customer.subscription.deleted",
                    });
                    res.status(200).send("successful");
                }
            }
                break;

            default:
                break;
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = subscribeController