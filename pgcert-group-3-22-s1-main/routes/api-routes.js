const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();
router.use(express.json());
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const usersDao = require("../modules/users-dao.js");
const articlesDao = require("../modules/articles-dao.js");

router.post("/api/login", async function (req, res) {

    const username = req.body.username;
    const password = req.body.password;

    let user = await usersDao.retrieveUserWithCredentials(username, password);

    if (user == undefined) {
        res.status(401).send("Error");

    } else if (user.admin == 1) {
        const authToken = uuid();
        user.authToken = authToken;
        await usersDao.updateUser(user);
        res.cookie("authToken", authToken);
        res.status(204).send();
    } else {
        res.status(401).send("Error");
    };
});

router.get("/api/logout", async function (req, res) {

    if (req.cookies.authToken) {
        const user = await usersDao.retrieveUserWithAuthToken(req.cookies.authToken);
        await usersDao.removeAuthToken(user.id);
        res.status(204).send();
    };

    res.status(401).send();
});

router.get("/api/users", async function (req, res) {

    const user = await usersDao.retrieveUserWithAuthToken(req.cookies.authToken);

    if (!user) {
        res.status(401).send();
    } else if (user.admin == 1) {
        
            const users = await usersDao.retrieveAllUsers();

            for (const user of users) {
                const articles = await articlesDao.retrieveArticleByAuthorId(user.id);

                const articleCount = articles.length;
                user.articleCount = articleCount;
            };

            res.json(users);
    };
});

router.delete("/api/users/:id", async function (req, res) {

    const user = await usersDao.retrieveUserWithAuthToken(req.cookies.authToken);

    if (user.admin == 1) {

        if (req.params.id) {
            await usersDao.deleteUser(req.params.id);
            res.status(204).send();
        } else {
            res.status(401).send();
        }
    }
    res.status(401).send();
})

module.exports = router;
