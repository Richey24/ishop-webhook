const randomstring = require("randomstring");
const Company = require("../model/Company");
const { getProductDetails, getOrder, getAddress } = require("../utils");

const dropshipController = async (req, res) => {
    const payload = req.rawBody;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.DROPSHIPPER_SECRET,
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
            const printifyProducts = []

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
                        itemReferenceId: randomstring.generate(8),
                        productUid: JSON.parse(pro.x_gelato_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                        quantity: item.product_uom_qty
                    })
                } else if (pro.x_printify_id) {
                    printifyProducts.push({
                        product_id: pro.x_printify_id,
                        variant_id: JSON.parse(pro.x_printify_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                        quantity: item.product_uom_qty
                    })
                }
            }

            if (printfulProducts.length > 0) {
                const credential = dropShipUser.dropshippers?.find((val) => val.name === "printful")
                if (!credential) {
                    return res.send("No printful credentials found")
                }
                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])
                const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                const body = {
                    external_id: randomstring.generate(7),
                    items: printfulProducts,
                    recipient: {
                        name: `${address.name.split(" ")[0]} ${address.name.split(" ")[1]}`,
                        address1: address.street,
                        city: address.city,
                        state_name: address.state_id[1],
                        country_code: countryCode,
                        zip: address.zip,
                        phone: address.phone,
                        email: address.email,
                    },
                }
                axios.post(`https://api.printful.com/orders`, body, {
                    headers: {
                        Authorization: `Bearer ${credential.apiKey}`,
                    }
                }).then(async () => {
                    console.log("Order created on printful")
                    await axios.put(
                        `https://market-server.azurewebsites.net/api/orders/status`,
                        {
                            orderId: session.metadata.orderId,
                            newStatus: "sale"
                        }
                    );
                }).catch((err) => {
                    console.log("err", err);
                    sendFailedOrderToAdmin(session.metadata.orderId, "Printful", session.payment_intent)
                    sendFailedOrderToUser(session.metadata.orderId, address.email)
                })
            }

            if (gelatoProducts.length > 0) {
                const credential = dropShipUser.dropshippers?.find((val) => val.name === "gelato")
                if (!credential) {
                    return res.send("No gelato credentials found")
                }
                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])
                const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                const body = {
                    orderReferenceId: randomstring.generate(8),
                    customerReferenceId: randomstring.generate(8),
                    currency: "USD",
                    items: gelatoProducts,
                    shippingAddress: {
                        firstName: address.name.split(" ")[0],
                        lastName: address.name.split(" ")[1],
                        addressLine1: address.street,
                        state: address.state_id[1],
                        city: address.city,
                        postCode: address.zip,
                        country: countryCode,
                        email: address.email,
                        phone: address.phone
                    },
                }
                axios.post(`https://order.gelatoapis.com/v4/orders`, body, {
                    headers: {
                        "X-API-KEY": credential.apiKey
                    }
                }).then(async () => {
                    console.log("Order created on gelato")
                    await axios.put(
                        `https://market-server.azurewebsites.net/api/orders/status`,
                        {
                            orderId: session.metadata.orderId,
                            newStatus: "sale"
                        }
                    );
                }).catch((err) => {
                    console.log("err", err);
                    sendFailedOrderToAdmin(session.metadata.orderId, "Gelato", session.payment_intent)
                    sendFailedOrderToUser(session.metadata.orderId, address.email)
                })
            }

            if (printifyProducts.length > 0) {
                const credential = dropShipUser.dropshippers?.find((val) => val.name === "printify")
                if (!credential) {
                    return res.send("No printify credentials found")
                }
                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])
                if (address.state_id) {
                    console.log(lineItems);
                    const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                    const body = {
                        external_id: randomstring.generate(10),
                        line_items: printifyProducts,
                        shipping_method: 1,
                        send_shipping_notification: true,
                        address_to: {
                            first_name: address.name.split(" ")[0],
                            last_name: address.name.split(" ")[1],
                            address1: address.street,
                            city: address.city,
                            region: address.state_id[1],
                            zip: address.zip,
                            country: countryCode,
                            phone: address.phone,
                            email: address.email
                        }
                    }
                    // console.log(body);
                    axios.post(`https://api.printify.com/v1/shops/${credential.shopID}/orders.json`, body, {
                        headers: {
                            Authorization: `Bearer ${credential.apiKey}`
                        }
                    }).then(async () => {
                        console.log("Order created on printify")
                        await axios.put(
                            `https://market-server.azurewebsites.net/api/orders/status`,
                            {
                                orderId: session.metadata.orderId,
                                newStatus: "sale"
                            }
                        );
                    }).catch((err) => {
                        console.log("err", err);
                        sendFailedOrderToAdmin(session.metadata.orderId, "Printify", session.payment_intent)
                        sendFailedOrderToUser(session.metadata.orderId, address.email)
                    })
                }
            }
            return res.status(200).send("successfull")
            break;

        default:
            break;
    }
}

module.exports = dropshipController