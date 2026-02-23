const fs = require('fs');
const path = require('path');
const axios = require('axios');

const companies = [
    { name: "Nice", domain: "nice.com" },
    { name: "RazorPay", domain: "razorpay.com" },
    { name: "Stripe", domain: "stripe.com" },
    { name: "Toast", domain: "pos.toasttab.com" },
    { name: "Rubrik", domain: "rubrik.com" },
    { name: "Databricks", domain: "databricks.com" },
    { name: "Coinbase", domain: "coinbase.com" },
    { name: "MongoDB", domain: "mongodb.com" },
    { name: "Airbnb", domain: "airbnb.com" },
    { name: "The Trade Desk", domain: "thetradedesk.com" },
    { name: "Tower Research Capital", domain: "tower-research.com" },
    { name: "Hackerrank", domain: "hackerrank.com" },
    { name: "Cloudflare", domain: "cloudflare.com" },
    { name: "Diligent Corporation", domain: "diligent.com" },
    { name: "Altium", domain: "altium.com" },
    { name: "Coursera", domain: "coursera.org" },
    { name: "Tekion", domain: "tekion.com" },
    { name: "Flexport", domain: "flexport.com" },
    { name: "New Relic", domain: "newrelic.com" },
    { name: "CommerceIQ", domain: "commerceiq.ai" },
    { name: "Yugabyte", domain: "yugabyte.com" },
    { name: "Postman", domain: "postman.com" },
    { name: "Rockstar Games", domain: "rockstargames.com" },
    { name: "FamPay", domain: "fampay.in" },
    { name: "Netomi", domain: "netomi.com" },
    { name: "Mindtickle", domain: "mindtickle.com" },
    { name: "Paytm", domain: "paytm.com" },
    { name: "Upstox", domain: "upstox.com" },
    { name: "ION", domain: "iongroup.com" },
    { name: "pattern", domain: "pattern.com" },
    { name: "SAFE", domain: "safecurity.com" },
    { name: "Brillio", domain: "brillio.com" },
    { name: "Sprinto", domain: "sprinto.com" },
    { name: "Zeta", domain: "zeta.tech" },
    { name: "Skypoint", domain: "skypointcloud.com" },
    { name: "Dozee", domain: "dozee.health" },
    { name: "CRED", domain: "cred.club" },
    { name: "Slack", domain: "slack.com" },
    { name: "Thomson Reuters", domain: "thomsonreuters.com" },
    { name: "Nvidia", domain: "nvidia.com" },
    { name: "Adobe", domain: "adobe.com" },
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "Mastercard", domain: "mastercard.com" },
    { name: "HP", domain: "hp.com" },
    { name: "Dell", domain: "dell.com" },
    { name: "Walmart", domain: "walmart.com" },
    { name: "Target", domain: "target.com" },
    { name: "FedEx", domain: "fedex.com" },
    { name: "Philips", domain: "philips.com" },
    { name: "Netflix", domain: "netflix.com" },
    { name: "Autodesk", domain: "autodesk.com" }
];

const downloadDir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadLogo(company) {
    const filename = `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    const filepath = path.join(downloadDir, filename);

    if (fs.existsSync(filepath)) {
        console.log(`Skipping ${company.name} (already cached)`);
        return { name: company.name, path: `/logos/${filename}` };
    }

    const url = `https://icon.horse/icon/${company.domain}`;
    console.log(`Downloading ${company.name}...`);

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });

        fs.writeFileSync(filepath, response.data);
        return { name: company.name, path: `/logos/${filename}` };
    } catch (error) {
        if (error.response) {
            return { name: company.name, path: null, error: `Status ${error.response.status}` };
        }
        return { name: company.name, path: null, error: error.message };
    }
}

async function run() {
    const mapping = {};
    for (const company of companies) {
        const result = await downloadLogo(company);
        if (result.path) {
            mapping[company.name] = result.path;
        } else {
            console.warn(`Failed mapping for ${company.name}: ${result.error}`);
        }
        await sleep(400); // 400ms to be safer
    }

    const mappingFile = path.join(__dirname, 'src', 'lib', 'company-logos.json');
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\nMapping written to ${mappingFile}`);
    console.log(`Total logos downloaded: ${Object.keys(mapping).length}/${companies.length}`);
}

run();
