const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();

// The DAO that handles CRUD operations for users.
const userDao = require("../modules/users-dao.js");

// Whenever we POST to /login, check the username and password submitted by the user.
// If they match a user in the database, give that user an authToken, save the authToken
// in a cookie, and redirect to "/". Otherwise, redirect to "/login", with a "login failed" message.
router.post("/login", async function (req, res) {

    // Get the username and password submitted in the form
    const username = req.body.username;
    const password = req.body.password;

    // Find a matching user in the database
    const user = await userDao.retrieveUserWithCredentials(username, password);

    // if there is a matching user...
    if (user) {
        // Auth success - give that user an authToken, save the token in a cookie, and redirect to the homepage.
        const authToken = uuid();
        user.authToken = authToken;
        await userDao.updateUser(user);
        res.cookie("authToken", authToken);
        res.locals.user = user;
        res.redirect("/");
    }
    // Otherwise, if there's no matching user...
    else {
        // Auth fail
        res.locals.user = null;
        res.redirect("/?loginMessage=Authentication failed!&showLogin=true");

    };
});

// Whenever we navigate to /logout, delete the authToken cookie.
// redirect to "/login", supplying a "logged out successfully" message.
router.get("/logout", async function (req, res) {
    const user = res.locals.user;

    if (user) {
        await userDao.removeAuthToken(res.locals.user.id);
        res.clearCookie("authToken");
        res.locals.user = null;
    }

    res.redirect("/");
});

// Retrieve the information that the user has inputted into the textboxes
// and create a new user account. If an error is caught, reopen the createAccount popup.
router.post("/newAccount", async function (req, res) {

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
        await userDao.createUser(user);
        res.redirect("/?loginMessage=Account creation successful. Please login using your new credentials.&showLogin=true")
    }
    catch (err) {
        res.render("home", { createAccountMessage: "Something went wrong, please try again.", showCreateAccount: true });
    };

});

module.exports = router;