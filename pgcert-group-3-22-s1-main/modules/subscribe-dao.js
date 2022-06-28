const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


async function subscribe(subscriberId, authorId) {
    const db = await dbPromise;

    await db.run(SQL`
        insert into subscribe (subscriber_id, publisher_id) values
            (${subscriberId}, ${authorId})
    `);

    return true;
};

async function unsubscribe(subscriberId, authorId) {
    const db = await dbPromise;

    await db.run(SQL`
        delete from subscribe
        where (subscriber_id = ${subscriberId} and publisher_id = ${authorId})
    `);

    return true;
};

async function checkIfSubscribed(subscriberId, authorId) {
    const db = await dbPromise;

    const checkSubscribed = await db.get(SQL`
        select * from subscribe
        where subscriber_id = ${subscriberId} and publisher_id = ${authorId}
    `);

    if (checkSubscribed) {
        return true;
    } else {
        return false;
    };
};

async function getAllMySubscribers(userId) {
    const db = await dbPromise;

    const subscribers = await db.all(SQL`
        select subscriber_id from subscribe
        where publisher_id = ${userId}
    `);

    return subscribers;
};

async function getAllMySubscriptions(userId) {
    const db = await dbPromise;

    const subscriptions = await db.all(SQL`
        select publisher_id from subscribe
        where subscriber_id = ${userId}
    `);

    return subscriptions;
};

module.exports = {
    subscribe,
    unsubscribe,
    checkIfSubscribed,
    getAllMySubscribers,
    getAllMySubscriptions
};