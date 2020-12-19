const needle = require('needle');
const { isObject } = require('util');
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

const rules = [{ value : 'BEP stock' }];

// Get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });
    return response.body;
};

// Set stream rules
async function setRules() {
    const data = {
        add: rules
    };
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    });
    return response.body;
};

// Delete stream rules
async function deleteRules(rules) {
    if(!Array.isArray(rules.data)) return null;

    const ids = rules.data.map(rule => rule.id);
    const data = {
        delete: {
            id: ids
        }
    };
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    });
    return response.body;
};

function streamTweets() {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data)
            console.log(json)
        } catch (error) {            
        };
    });
};

// an iffy
;(async () => {
    let currentRules;

    try {
        // Gets all the stream rules
        currentRules = await getRules();

        // Deletes all the stream rules
        await deleteRules(currentRules);

        // Sets rules based on the array above
        await setRules();
    } catch (error) {
        console.error(error);
        process.exit(1);
    };

    streamTweets()
})()