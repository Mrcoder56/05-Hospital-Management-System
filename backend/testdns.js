const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cluster0.nlkzuao.mongodb.net", (err, records) => {
    if (err) {
        console.error("DNS ERROR:");
        console.error(err);
    } else {
        console.log(records);
    }
});