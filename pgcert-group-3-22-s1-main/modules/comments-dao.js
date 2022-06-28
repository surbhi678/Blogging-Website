const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


async function createComment(comment) {
    const db = await dbPromise;

    if (comment.parentID != null) {
        const result = await db.run(SQL`
            insert into comments (comment, comment_date, username_id, article_id, parent_comment_id) values
                (${comment.comment}, ${comment.date}, ${comment.user}, ${comment.article}, ${comment.parentID})
        `);
        comment.id = result.lastID;
        return comment.id;
    } else {
        const result = await db.run(SQL`
            insert into comments (comment, comment_date, username_id, article_id) values
                (${comment.comment}, ${comment.date}, ${comment.user}, ${comment.article})
        `);
        comment.id = result.lastID;
        return comment.id;
    };
};

async function setCommentParent(parentID, commentID) {
    const db = await dbPromise;
    
    await db.get(SQL`
        update comments
            set parent_comment_id = ${parentID}
            where comment_id = ${commentID}
    `);
};

async function retrieveComment(commentID) {
    const db = await dbPromise;

    const result = await db.get(SQL`
        select * from comments
            where comment_id = ${commentID}
    `);

    return result;
};

async function retrieveArticleComments(articleID) {
    const db = await dbPromise;

    const result = await db.all(SQL`
        select * from comments
            where article_id = ${articleID}
    `);

    return result;
};

async function retrieveAllComments() {
    const db = await dbPromise;

    const result = await db.all(SQL`
        select * from comments
    `);

    return result;
};

async function deleteComment(commentID) {
    const db = await dbPromise;

    await db.run(SQL`
        update comments
            set comment = "Comment has been deleted"
            where comment_id = ${commentID}
    `);
};

async function retrieveTotalDayComments(articleID, date) {
    const db = await dbPromise;

    const result = await db.all(SQL`
        select * from comments
            where article_id = ${articleID} and comment_date=${date}
    `);
    
    return result;
};

module.exports = {
    retrieveTotalDayComments,
    retrieveAllComments,
    createComment,
    setCommentParent,
    retrieveComment,
    retrieveArticleComments,
    deleteComment
};