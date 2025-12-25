/* GLOBAL APP STATE */

const appState = {
    groupName: "",
    peopleCount: 0,
    people: [],
    expenses: [],
    isReadOnly: false
};

const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";

const logger = {
    log: (...args) => {
        if (isDev) console.log(...args);
    },
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    error: (...args) => {
        if (isDev) console.error(...args);
    }
};

function handleEnter(input, callback) {
    if (!input) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            callback();
        }
    });
}


/* SCREEN TRANSITION HELPER */
function showScreen(screenToShow) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
    screenToShow.classList.add("active");
}

const toastEl = document.getElementById("toast");

function showToast(message, duration = 2000) {
    toastEl.textContent = message;
    toastEl.classList.add("show");

    setTimeout(() => {
        toastEl.classList.remove("show");
    }, duration);
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function triggerHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(15);
    }
}


/* ELEMENT REFERENCES */
const landingScreen = document.getElementById("landing-screen");
const groupNameScreen = document.getElementById("group-name-screen");

const getStartedBtn = document.getElementById("get-started-btn");
const groupNameInput = document.getElementById("group-name-input");
const groupNameContinueBtn = document.getElementById("group-name-continue");

const upiIdScreen = document.getElementById("upi-selection-screen");
const upiIdInput = document.getElementById("upi-id-input");
const upiIdButton = document.getElementById("upi-id-continue");

const peopleCountScreen = document.getElementById("people-count-screen");
const peopleCountInput = document.getElementById("people-count-input");
const peopleCountContinueBtn = document.getElementById("people-count-continue");


const peopleNamesScreen = document.getElementById("people-names-screen");
const peopleNamesContainer = document.getElementById("people-names-container");
const peopleNamesContinueBtn = document.getElementById("people-names-continue");


const expenseScreen = document.getElementById("expense-screen");

const itemNameInput = document.getElementById("item-name");
const itemPriceInput = document.getElementById("item-price");
const itemQtyInput = document.getElementById("item-qty");
const peopleCheckboxes = document.getElementById("people-checkboxes");
const addExpenseBtn = document.getElementById("add-expense-btn");
const expenseList = document.getElementById("expense-list");


const calculateBtn = document.getElementById("calculate-btn");
const resultScreen = document.getElementById("result-screen");
const resultList = document.getElementById("result-list");


const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");

getStartedBtn.addEventListener("click", () => {
    showScreen(groupNameScreen);
    groupNameInput.focus();
});

handleEnter(groupNameInput, () => groupNameContinueBtn.click());

groupNameContinueBtn.addEventListener("click", () => {
    const value = groupNameInput.value.trim();

    if (!value) {
        showToast("Please enter a group name.");
        return;
    }

    appState.groupName = value;
    logger.log("Current App State:", appState);
    showScreen(upiIdScreen);
    upiIdInput.focus();
});

//GROUP NAME -> UPI ID SELECTION
handleEnter(upiIdInput, () => upiIdButton.click())

upiIdButton.addEventListener("click", () => {
    const value = upiIdInput.value.trim();

    if (!value) {
        showToast("Please enter a group name.");
        return;
    }
    appState.upiID = value;
    logger.log("Current App State:", appState);
    showScreen(peopleCountScreen);
    peopleCountInput.focus();
})

//UPI ID SELECTION -> PEOPLE COUNT
handleEnter(peopleCountInput, () => peopleCountContinueBtn.click());

peopleCountContinueBtn.addEventListener("click", () => {
    const count = Number(peopleCountInput.value);
    if (!count || count < 1) {
        showToast("Please enter a valid number of people.");
        return;
    }

    appState.peopleCount = count;
    generatePeopleInputs(count);

    logger.log("Current App State:", appState);
    showScreen(peopleNamesScreen);
});


//Function for People Names
function generatePeopleInputs(count) {
    peopleNamesContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Person ${i + 1}`;
        peopleNamesContainer.appendChild(input);
    }

    const inputs = peopleNamesContainer.querySelectorAll("input");
    if (inputs[0]) inputs[0].focus();

    inputs.forEach((input, index) => {
        handleEnter(input, () => {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                peopleNamesContinueBtn.click();
            }
        });
    });
}

peopleNamesContinueBtn.addEventListener("click", () => {
    const inputs = peopleNamesContainer.querySelectorAll("input");
    const names = [];

    for (const input of inputs) {
        const value = input.value.trim();

        if (!value) {
            showToast("Please enter all names.");
            input.focus();
            return;
        }

        if (names.includes(value)) {
            showToast("Duplicate names are not allowed.");
            input.focus();
            return;
        }

        names.push(value);
    }

    appState.people = names;
    renderPeopleCheckboxes();

    logger.log("Current App State:", appState);
    showScreen(expenseScreen);
});


// Function for Expense Entry
function renderPeopleCheckboxes() {
    peopleCheckboxes.innerHTML = "";

    appState.people.forEach((name, index) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = index;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(name));
        peopleCheckboxes.appendChild(label);
    });
}

function resetExpenseForm() {
    itemNameInput.value = "";
    itemPriceInput.value = "";
    itemQtyInput.value = "";
    peopleCheckboxes.querySelectorAll("input").forEach(cb => (cb.checked = false));
}

handleEnter(itemQtyInput, () => addExpenseBtn.click());

addExpenseBtn.addEventListener("click", () => {
    if (appState.isReadOnly) return;

    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value);
    const qty = Number(itemQtyInput.value);

    const selectedPeople = Array.from(
        peopleCheckboxes.querySelectorAll("input:checked")
    ).map(cb => Number(cb.value));

    if (!name || !price || !qty || selectedPeople.length === 0) {
        showToast("Please fill all fields and select people.");
        return;
    }

    appState.expenses.push({
        name,
        price,
        qty,
        people: selectedPeople
    });

    logger.log("Expenses:", appState.expenses);
    renderExpenseList();
    resetExpenseForm();
});

// Expense List Functions
function renderExpenseList() {
    expenseList.innerHTML = "";

    appState.expenses.forEach(exp => {
        const div = document.createElement("div");
        div.className = "expense-item";

        const peopleNames = exp.people.map(i => appState.people[i]).join(", ");
        div.textContent = `${exp.name} - ₹${exp.price} × ${exp.qty} (${peopleNames})`;

        expenseList.appendChild(div);
    });
}

// Calculation Logic 
function calculateSplit() {
    const result = {};

    appState.people.forEach(name => {
        result[name] = { total: 0, items: [] };
    });

    result["Total"] = { total: 0, items: [] };

    appState.expenses.forEach(exp => {
        const totalCost = Math.round(exp.price * 100) * exp.qty;
        const perPerson = totalCost / exp.people.length;
        result["Total"].total += totalCost;
        result["Total"].items.push({
            item: exp.name,
            amount: totalCost
        })
        exp.people.forEach(personIndex => {
            const personName = appState.people[personIndex];
            result[personName].total += perPerson;
            result[personName].items.push({
                item: exp.name,
                amount: perPerson
            });
        });
    });

    return result;
}

const UPI_APPS = {
    DEFAULT: "upi://pay?",
    GPAY: "tez://upi/pay?",
    PHONEPE: "phonepe://pay?",
    PAYTM: "paytmmp://pay?"
};


// Result Functions
function renderResults(result) {
    resultList.innerHTML = "";

    Object.entries(result).forEach(([name, data]) => {
        const container = document.createElement("div");
        container.className = "result-person";
        container.style.position = "relative";

        const header = document.createElement("div");
        header.className = "result-header";

        const title = document.createElement("span");
        title.textContent = name;

        const amountValue = (data.total / 100).toFixed(2);
        const amount = document.createElement("span");
        amount.className = "result-amount";
        amount.textContent = `₹${amountValue}`;

        const actions = document.createElement("div");
        actions.className = "result-actions";

        actions.appendChild(amount);

        if (name !== "Total") {
            const payToggle = document.createElement("button");
            payToggle.className = "pay-toggle";
            payToggle.textContent = "Pay";

            const popover = document.createElement("div");
            popover.className = "pay-popover hidden";

            const apps = [
                { key: "GPAY", label: "GPay" },
                { key: "PHONEPE", label: "PhonePe" },
                { key: "PAYTM", label: "Paytm" },
                { key: "DEFAULT", label: "Other UPI" }
            ];

            apps.forEach(app => {
                const btn = document.createElement("button");
                btn.className = "pay-option-btn";
                btn.textContent = app.label;

                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    triggerHaptic();
                    openPaymentApp(app.key, amountValue);
                    popover.classList.add("hidden");
                });

                popover.appendChild(btn);
            });

            if (isAndroid()) {
                payToggle.addEventListener("click", () => {
                    triggerHaptic();
                    openPaymentApp("DEFAULT", amountValue);
                });
            } else {
                payToggle.addEventListener("click", (e) => {
                    e.stopPropagation();
                    popover.classList.toggle("hidden");
                });
            }

            if (Number(amountValue) === 0) {
                payToggle.classList.add("disabled");
            }

            actions.appendChild(payToggle);
            actions.appendChild(popover);

            // Close on outside click
            document.addEventListener("click", () => {
                popover.classList.add("hidden");
            });

            actions.addEventListener("click", e => e.stopPropagation());
        }

        header.appendChild(title);
        header.appendChild(actions);
        container.appendChild(header);

        const details = document.createElement("div");
        details.className = "result-details";

        data.items.forEach(item => {
            const row = document.createElement("div");
            row.textContent = `${item.item} - ₹${(item.amount / 100).toFixed(2)}`;
            details.appendChild(row);
        });

        header.addEventListener("click", () => {
            details.style.display =
                details.style.display === "block" ? "none" : "block";
        });

        container.appendChild(details);
        resultList.appendChild(container);
    });
}

calculateBtn.addEventListener("click", () => {
    if (appState.isReadOnly) return;

    if (appState.expenses.length === 0) {
        showToast("Please add at least one expense.");
        return;
    }

    const result = calculateSplit();
    logger.log("Split Result:", result);

    renderResults(result);
    showScreen(resultScreen);
});

function formatShareText(result) {
    let text = `${appState.groupName} - Expense Split\n\n`;
    let total = "Total: ₹"
    let totalAmount = 0
    let itemText = ""
    Object.entries(result).forEach(([name, data]) => {
        text += `${name}: ₹${(data.total / 100).toFixed(2)}\n`;
        totalAmount += data.total;
        data.items.forEach(item => {
            text += `  • ${item.item}: ₹${(item.amount / 100).toFixed(2)}\n`;
            itemText += `  • ${item.item}: ₹${(data.total / 100).toFixed(2)}\n`;
        });

        text += "\n";
    });

    return text.trim();
}

copyBtn.addEventListener("click", async () => {
    try {
        const result = calculateSplit();
        const text = formatShareText(result);

        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard.");
    } catch (err) {
        logger.error("Copy failed:", err);
        showToast("Unable to copy. Please try again.");
    }
});

shareBtn.addEventListener("click", async () => {
    try {
        const encoded = encodeStateForURL();
        const shareURL = `${location.origin}${location.pathname}?data=${encoded}`;

        await navigator.clipboard.writeText(shareURL);
        showToast("Shareable link copied");
    } catch (err) {
        logger.error("Link generation failed", err);
        showToast("Unable to generate link");
    }
});

function openPaymentApp(app, amount) {
    const baseURL = UPI_APPS[app] || UPI_APPS.DEFAULT;
    const finalURL = baseURL + `pa=${appState.upiID}&pn=%20&tr=%20&am=${amount}&cu=INR`;

    logger.log("Opening UPI URL:", finalURL);

    window.location.href = finalURL;
}


function encodeStateForURL() {
    const shareState = {
        groupName: appState.groupName,
        people: appState.people,
        expenses: appState.expenses
    };

    const json = JSON.stringify(shareState);
    return btoa(encodeURIComponent(json));
}

function decodeStateFromURL(encoded) {
    try {
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    } catch (e) {
        logger.error("Invalid share data", e);
        return null;
    }
}

(function restoreFromShareLink() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");

    if (!encoded) return;

    const restored = decodeStateFromURL(encoded);
    if (!restored) return;

    appState.groupName = restored.groupName;
    appState.people = restored.people;
    appState.expenses = restored.expenses;
    appState.peopleCount = restored.people.length;
    appState.isReadOnly = true;

    const result = calculateSplit();
    renderResults(result);
    showScreen(resultScreen);

    applyReadOnlyMode();
    showToast("Viewing shared expense (read-only)");
})();

function applyReadOnlyMode() {
    if (!appState.isReadOnly) return;

    // Hiding all editable screens
    landingScreen.style.display = "none";
    groupNameScreen.style.display = "none";
    peopleCountScreen.style.display = "none";
    peopleNamesScreen.style.display = "none";
    expenseScreen.style.display = "none";

    // Hiding calculate button (result already calculated)
    calculateBtn.style.display = "none";
}
