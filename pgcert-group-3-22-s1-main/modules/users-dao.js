const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const bcrypt = require('bcrypt');

async function createUser(user) {
    const db = await dbPromise;

    const dateOfBirth = `${user.dobYear}-${user.dobMonth}-${user.dobDay}`;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const result = await db.run(SQL`

    insert into user_accounts (username, password, firstName, lastName, date_of_birth, description, avatar) values(${user.username}, ${hashedPassword}, ${user.firstName}, ${user.lastName}, ${dateOfBirth}, ${user.description}, ${user.avatar})
    `);

    user.id = result.lastID;
};

async function retrieveUserById(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from user_accounts
        where id = ${id}`);

    return user;
};

async function retrieveUserWithCredentials(username, password) {

    const db = await dbPromise;

    const loadPassword = await db.get(SQL`
        select password
            from user_accounts
            where username = ${username}
        `);

    if (loadPassword) {

        const validPassword = await bcrypt.compare(password, loadPassword.password);

        if (validPassword) {
            const user = await db.get(SQL`
                select * from user_accounts
                where username = ${username}
                `);

            return user;
        };
    };
};

async function retrieveUserWithAuthToken(authToken) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from user_accounts
        where authToken = ${authToken}
        `);

    return user;
};

async function retrieveUserByUsername(username) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from user_accounts
        where username = ${username}
        `);

    return user;
};

async function retrieveAllUsers() {
    const db = await dbPromise;

    const users = await db.all(SQL`
         select * from user_accounts
         `);

    return users;
};

async function updateUser(user) {
    const db = await dbPromise;

    await db.run(SQL`
        update user_accounts
        set username = ${user.username}, password = ${user.password},
            firstName = ${user.firstName}, authToken = ${user.authToken}
        where id = ${user.id}
        `);
};

async function updateUserDetails(user, userID) {
    const db = await dbPromise;

    const dateOfBirth = `${user.dobYear}-${user.dobMonth}-${user.dobDay}`;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    await db.run(SQL`
        update user_accounts
        set username = ${user.username}, password = ${hashedPassword},
            firstName = ${user.firstName}, lastName = ${user.lastName},
            date_of_birth = ${dateOfBirth},
            description = ${user.description},avatar = ${user.avatar}
            where id = ${userID}
            `);
};

async function deleteUser(id) {
    const db = await dbPromise;

    const comment = "Comment has been deleted"

    await db.run(SQL`
        update comments
        set comment = ${comment}, username_id = 2
        where username_id = ${id}
    `);

    await db.run(SQL`
        delete from user_accounts
        where id = ${id}
    `);

    return true;
};

async function checkUsernameExists(username) {
    const db = await dbPromise;

    const usernameExists = await db.get(SQL`
        select * from user_accounts
        where username = ${username}
    `);

    if (usernameExists) {
        return true;
    } else {
        return false;
    };
};

async function removeAuthToken(userID) {
    const db = await dbPromise;

    await db.run(SQL`
        update user_accounts
            set authtoken = null
            where id = ${userID}
    `)
}

module.exports = {
    createUser,
    retrieveUserById,
    retrieveUserWithCredentials,
    retrieveUserWithAuthToken,
    retrieveUserByUsername,
    retrieveAllUsers,
    updateUser,
    deleteUser,
    checkUsernameExists,
    updateUserDetails,
    removeAuthToken
};
