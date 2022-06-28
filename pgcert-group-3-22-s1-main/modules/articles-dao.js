const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


async function createArticle(articleData) {
    const db = await dbPromise;

    if (articleData.image){
        const result = await db.run(SQL`
        insert into articles (article, title, article_create_date, author, author_id, image) values
            (${articleData.article}, ${articleData.title}, ${articleData.article_create_date}, ${articleData.author}, ${articleData.author_id}, ${articleData.image})
    `);
    
    articleData.id = result.lastID;
    return articleData.id;

    } else {
        const result = await db.run(SQL`
        insert into articles (article, title, article_create_date, author, author_id) values
            (${articleData.article}, ${articleData.title}, ${articleData.article_create_date}, ${articleData.author}, ${articleData.author_id})
    `);
    
    articleData.id = result.lastID;
    return articleData.id;

    };
};

async function retrieveArticleByArticleId(id) {
    const db = await dbPromise;

    const article = await db.get(SQL`
        select * from articles
        where article_id = ${id}`);

    return article;
};

async function updateArticle(articleData) {
    const db = await dbPromise;

    if (articleData.image){
        await db.run(SQL`
        update articles
        set article = ${articleData.article}, title = ${articleData.title}, image = ${articleData.image}
        where article_id = ${articleData.article_id}
        `);
    }else {
        await db.run(SQL`
        update articles
        set article = ${articleData.article}, title = ${articleData.title}
        where article_id = ${articleData.article_id}
        `);
    };
    
};

async function deleteArticle(id) {
    const db = await dbPromise;

    await db.run(SQL`
        delete from articles
        where article_id = ${id}`);

    return true;
};

async function removeImage(articleID) {
    const db = await dbPromise;
    await db.run(SQL`
        update articles
        set image = "blankImage.png"
        where article_id = ${articleID}
    `);

    return true;
};

async function sortArticlesByTitle() {
    const db = await dbPromise;

    const articlesByTitle = await db.all(SQL`
        select * from articles
        order by lower(title) asc
    `);

    return articlesByTitle;
};

async function sortArticlesByUsername() {
    const db = await dbPromise;

    const articlesByUsername = await db.all(SQL`
        select * from articles
        order by lower(author) asc
    `);

    return articlesByUsername;
};

async function sortArticlesByDate() {
    const db = await dbPromise;

    const articlesByDate = await db.all(SQL`
        select * from articles
        order by article_create_date asc
    `);

    return articlesByDate;
};

async function retrieveArticleByAuthorId(id) {
    const db = await dbPromise;

    const articlesByAuthor = await db.all(SQL`
        select * from articles
            where author_id = ${id}
    `);

    return articlesByAuthor;
};

async function retrieveAllArticles() {
    const db = await dbPromise;

    const allArticles = await db.all(SQL`
        select * from articles
    `);

    return allArticles;
};

async function updateLikes(articleID, numberOfLikes) {
    const db = await dbPromise;

    await db.run(SQL`
        update articles
        set number_of_likes = ${numberOfLikes}
        where article_id = ${articleID}`);
        
};

async function updateTotalComments(articleID, totalComments) {
    const db = await dbPromise;

    await db.run(SQL`
        update articles
        set number_of_comments = ${totalComments}
        where article_id = ${articleID}
    `);
};

async function updatePopularity(articleID, popularity) {
    const db = await dbPromise;

    await db.run(SQL`
        update articles
        set popularity= ${popularity}
        where article_id = ${articleID}
    `);
};

async function sortArticlesByPopularity() {
    const db = await dbPromise;

    const articlesByPopularity = await db.all(SQL`
        select * from articles
        order by popularity desc
    `);

    return articlesByPopularity;
};

module.exports = {
    sortArticlesByPopularity,
    updatePopularity,
    updateTotalComments,
    createArticle,
    retrieveArticleByArticleId,
    updateArticle,
    deleteArticle,
    removeImage,
    sortArticlesByTitle,
    sortArticlesByUsername,
    sortArticlesByDate,
    retrieveArticleByAuthorId,
    retrieveAllArticles,
    updateLikes
};