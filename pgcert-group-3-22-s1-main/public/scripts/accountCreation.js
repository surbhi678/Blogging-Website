const username = document.querySelector("#txtUsername");
const password = document.querySelector("#txtPassword");
const passwordConfirm = document.querySelector("#txtPasswordConfirm");
const firstName = document.querySelector("#txtFirstName");
const lastName = document.querySelector("#txtLastName");
const avatarChoice = document.querySelector("#avatarChoice");
const dobDay = document.querySelector("#dob-day");
const dobMonth = document.querySelector("#dob-month");
const dobYear = document.querySelector("#dob-year");
const submitButton = document.querySelector("#submitNewAccount");
const message = document.querySelector("#message");
const description = document.querySelector("#description");
submitButton.disabled = true;

let formValid = false;
const inputs = document.querySelectorAll(".accountCreationInput");

inputs.forEach(input => {
    input.addEventListener("change", async function () {
        formValid = await checkFormValid();
        if (formValid) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        };
    });
});


function passwordCheck() {

    if (passwordConfirm.value == "") {
        message.style.color = 'red';
        message.innerHTML = 'Not valid';
        return;
    };

    if (password.value == passwordConfirm.value) {
        message.style.color = 'green';
        message.innerHTML = 'Valid';
    } else {
        message.style.color = 'red';
        message.innerHTML = 'Not matching';
    };
};

async function checkFormValid() {
    const usernameCheck = await checkUsername();

    if ((username.value == "") || !usernameCheck) {
        return false;
    };
    if (message.style.color == 'red' || passwordConfirm.value == "") {
        return false;
    };
    if (firstName.value == "") {
        return false;
    };
    if (lastName.value == "") {
        return false;
    };
    if (dobDay.value == "") {
        return false;
    };
    if (dobMonth.value == "") {
        return false;
    };
    if (dobYear.value == "") {
        return false;
    };
    if (avatarChoice.value == "choose your avatar") {
        return false;
    };
    return true;
};

/**
 * Show or hide the element with the matching id.
 * @param {string} divId The id of the element to show/hide.
 * @param {boolean} show True to show, false to hide.
 */
function showElement(divId, show) {
    document.querySelector(`#${divId}`).style.display = (show) ? "inline" : "none";
};

/**
 * Set the value of the element with the matching id.
 * @param {string} divId The id of the element to change.
 * @param {string} value Value to set.
 */
function setValue(divId, value, change) {
    const divToChange = document.querySelector(`#${divId}`);
    divToChange.value = value;
    divToChange.dispatchEvent(new Event('change'));

    if (change) {
        document.querySelector(`#displayAvatarChoiceChange`).src = `./images/${value}.png`;
    } else {
        document.querySelector(`#displayAvatarChoice`).src = `./images/${value}.png`;
    };

};

// Check if the username already exists in the database. If the username already exists,
// display a red message indicating that the name is already taken, and disable the submit account button.
async function checkUsername() {
    const currentInput = document.querySelector("#txtUsername").value;
    let response = await fetch(`./checkUsername?currentInput=${currentInput}`);
    let usernameExists = await response.json();

    const usernameExistsMessage = document.querySelector("#usernameExists");

    if (usernameExists) {
        usernameExistsMessage.innerHTML = "Username already exists";
        usernameExistsMessage.style.color = "red";
        return false;
        
    } else {
        usernameExistsMessage.innerHTML = "Username is valid";
        usernameExistsMessage.style.color = "green";
        return true;

    };
};