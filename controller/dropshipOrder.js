const randomstring = require("randomstring");
const Company = require("../model/Company");
const { getProductDetails, getOrder } = require("../utils");

const dropshipOrder = async (req, res) => {
    const payload = req.rawBody;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.DROPSHIPPING_SECRET,
        );
    } catch (err) {
        console.log(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            if (session.mode !== "payment") {
                return res.status(200).send("wrong webhook");
            }
            if (session.payment_status !== "paid") {
                return res.status(200).send("payment incomplete");
            }
            const order = await getOrder(session.metadata.orderId)
            const theOrder = order.order_lines
            const companyID = order.company_id[0]
            const company = await Company.find({ company_id: companyID })
            const dropShipUser = await User.find({ company: company._id })
            if (!dropShipUser?.dropshippers?.verified) {
                return res.status(200).send("invalid dropshipper");
            }

            const printfulProducts = []
            const gelatoProducts = []

            for (const item of theOrder) {
                const product = await getProductDetails(item.product_template_id[0])
                const pro = product[0]
                if (pro.x_printful_id) {
                    printfulProducts.push({
                        id: pro.x_printful_id,
                        external_id: randomstring.generate(10),
                        variant_id: JSON.parse(pro.x_printful_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                        external_variant_id: randomstring.generate(10),
                        quantity: item.product_uom_qty
                    })
                } else if (pro.x_gelato_id) {
                    gelatoProducts.push({
                        itemReferenceId: randomstring.generate(10),
                        productUid: JSON.parse(pro.x_gelato_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                        quantity: item.product_uom_qty
                    })
                }
            }

            if (printfulProducts.length > 0) {

            }

            if (gelatoProducts.length > 0) {

            }

            break;

        default:
            break;
    }
}