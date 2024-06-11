const crypto = require("crypto")

const CHARSET_UTF8 = 'UTF-8';
const SIGN_METHOD_SHA256 = 'sha256';

function signApiRequest(params, appSecret, signMethod, apiName) {
    // If you are using Business Interface, please do as step 1, add api_path into params.
    // params["method"] = apiName;

    // sort all text parameters
    const keys = Object.keys(params).sort();

    // connect all text parameters with key and value
    let query = '';
    // If you are using System Interface, please do as step 3
    // append API name
    query += apiName;
    keys.forEach(key => {
        const value = params[key];
        if (areNotEmpty(key, value)) {
            query += key + value;
        }
    });

    // sign the whole request
    let bytes = null;

    if (signMethod === SIGN_METHOD_SHA256) {
        bytes = encryptHMACSHA256(query, appSecret);
    }

    // finally: transfer sign result from binary to upper hex string
    return byte2hex(bytes);
}

function encryptHMACSHA256(data, secret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac(SIGN_METHOD_SHA256, secret);
    hmac.update(data, CHARSET_UTF8);
    return hmac.digest();
}

/**
 * Transfer binary array to HEX string.
 */
function byte2hex(bytes) {
    let sign = '';
    for (let i = 0; i < bytes.length; i++) {
        let hex = (bytes[i] & 0xFF).toString(16);
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        sign += hex.toUpperCase();
    }
    return sign;
}

function areNotEmpty(...values) {
    return values.every(value => value != null && value !== '');
}

module.exports = signApiRequest