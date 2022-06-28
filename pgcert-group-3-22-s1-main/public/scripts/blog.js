function showElement(divId, show) {
    document.querySelector(`#${divId}`).style.display = (show) ? "inline" : "none";
};

async function sortArticle(userID) {
    const sortInput = document.querySelector("#sort-articles").value;
    let response = await fetch(`./sortArticles?sortBy=${sortInput}`);
    let sortedArticles = await response.json();

    const articleDiv = document.querySelector("#leftColumn");

    if (sortedArticles) {

        articleDiv.innerHTML = "";

        for (let i = 0; i < sortedArticles.length; i++) {

            const liked = await fetch(`./checkLiked?userID=${userID}&articleID=${sortedArticles[i].article_id}`)
            const likedResponse = await liked.json();

            if (likedResponse) {
                articleDiv.innerHTML += `<div class="card">
                                        <h2 class="articleTitle"><a href="./visitArticle?id=${sortedArticles[i].article_id}">${sortedArticles[i].title}</a></h2>
                                        <h5 class="articleDate">${sortedArticles[i].article_create_date}</h5>
                                        <div class="fakeimg">
                                            <img src="./images/${sortedArticles[i].image}">
                                            <p>${sortedArticles[i].article}</p>
                                            <h5>Author: ${sortedArticles[i].author}</h5>
                                        </div>
                                        <div class="likeSection">
                                        <p id=likesFor${sortedArticles[i].article_id}>${sortedArticles[i].number_of_likes}</p>
                                        <i class="alreadyLike fa-solid fa-thumbs-down" data-liked="true${sortedArticles[i].article_id}" onclick="updateLike(${sortedArticles[i].article_id}, ${userID})"></i>
                                        </div>
                                        </div>
                                        `;
            } else {
                articleDiv.innerHTML += `<div class="card">
                                        <h2 class="articleTitle"><a href="./visitArticle?id=${sortedArticles[i].article_id}">${sortedArticles[i].title}</a></h2>
                                        <h5 class="articleDate">${sortedArticles[i].article_create_date}</h5>
                                        <div class="fakeimg">
                                            <img src="./images/${sortedArticles[i].image}">
                                            <p>${sortedArticles[i].article}</p>
                                            <h5>Author: ${sortedArticles[i].author}</h5>
                                        </div>
                                        <div class="likeSection">
                                        <p id=likesFor${sortedArticles[i].article_id}>${sortedArticles[i].number_of_likes}</p>
                                        <i class="likeButton fa-solid fa-thumbs-up" data-liked="false${sortedArticles[i].article_id}" onclick="updateLike(${sortedArticles[i].article_id}, ${userID})"></i>
                                        </div>
                                        </div>
                                        `;
            };
        };
    };
};

function deleteHTML(article_id) {
    const articleDivToDelete = document.querySelector(`#article${article_id}`);
    articleDivToDelete.remove();

};

async function removeImage(articleID) {
    const editArticleImage = document.querySelector("#editArticleImage");

    await fetch(`./removeImage?remove=${articleID}`);
    
    editArticleImage.remove();

};

async function deleteArticle(articleId) {
    let confirm = window.confirm("Do you really want to delete your article?");

    if (confirm) {

        let response = await fetch(`./articleToDelete?delete=${articleId}`);
        deleteHTML(articleId);
        await response.json();

    }else {
        window.close();
    };
};


async function deleteAccountNotification(id) {
    const accountDiv = document.querySelector("#manageAccount")

    let confirm = window.confirm("Do you really want to delete your account?");

    if (confirm) {

        let response = await fetch(`./deleteAccount?id=${id}`);
        let result = response.json();
        if (result) {
            document.querySelector("#navbarAvatar").remove();
            accountDiv.innerHTML = `<h1>Your account has been deleted</h1>`;
        };

    } else {
        window.close();
    };
};

async function updateLike(articleID, userID) {
    const changeLikeNumber = document.querySelector(`#likesFor${articleID}`);
    let numberOfLikes = changeLikeNumber.innerHTML;

    const likedButton = document.querySelector(`[data-liked="false${articleID}"]`);
    const dislikeButton = document.querySelector(`[data-liked="true${articleID}"]`);

    if (Number.isInteger(userID)) {
        let responseLike = await fetch(`./articleLikes?articleID=${articleID}&numberOfLikes=${numberOfLikes}&userID=${userID}`);
        let boolean = await responseLike.json();

        if (boolean) {
            changeLikeNumber.innerHTML = (parseInt(numberOfLikes) + 1);
        } else {
            changeLikeNumber.innerHTML = (parseInt(numberOfLikes) - 1);
        };

        if (likedButton) {
            likedButton.classList.remove("likeButton", "fa-thumbs-up");
            likedButton.classList.add("alreadyLike", "fa-thumbs-down");
            likedButton.setAttribute("data-liked", `true${articleID}`);
        } else {
            dislikeButton.classList.remove("alreadyLike", "fa-thumbs-down");
            dislikeButton.classList.add("likeButton", "fa-thumbs-up");
            dislikeButton.setAttribute("data-liked", `false${articleID}`);
        };
    };
};

function toggleLogin() {
    const createAccountPopup = document.querySelector("#createAccountPopup");
    if (createAccountPopup.classList.contains("show")) {
        toggleCreateAccount();
    };

    const loginPopup = document.querySelector("#loginPopup");
    const allButPopup = document.querySelectorAll("body > div:not(.loginPopupContainer, .navbar), header");

    if (!(loginPopup.classList.contains("show"))) {
        allButPopup.forEach(element => {
            element.classList.add("blur");
        });
    } else {
        allButPopup.forEach(element => {
            element.classList.remove("blur");
        });
    };

    loginPopup.classList.toggle("show");
};

function toggleCreateAccount() {
    const loginPopup = document.querySelector("#loginPopup");

    if (loginPopup.classList.contains("show")) {
        toggleLogin();
    };

    const createAccountPopup = document.querySelector("#createAccountPopup");
    const allButPopup = document.querySelectorAll("body > div:not(.createAccountPopupContainer, .navbar), header");

    if (!(createAccountPopup.classList.contains("show"))) {
        allButPopup.forEach(element => {
            element.classList.add("blur");
        });
    } else {
        allButPopup.forEach(element => {
            element.classList.remove("blur");
        });
    };

    createAccountPopup.classList.toggle("show");
};

function toggleReplyBox(commentID) {
    const replyBox = document.querySelector(`#replyTo${commentID}`);

    const replyBoxes = document.querySelectorAll(".replyBox");

    replyBoxes.forEach(div => {
        if (div.classList.contains("show")) {
            div.classList.toggle("show");
        };
    });

    if (replyBox) {
        replyBox.classList.toggle("show");

    };
};

function cancelReply(commentID) {
    const form = document.querySelector(`#replyFormForComment${commentID}`);
    form.reset();
    toggleReplyBox(`replyTo${commentID}`);

};

function hideAllComments() {
    const hideCommentsButton = document.querySelector("#hideAllComments");
    const commentsSection = document.querySelector(".comments");

    if (hideCommentsButton.classList.contains("commentsShown")) {
        hideCommentsButton.classList.remove("commentsShown");
        hideCommentsButton.classList.add("commentsHidden");
        hideCommentsButton.innerHTML = "Show all comments";

        commentsSection.classList.toggle("hide");
    } else {
        hideCommentsButton.classList.remove("commentsHidden");
        hideCommentsButton.classList.add("commentsShown");
        hideCommentsButton.innerHTML = "Hide all comments";

        commentsSection.classList.toggle("hide");
    };
};

async function deleteComment(commentID) {
    const deleteConfirmation = window.confirm("Are you sure you wish to delete this comment?");
    const comment = document.querySelector(`#comment${commentID}`);
    const commentDeleteButton = document.querySelector(`#deleteComment${commentID}`);
    const commentReplyButton = document.querySelector(`#replyButton${commentID}`);

    if (deleteConfirmation) {
        comment.innerHTML = "Comment has been deleted";
        commentDeleteButton.remove();
        if (commentReplyButton) {
            commentReplyButton.remove();
        };

        await fetch(`./commentToDelete?commentID=${commentID}`);

    };
};

async function subscribe(userId, authorId) {
    const subscribeButton = document.querySelector(".subscribeButton");
    subscribeButton.innerHTML = "Unsubscribe";
    subscribeButton.setAttribute("onclick", `unsubscribe(${userId}, ${authorId});`);
    subscribeButton.classList.replace("subscribeButton", "unsubscribeButton");

    await fetch(`./subscribe?id=${userId}&authorId=${authorId}`);

};

async function unsubscribe(userId, authorId) {
    const subscribeButton = document.querySelector(".unsubscribeButton");
    subscribeButton.innerHTML = "Subscribe";
    subscribeButton.setAttribute("onclick", `subscribe(${userId}, ${authorId});`);
    subscribeButton.classList.replace("unsubscribeButton", "subscribeButton");

    await fetch(`./unsubscribe?id=${userId}&authorId=${authorId}`);

};

async function manageSubscriberRemove(userId, authorId){
    const removeSubscriber = document.querySelector(`#remove${userId}`);
    removeSubscriber.remove();

    await fetch(`./unsubscribe?id=${userId}&authorId=${authorId}`);

};

async function manageSubscribersUnsubscribe(userId, authorId){
    const unsubscribe = document.querySelector(`#unsubscribe${authorId}`);
    unsubscribe.remove();

    await fetch(`./unsubscribe?id=${userId}&authorId=${authorId}`);

};

async function setNotificationRead(notificationID) {
    await fetch(`./setNotificationRead?notificationID=${notificationID}`);

};
