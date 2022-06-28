const express = require("express");
const router = express.Router();

const { verifyAuthenticated, getNotifications } = require("../middleware/auth-middleware.js");
const usersDao = require("../modules/users-dao.js");
const articlesDao = require("../modules/articles-dao.js");
const commentsDao = require("../modules/comments-dao.js");
const likeDao = require("../modules/like-dao.js");
const subscribeDao = require("../modules/subscribe-dao.js");
const notificationsDao = require("../modules/notifications-dao.js")

const fs = require("fs");
const jimp = require("jimp");
const path = require("path");
const multer = require("multer");
const { error } = require("console");
const upload = multer({
    dest: path.join(__dirname, "temp")
});

router.get("/", getNotifications, async function (req, res) {
    const allArticles = await articlesDao.retrieveAllArticles();

    res.locals.loginMessage = req.query.loginMessage;
    res.locals.showLogin = req.query.showLogin;

    const user = res.locals.user;

    if (user) {
        for (let i = 0; i < allArticles.length; i++) {
            const articlesLikesValidity = await likeDao.checkLikeExists(user.id, allArticles[i].article_id);
            allArticles[i].liked = articlesLikesValidity;
        };
    };

    res.locals.allArticles = allArticles;

    //for display all the article user created

    if (user) {
        let allUserArticles = await articlesDao.retrieveArticleByAuthorId(user.id);
        res.locals.allUserArticles = allUserArticles;
    }

    res.render("home");
});

router.get("/manageArticles", verifyAuthenticated, getNotifications, async function (req, res) {
    const user = res.locals.user;
    const userArticles = await articlesDao.retrieveArticleByAuthorId(user.id);

    res.locals.userArticles = userArticles;

    res.render("manageArticles");
});

router.get("/manageAccount", verifyAuthenticated, getNotifications, async function (req, res) {
    const user = res.locals.user;

    res.locals.user = user;
    const birthday = user.date_of_birth.split("-");
    res.locals.year = birthday[0];
    res.locals.month = birthday[1];
    res.locals.date = birthday[2];

    res.render("manageAccount");
});

router.post("/manageAccount", verifyAuthenticated, async function (req, res) {
    const userID = res.locals.user.id;

    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        dobDay: req.body.dobDay,
        dobMonth: req.body.dobMonth,
        dobYear: req.body.dobYear,
        description: req.body.description
    };

    try {
        await usersDao.updateUserDetails(user, userID);
        res.locals.user = user;
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.redirect("/manageAccount?message=Something went wrong, please try again.");

    };
});

router.get("/manageSubscriptions", verifyAuthenticated, getNotifications, async function (req, res) {

    const subscribedList = await subscribeDao.getAllMySubscriptions(res.locals.user.id);
    const subscribers = await subscribeDao.getAllMySubscribers(res.locals.user.id);

    for (const subscribed of subscribedList) {
        const authorSubscribedTo = await usersDao.retrieveUserById(subscribed.publisher_id);
        subscribed.id = authorSubscribedTo.id;
        subscribed.avatar = authorSubscribedTo.avatar;
        subscribed.username = authorSubscribedTo.username;
    };

    for (const subscriber of subscribers) {
        const authorSubscribedToUser = await usersDao.retrieveUserById(subscriber.subscriber_id);
        subscriber.id = authorSubscribedToUser.id;
        subscriber.avatar = authorSubscribedToUser.avatar;
        subscriber.username = authorSubscribedToUser.username;
    };

    res.locals.subscribedList = subscribedList;
    res.locals.subscribers = subscribers;

    res.render("manageSubscriptions");
});

router.get("/createArticle", verifyAuthenticated, getNotifications, async function (req, res) {
    res.render("createArticle");
});

router.post("/submitArticle", verifyAuthenticated, upload.single("imageFile"), async function (req, res) {
    const user = res.locals.user;

    let articleID;
    let articleData = {};
    const fileInfo = req.file;

    const dateString = getDate();

    if (fileInfo) {
        let fileNames = fs.readdirSync("public/images/thumbnails");
        const allowedFileTypes = [".bmp", ".jpg", ".jpeg", ".png", ".gif"];
        fileNames = fileNames.filter(function (fileName) {
            const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
            return allowedFileTypes.includes(extension);
        });

        const fileType = fileInfo.originalname.split(".").pop();

        const oldFileName = fileInfo.path;
        const resizeImage = await jimp.read(oldFileName);
        resizeImage.resize(400, jimp.AUTO);
        const newFileName =  await resizeImage.write(`./public/images/image_${fileNames.length + 1}.${fileType}`)
    
        const image = await jimp.read(newFileName);
        image.resize(120, jimp.AUTO);
        await image.write(`./public/images/thumbnails/image_${fileNames.length + 1}.${fileType}`);

        articleData = {
            article: req.body.articleText,
            title: req.body.articleTitle,
            article_create_date: dateString,
            author: user.username,
            author_id: user.id,
            image: `image_${fileNames.length + 1}.${fileType}`
        };

    } else {
        articleData = {
            article: req.body.articleText,
            title: req.body.articleTitle,
            article_create_date: dateString,
            author: user.username,
            author_id: user.id,
            image: `blankImage.png`
        };
    };

    articleID = await articlesDao.createArticle(articleData);

    const subscribers = await subscribeDao.getAllMySubscribers(user.id);

    for (const subscriber of subscribers) {

        const notificationData = {
            subscriberID: subscriber.subscriber_id,
            link: `./visitArticle?id=${articleID}`,
            notification: `${articleData.author} published a new article "${articleData.title}"`,
            dateOfNotification: dateString,
            publisherAvatar: user.avatar
        };

        await notificationsDao.createNotification(notificationData);
    };

    res.redirect("/manageArticles");
});


router.get("/editArticle", verifyAuthenticated, getNotifications, async function (req, res) {
    const articleId = req.query.id;
    const article = await articlesDao.retrieveArticleByArticleId(articleId);
    res.locals.article = article;

    res.render("editArticle");
});

router.post("/editArticle", verifyAuthenticated, upload.single("imageFile"), async function (req, res) {

    const fileInfo = req.file;
    let articleData = {};

    if (fileInfo) {
        let fileNames = fs.readdirSync("public/images/thumbnails");
        const allowedFileTypes = [".bmp", ".jpg", ".jpeg", ".png", ".gif"];
        fileNames = fileNames.filter(function (fileName) {
            const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
            return allowedFileTypes.includes(extension);
        });

        const fileType = fileInfo.originalname.split(".").pop();

        const oldFileName = fileInfo.path;
        const resizeImage = await jimp.read(oldFileName);
        resizeImage.resize(400, jimp.AUTO);
        const newFileName =  await resizeImage.write(`./public/images/image_${fileNames.length + 1}.${fileType}`)

        const image = await jimp.read(newFileName);
        image.resize(120, jimp.AUTO);
        await image.write(`./public/images/thumbnails/image_${fileNames.length + 1}.${fileType}`);

        articleData = {
            article: req.body.articleText,
            title: req.body.articleTitle,
            article_id: req.query.id,
            image: `image_${fileNames.length + 1}.${fileType}`
        };


    } else {
        articleData = {
            article: req.body.articleText,
            title: req.body.articleTitle,
            article_id: req.query.id,
        };
    };

    await articlesDao.updateArticle(articleData);

    res.redirect("/manageArticles");
});

router.get("/analytics", verifyAuthenticated, getNotifications, async function (req, res) {
    const user = res.locals.user;
    const article = await articlesDao.retrieveArticleByAuthorId(user.id);

    let totalLikesForUser = 0;
    let storeAllArticleId = [];
    for (let i = 0; i < article.length; i++) {
        totalLikesForUser += article[i].number_of_likes;
        storeAllArticleId.push(article[i].article_id);
    };
    let thisArticleTotalComments = 0;
    //for update not only the all comments and with the already deleted ones
    let deletedComments = 0;

    for (let i = 0; i < storeAllArticleId.length; i++) {

        let thisArticleAllComments = await commentsDao.retrieveArticleComments(storeAllArticleId[i]);

        //update the total comments in the database
        await articlesDao.updateTotalComments(storeAllArticleId[i], Object.keys(thisArticleAllComments).length);

        //loop through to find all deleted ones
        for (let j = 0; j < thisArticleAllComments.length; j++) {

            if (thisArticleAllComments[j].comment === "Comment has been deleted") {

                deletedComments += 1;
                //update comments when deleted
                const currentArticleComments = await articlesDao.retrieveArticleByArticleId(thisArticleAllComments[j].article_id);
                await articlesDao.updateTotalComments(thisArticleAllComments[j].article_id, parseInt(currentArticleComments.number_of_comments) - 1);

            };
        };

        thisArticleTotalComments += Object.keys(thisArticleAllComments).length;
    };

    thisArticleTotalComments = thisArticleTotalComments - deletedComments;

    res.locals.totalLikesForUser = totalLikesForUser;
    res.locals.thisArticleTotalComments = thisArticleTotalComments;

    //display total subscribe

    const getTotalSubscribers = await subscribeDao.getAllMySubscribers(user.id);
    const totalSubscribers = Object.keys(getTotalSubscribers).length;
    res.locals.totalSubscribers = totalSubscribers;

    // display most popular articles = comments*1.5+like;

    let updateAllArticle = await articlesDao.retrieveAllArticles();
    for (let i = 0; i < updateAllArticle.length; i++) {

        let like = updateAllArticle[i].number_of_likes;
        let comment = updateAllArticle[i].number_of_comments;
        let popularity = comment * 1.5 + like;
        await articlesDao.updatePopularity(updateAllArticle[i].article_id, popularity);

    };

    //displaying first three popular articles
    let sortedPopularityArticle = await articlesDao.sortArticlesByPopularity();
    let topThreeArticle = sortedPopularityArticle.slice(0, 3);
    for (let i = 0; i < topThreeArticle.length; i++) {

        topThreeArticle[i].rank = i + 1;

    };

    res.locals.topThreeArticle = topThreeArticle;

    //histogram try to loop through every date we want in the comment table and we have the all the article_id created by this user
    //and if the comment's article id is exist then we record the comments.
    //we find the total number commentd for each day.

    res.render("analytics");
});

router.get("/visitArticle", getNotifications, async function (req, res) {
    try {
        const articleID = req.query.id;
        const article = await articlesDao.retrieveArticleByArticleId(articleID);
        if (!article) {
            throw new error;
        }
        const comments = await commentsDao.retrieveArticleComments(articleID);

        for (const comment of comments) {
            let user = await usersDao.retrieveUserById(comment.username_id)
            comment.username = user.username;
        };

        res.locals.article = article;

        res.locals.comments = sortComments(comments);

        const user = res.locals.user;

        if (user) {
            const subscribed = await subscribeDao.checkIfSubscribed(user.id, article.author_id);
            res.locals.subscriber = subscribed;
        };

        res.render("viewArticle");

    } catch (error) {
        res.render("pageNotFound");
    };
});

router.post("/postComment", async function (req, res) {
    const user = res.locals.user;

    const dateString = getDate();

    const commentData = {
        comment: req.body.commentText,
        date: dateString,
        user: user.id,
        article: req.query.articleID
    };

    await commentsDao.createComment(commentData);

    res.redirect(`./visitArticle?id=${req.query.articleID}`);
});

router.post("/replyComment", async function (req, res) {
    const user = res.locals.user;

    const dateString = getDate();

    const commentData = {
        comment: req.body.replyText,
        date: dateString,
        user: user.id,
        article: req.query.articleID,
        parentID: req.query.parentID
    };

    await commentsDao.createComment(commentData);
    const parentComment = await commentsDao.retrieveComment(req.query.parentID);
    const article = await articlesDao.retrieveArticleByArticleId(req.query.articleID);

    const notificationData = {
        subscriberID: parentComment.username_id,
        link: `./visitArticle?id=${req.query.articleID}`,
        notification: `${user.username} just replied to your comment on "${article.title}"`,
        dateOfNotification: dateString,
        publisherAvatar: user.avatar
    };

    if (user.id != parentComment.username_id) {
        await notificationsDao.createNotification(notificationData);
    };

    res.redirect(`./visitArticle?id=${req.query.articleID}`);
});

router.get("/visitProfile", getNotifications, async function (req, res) {
    const authorID = req.query.id;

    const profile = await usersDao.retrieveUserById(authorID);

    if (profile) {
        const articlesByProfile = await articlesDao.retrieveArticleByAuthorId(authorID);

        res.locals.articles = articlesByProfile;
        res.locals.profile = profile;

        const user = res.locals.user;

        if (user) {
            const subscribed = await subscribeDao.checkIfSubscribed(user.id, profile.id);
            res.locals.subscriber = subscribed;
        };

        res.render("visitProfile");
    } else {
        res.render("pageNotFound");
    };

});

function getDate() {
    const now = new Date();

    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    if (month.toString().length == 1) {
        month = "0" + month.toString();
    }
    if (day.toString().length == 1) {
        day = "0" + day.toString();
    }
    if (hours.toString().length == 1) {
        hours = "0" + hours.toString();
    }
    if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString();
    }
    if (seconds.toString().length == 1) {
        seconds = "0" + seconds.toString();
    }

    return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;
};

function sortComments(comments) {
    const createDataTree = dataset => {
        const hashTable = Object.create(null);
        dataset.forEach(aData => hashTable[aData.comment_id] = { ...aData, childNodes: [] });
        const dataTree = [];
        dataset.forEach(aData => {
            if (aData.parent_comment_id) {
                hashTable[aData.parent_comment_id].childNodes.push(hashTable[aData.comment_id]);
            }
            else {
                dataTree.push(hashTable[aData.comment_id]);
            }
        });
        return dataTree;
    };

    const sorted = createDataTree(comments);
    return sorted;
    
};



module.exports = router;