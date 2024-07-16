const User = require("./model/User")
const Company = require("./model/Company")
const Site = require("./model/Site")
const Service = require("./model/Service")
const Odoo = require("./odoo");

const getOrder = async (id) => {
    try {
        await Odoo.connect();
        const orderId = +id;

        // Fetch the order data by calling the 'sale.order' model and 'read' method with the order ID.
        // const orderData = await Odoo.execute_kw("sale.order", "read", [[["id", "=", orderId]]]);
        // console.log("orderData", orderData);

        const orders = await Odoo.execute_kw("sale.order", "read", [
            orderId,
            [
                "id",
                "partner_id",
                "order_line",
                "company_id",
                "name",
                "state",
                "amount_total",
                "date_order",
                "partner_id",
                "partner_shipping_id",
            ],
        ]);

        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const orderLines = await Odoo.execute_kw(
                    "sale.order.line",
                    "search_read",
                    [[["order_id", "=", order.id]]],
                    {
                        fields: ["product_id", "product_uom_qty", "price_unit"],
                    },
                );
                order.order_lines = orderLines;
                return order;
            }),
        );
        const orderLines = ordersWithDetails[0]?.order_lines || [];

        const productIds = orderLines.map((id) => id?.product_template_id?.[0]).filter(Boolean);

        const productDetailsPromises = productIds.map((id) => getProductDetails(id));
        const productDetails = await Promise.all(productDetailsPromises);
        const images = productDetails.flatMap(
            (info) => info?.map((data) => data?.x_images) || [],
        );
        const updatedOrderLines = orderLines.map((orderLine, index) => {
            const imageIndex = index % images.length; // Calculate index to loop through images array
            return {
                ...orderLine,
                x_images: JSON.parse(images[imageIndex]), // Assign corresponding array of images to x_images field
            };
        });
        const updatedOrder = { ...ordersWithDetails[0], order_lines: updatedOrderLines };
        if (orders.length > 0) {
            return updatedOrder
        } else {
            return [];
        }
    } catch (error) {
        // Handle any errors that may occur during the process.
        console.log("Error", error);
        return []
    }
}

const getProductDetails = async (id) => {
    await Odoo.connect();

    const productData = await Odoo.execute_kw("product.template", "search_read", [
        [["id", "=", id]],
        [
            "id",
            "name",
            "display_name",
            "list_price",
            "standard_price",
            "description",
            "base_unit_count",
            "product_variant_id",
            "categ_id",
            "rating_avg",
            "x_color",
            "x_dimension",
            "x_size",
            "x_subcategory",
            "x_weight",
            "x_rating",
            "x_images",
            "x_free_shipping",
            "x_brand_gate_id",
            "x_brand_gate_variant_id",
            "x_show_sold_count",
            "rating_count",
            "website_url",
            "public_categ_ids",
            "website_meta_keywords",
            "x_shipping_package",
            "x_printify_id",
            "x_printify_variant_id",
            "x_printify_shop_id",
            "attribute_line_ids",
            "x_discount",
            "x_featured_product",
            "x_total_available_qty",
            "x_aliexpress_id",
            "x_aliexpress_variant_id",
            "x_vision_id",
            "x_vision_model",
            "x_printful_id",
            "x_printful_variant_id",
            "x_gelato_id",
            "x_gelato_variant_id"
        ],
    ]);
    return productData
}

const getAddress = async (partnerID, addressID) => {
    if (!partnerID || !addressID) {
        return false
    }
    await Odoo.connect();
    const partnerAddresses = await Odoo.execute_kw("res.partner", "search_read", [
        [["parent_id", "=", partnerID]],
        [
            "name",
            "street",
            "city",
            "zip",
            "country_id",
            "state_id",
            "type",
            "phone",
            "email",
        ], // Fields you want to retrieve
    ]);
    const shippingAddress = partnerAddresses.find((add) => add.id === addressID);
    return shippingAddress
}

const deleteCompany = async (id) => {
    try {
        const company = await Company.findById(id)
        if (!company) {
            return false
        }
        if (company.type !== "service") {
            await Odoo.connect();
            let searchFilter = [
                ["type", "=", "consu"],
                ["company_id", "=", company.company_id],
            ];
            const theProducts = await Odoo.execute_kw(
                "product.template",
                "search_read",
                [
                    searchFilter,
                    [
                        "id",
                    ],
                    null,
                    0,
                    // 10,
                ],
                { fields: ["name", "public_categ_ids"] },
            );
            for (const product of theProducts) {
                await Odoo.execute_kw("product.template", "unlink", [[Number(product.id)]]);
            }
        } else {
            const services = await Service.find({ userId: company.user_id })
            for (const service of services) {
                await Service.findByIdAndDelete(service._id)
            }
        }
        await Site.findByIdAndDelete(company.site)
        await Company.findByIdAndDelete(company._id)
        await User.findByIdAndDelete(company.user_id)
        return true
    } catch (error) {
        console.log("err", error.message);
        return false
    }
}

module.exports = {
    getAddress,
    getOrder,
    getProductDetails,
    deleteCompany
}