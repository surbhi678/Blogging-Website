const userDao = require("../modules/users-dao.js")
const notificationsDao = require("../modules/notifications-dao.js")

async function addUserToLocals(req, res, next) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken)
    res.locals.user = user;
    next();
}

function verifyAuthenticated(req, res, next) {
    if (res.locals.user) {
        next();
    }
    else {
        res.redirect("/");
    }
}

async function getNotifications(req, res, next) {
    if (res.locals.user) {
        let unreadCount = await notificationsDao.getUnreadCountByUser(res.locals.user.id);
        res.locals.unreadCount = unreadCount;
        unreadCount += 3;
        res.locals.notifications = await notificationsDao.displayLatestNotificationsByUser(res.locals.user.id, unreadCount);
        next();
    } else {
        next();
    }
}

module.exports = {
    addUserToLocals,
    verifyAuthenticated,
    getNotifications
}