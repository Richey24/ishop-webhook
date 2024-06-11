const Odoo = require('async-odoo-xmlrpc');

module.exports = new Odoo({
    url: process.env.ODOO_URI,
    port: process.env.ODOO_PORT,
    db: process.env.ODOO_DB,
    username: process.env.ODOO_USERNAME,
    password: process.env.ODOO_PASSWORD
}); 
