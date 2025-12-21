/* GLOBAL APP STATE */

const appState = {
    groupName: "",
    peopleCount: 0,
    people: [],
    expenses: []
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

/* ELEMENT REFERENCES */
const landingScreen = document.getElementById("landing-screen");
const groupNameScreen = document.getElementById("group-name-screen");

const getStartedBtn = document.getElementById("get-started-btn");
const groupNameInput = document.getElementById("group-name-input");
const groupNameContinueBtn = document.getElementById("group-name-continue");

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


getStartedBtn.addEventListener("click", () => {
    showScreen(groupNameScreen);
    groupNameInput.focus();
});

handleEnter(groupNameInput, () => groupNameContinueBtn.click());

groupNameContinueBtn.addEventListener("click", () => {
    const value = groupNameInput.value.trim();

    if (!value) {
        alert("Please enter a group name.");
        return;
    }

    appState.groupName = value;
    logger.log("Current App State:", appState);
    showScreen(peopleCountScreen);
    peopleCountInput.focus();
});

//GROUP NAME → PEOPLE COUNT
handleEnter(peopleCountInput, () => peopleCountContinueBtn.click());

peopleCountContinueBtn.addEventListener("click", () => {
    const count = Number(peopleCountInput.value);
    if (!count || count < 1) {
        alert("Please enter a valid number of people.");
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
            alert("Please enter all names.");
            input.focus();
            return;
        }

        if (names.includes(value)) {
            alert("Duplicate names are not allowed.");
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
    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value);
    const qty = Number(itemQtyInput.value);

    const selectedPeople = Array.from(
        peopleCheckboxes.querySelectorAll("input:checked")
    ).map(cb => Number(cb.value));

    if (!name || !price || !qty || selectedPeople.length === 0) {
        alert("Please fill all fields and select people.");
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
        div.textContent = `${exp.name} — ₹${exp.price} × ${exp.qty} (${peopleNames})`;

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


// Result Functions
function renderResults(result) {
    resultList.innerHTML = "";

    Object.entries(result).forEach(([name, data]) => {
        const container = document.createElement("div");
        container.className = "result-person";

        const header = document.createElement("div");
        header.className = "result-header";

        const title = document.createElement("span");
        title.textContent = name;

        const amount = document.createElement("span");
        amount.className = "result-amount";
        amount.textContent = `₹${(data.total / 100).toFixed(2)}`;

        header.appendChild(title);
        header.appendChild(amount);

        const details = document.createElement("div");
        details.className = "result-details";

        data.items.forEach(item => {
            const row = document.createElement("div");
            row.textContent = `${item.item} — ₹${(item.amount / 100).toFixed(2)}`;
            details.appendChild(row);
        });

        header.addEventListener("click", () => {
            details.style.display =
                details.style.display === "block" ? "none" : "block";
        });

        container.appendChild(header);
        container.appendChild(details);
        resultList.appendChild(container);
    });
}

calculateBtn.addEventListener("click", () => {
    if (appState.expenses.length === 0) {
        alert("Please add at least one expense.");
        return;
    }

    const result = calculateSplit();
    logger.log("Split Result:", result);

    renderResults(result);
    showScreen(resultScreen);
});
