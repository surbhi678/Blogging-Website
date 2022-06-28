/**
 * Main application file.
 *
 * NOTE: This file contains many required packages, but not all of them - you may need to add more!
 */

// Setup Express
const express = require("express");
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");

//const hbs = handlebars.create({})

app.engine("handlebars", handlebars({
    defaultLayout: "main",
    helpers: {
        checkOwnComment: function (userID, commentCreator, authorID) {
            if ((userID == commentCreator) || (userID == authorID)) {
                return true;
            };
            return false;
        },
        commentDeleted: function (comment) {
            if (comment == "Comment has been deleted") {
                return true;
            };
            return false;
        },
        checkIfUserIsAuthor: function (userID, authorID) {
            if (userID == authorID) {
                return true;
            };
            return false;
        },
        checkUnread: function (readStatus) {
            if (readStatus == 0) {
                return true;
            };
            return false;
        }
    }
}));
app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.urlencoded({ extended: false }));

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
const req = require("express/lib/request");
app.use(express.static(path.join(__dirname, "public")));

// Setup our middleware
app.use(require("./middleware/toaster-middleware.js"));
const { addUserToLocals } = require("./middleware/auth-middleware.js");
app.use(addUserToLocals);

// Setup routes
app.use(require("./routes/application-routes.js"));
app.use(require("./routes/login-routes.js"));
app.use(require("./routes/api-routes.js"));

const articlesDao = require("./modules/articles-dao");
const likeDao = require("./modules/like-dao");

const commentsDao = require("./modules/comments-dao");
const subscribeDao = require("./modules/subscribe-dao");
const notificationsDao = require("./modules/notifications-dao");

// Start the server running.
app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});

const userDao = require("./modules/users-dao");
const { options } = require("./routes/application-routes.js");
const { fdatasync } = require("fs");
const { hash } = require("bcrypt");
const { stringify } = require("querystring");

app.get("/checkUsername", async function (req, res) {
    const currentInput = req.query.currentInput;
    const checkUsername = await userDao.checkUsernameExists(currentInput);
    res.json(checkUsername);

});

app.get("/sortArticles", async function (req, res) {
    const articleSortType = req.query.sortBy;
    let sortType;
    if (articleSortType == "articleTitle") {
        sortType = await articlesDao.sortArticlesByTitle();
    };
    if (articleSortType == "username") {
        sortType = await articlesDao.sortArticlesByUsername();
    };
    if (articleSortType == "date") {
        sortType = await articlesDao.sortArticlesByDate();
    };
    res.json(sortType);

});

app.get("/articleToDelete", async function (req, res) {
    const articleToDelete = req.query.delete;
    await articlesDao.deleteArticle(articleToDelete);
    res.send("Deleted");

});

app.get("/commentToDelete", async function (req, res) {
    await commentsDao.deleteComment(req.query.commentID);

});

app.get("/deleteAccount", async function (req, res) {
    const accountToDelete = req.query.id;
    let result = await userDao.deleteUser(accountToDelete);

    res.json(result);
});

app.get("/removeImage", async function (req, res) {
    const articleID = req.query.remove;
    await articlesDao.removeImage(articleID);

    res.send("Deleted");
});

app.get("/checkArticleLikes", async function (req, res) {
    const checkUsername = await likeDao.checkUsernameExists(currentInput);
    res.json(checkUsername);
    
});

app.get("/articleLikes", async function (req, res) {
    const articleID = req.query.articleID;
    const userID = req.query.userID;
    let numberOfLikes = parseInt(req.query.numberOfLikes);
    const likeDoesntExist = await likeDao.checkLikeExists(userID, articleID);

    if (likeDoesntExist == true) {
        await likeDao.createLike(userID, articleID);
        numberOfLikes += 1;
        await articlesDao.updateLikes(articleID, numberOfLikes);
        res.send("true")
    } else {
        await likeDao.removeLike(userID, articleID);
        numberOfLikes -= 1;
        await articlesDao.updateLikes(articleID, numberOfLikes);
        res.send("false")

    };
});

app.get("/checkLiked", async function (req, res) {
    const userID = req.query.userID;
    const articleID = req.query.articleID;
    const likeDoesntExist = await likeDao.checkLikeExists(userID, articleID)

    if (likeDoesntExist) {
        res.send("false")

    } else {
        res.send("true")

    };
});

app.get("/subscribe", async function (req, res) {
    const userID = req.query.id;
    const authorID = req.query.authorId;

    await subscribeDao.subscribe(userID, authorID);

    const user = await userDao.retrieveUserById(userID);

    const notificationData = {
        subscriberID: authorID,
        link: `./visitProfile?id=${userID}`,
        notification: `${user.username} just subscribed to you!`,
        dateOfNotification: getDate(),
        publisherAvatar: user.avatar
    };

    await notificationsDao.createNotification(notificationData);
    res.send("Subscribed!");

});

app.get("/unsubscribe", async function (req, res) {
    const userID = req.query.id;
    const authorID = req.query.authorId;

    await subscribeDao.unsubscribe(userID, authorID);
    res.send("Unsubscribed...");

});

app.get("/histogram", async function (req, res) {
    //getting all wanted date
    var now = new Date();
    now.setDate(now.getDate() + 1);

    var daysOfYear = [];
    let rangeOfDate = [];
    for (var d = new Date("2022-05-28T00:00:00.680Z"); d <= now; d.setDate(d.getDate() + 1)) {

        daysOfYear.push(new Date(d));
    }
    for (let i = 0; i < daysOfYear.length; i++) {
        let check = daysOfYear[i].toISOString().split('T')[0];
        rangeOfDate.push(check);
    }
    const date = await commentsDao.retrieveAllComments();

    const userID = req.query.userID;

    // get all the userID created articleID
    const createdArticle = await articlesDao.retrieveArticleByAuthorId(userID);
    let storeAllCreatedArticleId = [];
    for (let i = 0; i < createdArticle.length; i++) {
        storeAllCreatedArticleId.push(createdArticle[i].article_id);
    };
    const recordDailyComments = [];

    for (let i = 0; i < rangeOfDate.length; i++) {

        let recordComments = 0;
        for (let j = 0; j < date.length; j++) {
            let validDate = date[j].comment_date.split(" ")[0];
            if (validDate == rangeOfDate[i] && (storeAllCreatedArticleId.includes(date[j].article_id)) && (date[j].comment !== "Comment has been deleted")) {
                recordComments += 1;
            };
        };

        recordDailyComments.push(recordComments);
    };
    let histogramJson = {
        recordDailyComments: recordDailyComments,
        rangeOfDate: rangeOfDate
    };

    res.json(histogramJson);

});

app.get("/setNotificationRead", async function (req, res) {
    await notificationsDao.setRead(req.query.notificationID)
    res.send("yes")
})

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
    };
    if (day.toString().length == 1) {
        day = "0" + day.toString();
    };
    if (hours.toString().length == 1) {
        hours = "0" + hours.toString();
    };
    if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString();
    };
    if (seconds.toString().length == 1) {
        seconds = "0" + seconds.toString();
    };

    return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;

};