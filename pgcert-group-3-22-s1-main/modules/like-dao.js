const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


async function createLike(user_id, article_id) {
    const db = await dbPromise;

    await db.run(SQL`
        insert into user_like_record (user_id, a_id) values
            (${user_id}, ${article_id})
    `);
};

async function displayTotalLike(id) {
    const db = await dbPromise;

    const articles = await db.all(SQL`
        select * from user_like_record
        where a_id = ${id}
    `);

    return articles;
};

async function checkLikeExists(user_id, a_id) {
    const db = await dbPromise;

    const userLikeExists = await db.get(SQL`
        select * from user_like_record
        where user_id = ${user_id} and a_id=${a_id}
    `);

    if (userLikeExists) {
        return false;
    } else {
        return true;
    };
};

async function removeLike(userID, articleID) {
    const db = await dbPromise;

    await db.run(SQL`
        delete from user_like_record
            where (user_id = ${userID} and a_id = ${articleID})
    `);
};

module.exports = {
    checkLikeExists,
    createLike,
    displayTotalLike,
    removeLike
};
