const randomstring = require("randomstring");
const signApiRequest = require("../Hashing");
const Odoo = require("../odoo");
const { getOrder, getProductDetails, getAddress } = require("../utils");
const { default: axios } = require("axios");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sendFailedOrderToAdmin, sendFailedOrderToUser } = require("../mailer");


const orderController = async (req, res) => {
    // try {
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

            await Odoo.connect();

            // Update the order status
            await Odoo.execute_kw("sale.order", "write", [
                [+session.metadata.orderId],
                { state: "sale" },
            ]);

            const order = await getOrder(session.metadata.orderId)
            const theOrder = order.order_lines
            const checkBrand = await getProductDetails(theOrder[0].product_template_id[0])
            const brand = checkBrand[0]
            console.log(brand);

            if (brand.x_brand_gate_id) {
                const lineItems = await Promise.all(theOrder.map(async (item) => {
                    const product = await getProductDetails(item.product_template_id[0])
                    const pro = product[0]
                    if (pro.x_brand_gate_variant_id) {
                        return {
                            product_id: pro.x_brand_gate_id,
                            variation_id: JSON.parse(pro.x_brand_gate_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                            quantity: item.product_uom_qty
                        }
                    } else {
                        return {
                            product_id: pro.x_brand_gate_id,
                            quantity: item.product_uom_qty
                        }
                    }
                }))

                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])

                const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                const body = {
                    order_id: theOrder[0].id,
                    line_items: lineItems,
                    shipping: {
                        first_name: address.name.split(" ")[0],
                        last_name: address.name.split(" ")[1],
                        address_1: address.street,
                        city: address.city,
                        state: address.state_id ? address.state_id[1] : "state",
                        postcode: address.zip,
                        country: countryCode,
                        phone: address.phone,
                        email: address.email
                    }
                }
                console.log(body);
                axios.post("https://nova.shopwoo.com/api/v1/orders?store_id=2", body, {
                    auth: {
                        username: "info@ishop.black",
                        password: "Hab0glab0tribin"
                    }
                }).then(async () => {
                    console.log("Order created on brandgateway")
                    await axios.put(
                        `https://market-server.azurewebsites.net/api/orders/status`,
                        {
                            orderId: session.metadata.orderId,
                            newStatus: "sale"
                        }
                    );
                }).catch((err) => {
                    console.log("err", err);
                    sendFailedOrderToAdmin(session.metadata.orderId, "Brandgate Way", session.payment_intent)
                    sendFailedOrderToUser(session.metadata.orderId, address.email)
                })
            } else if (brand.x_printify_id) {
                const lineItems = await Promise.all(theOrder.map(async (item) => {
                    const product = await getProductDetails(item.product_template_id[0])
                    const pro = product[0]
                    return {
                        product_id: pro.x_printify_id,
                        variant_id: JSON.parse(pro.x_printify_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                        quantity: item.product_uom_qty
                    }
                }))

                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])
                if (address.state_id) {
                    console.log(lineItems);
                    const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                    const body = {
                        external_id: randomstring.generate(10),
                        line_items: lineItems,
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
                    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
                    axios.post(`https://api.printify.com/v1/shops/${brand.x_printify_shop_id}/orders.json`, body, {
                        headers: {
                            Authorization: `Bearer ${token}`
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
            } else if (brand.x_aliexpress_id) {
                const lineItems = await Promise.all(theOrder.map(async (item) => {
                    const product = await getProductDetails(item.product_template_id[0])
                    const pro = product[0]
                    return `{
                            "product_id": "${pro.x_aliexpress_id}",
                            "sku_attr": "${JSON.parse(pro.x_aliexpress_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name]}",
                            "product_count": "${item.product_uom_qty}",
                            "logistics_service_name": "EPAM",
                        }`
                }))

                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])

                if (address.state_id) {
                    const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                    const timestamp = Date.now()

                    const param = `
                                {
                                    "product_items": ${lineItems},
                                    "logistics_address":{
                                        "zip":"${address.zip}",
                                        "country":"${countryCode}",
                                        "mobile_no":"${address.phone}",
                                        "address":"${address.street}",
                                        "city":"${address.city}",
                                        "contact_person":"${address.name.split(" ")[0]} ${address.name.split(" ")[1]}",
                                        "full_name":"${address.name.split(" ")[0]} ${address.name.split(" ")[1]}",
                                        "province":"${address.state_id[1].split(" ")[0]}",
                                        "phone_country":"+1"
                                    }
                                }
                            `
                    console.log(param);
                    const encodedString = encodeURIComponent(param)

                    const hash = signApiRequest({
                        app_key: 507142,
                        timestamp: timestamp,
                        session: "50000500439znZZZqMmSikCpwNpCD3JXcnyazsedEauiLSUkKmW1d304ad4t7TOPbrgF",
                        method: "aliexpress.ds.order.create",
                        sign_method: "sha256",
                        param_place_order_request4_open_api_d_t_o: param
                    }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "")

                    const response = await axios.post(`https://api-sg.aliexpress.com/sync?param_place_order_request4_open_api_d_t_o=${encodedString}&method=aliexpress.ds.order.create&app_key=507142&sign_method=sha256&session=50000500439znZZZqMmSikCpwNpCD3JXcnyazsedEauiLSUkKmW1d304ad4t7TOPbrgF&timestamp=${timestamp}&sign=${hash}`)
                    if (response.data.aliexpress_ds_order_create_response.result.is_success !== true) {
                        console.log(response.data);
                        sendFailedOrderToAdmin(session.metadata.orderId, "Printify", session.payment_intent)
                        sendFailedOrderToUser(session.metadata.orderId, address.email)
                    } else {
                        await axios.put(
                            `https://market-server.azurewebsites.net/api/orders/status`,
                            {
                                orderId: session.metadata.orderId,
                                newStatus: "sale"
                            }
                        );
                        console.log("Order created on aliexpress")
                    }
                }

            } else if (brand.x_vision_model) {
                const lineItems = await Promise.all(theOrder.map(async (item) => {
                    const product = await getProductDetails(item.product_template_id[0])
                    const pro = product[0]
                    return {
                        model_code: pro.x_vision_model,
                        quantity: item.product_uom_qty
                    }
                }))

                const address = await getAddress(order?.partner_id[0], order?.partner_shipping_id[0])
                const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))

                const body = {
                    key: "Zs6U7tiYqvCFL2BhcCPmNF6EvH4xphbLkPUB6lbs8i8.",
                    payment_method: "Credit Card",
                    shipping: "US USPS",
                    currency: "USD",
                    products: lineItems,
                    address: {
                        first_name: address.name.split(" ")[0],
                        last_name: address.name.split(" ")[1],
                        street: address.street,
                        zip: address.zip,
                        city: address.city,
                        state: address.state_id[1]?.split(" ")[0],
                        telephone: address.phone,
                        country_iso2: countryCode,
                        socket: countryCode
                    }
                }
                axios.post("https://secure.chinavasion.com/api/createOrder.php", body).then(async (data) => {
                    console.log("Order created on chinavision")
                }).catch(() => {
                    sendFailedOrderToAdmin(session.metadata.orderId, "GVS", session.payment_intent)
                    sendFailedOrderToUser(session.metadata.orderId, address.email)
                })

            }

            await axios.put(
                `https://market-server.azurewebsites.net/api/orders/status`,
                {
                    orderId: session.metadata.orderId,
                    newStatus: "sale"
                }
            );
            return res.status(200).send("successfull")
            break;

        default:
            break;
    }
    // } catch (error) {
    //     res.status(500).send(error)
    // }
}

module.exports = orderController