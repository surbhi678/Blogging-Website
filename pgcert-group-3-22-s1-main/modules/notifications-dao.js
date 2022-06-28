const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


async function createNotification(notificationData) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        insert into notifications (subscriber_id, link, notification, date_of_notification, publisher_avatar) values
            (${notificationData.subscriberID}, ${notificationData.link}, ${notificationData.notification}, ${notificationData.dateOfNotification}, ${notificationData.publisherAvatar})
    `);

    notificationData.id = result.lastID;
};

async function displayLatestNotificationsByUser(subscriberID, unreadCount) {
    const db = await dbPromise;

    const results = await db.all(SQL`
        select * from notifications
            where subscriber_id = ${subscriberID}
            order by read asc, date_of_notification desc
            limit ${unreadCount}
    `);

    return results;
};

async function setRead(notificationID) {
    const db = await dbPromise;

    await db.run(SQL`
        update notifications
            set read = 1
            where notification_id = ${notificationID}
    `);
};

async function getUnreadCountByUser(subscriberID) {
    const db = await dbPromise;

    const count = await db.get(SQL`
        select count(*) from notifications
            where (subscriber_id = ${subscriberID} and read = 0)
    `);

    return Object.values(count)[0];
};

module.exports = {
    createNotification,
    displayLatestNotificationsByUser,
    setRead,
    getUnreadCountByUser
};