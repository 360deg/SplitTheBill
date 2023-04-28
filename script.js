let personCount = 0;

// Creates a new person element with input fields and a remove button
function createPersonElement() {
    personCount++;

    // Create a person container div
    const personElement = document.createElement("div");
    personElement.classList.add("person");

    // Create input elements for name, amount spent, and paying for
    const nameInput = document.createElement("input");
    const amountInput = document.createElement("input");
    const payingForInput = document.createElement("input");

    // Set input element attributes
    nameInput.type = "text";
    nameInput.value = `Person ${personCount}`;
    nameInput.id = `name${personCount}`;
    amountInput.type = "number";
    amountInput.placeholder = "Enter amount spent";
    amountInput.value = 0;
    amountInput.id = `amount${personCount}`;
    payingForInput.type = "number";
    payingForInput.placeholder = "Paying for";
    payingForInput.value = 1;
    payingForInput.id = `payingFor${personCount}`;

    // Add event listener to the amount input field for updating the calculate button
    amountInput.addEventListener("input", updateCalculateButton);

    // Create a remove button for the person container
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-btn");
    removeBtn.innerHTML = '<img src="cross.svg" alt="Remove person">';
    removeBtn.addEventListener("click", function () {
        // Clear previous results when a person is removed
        const result = document.getElementById("result");
        result.innerHTML = "";
        const transactions = document.getElementById("transactions");
        transactions.innerHTML = "";
        const total = document.getElementById("total");
        total.innerHTML = "";

        // Remove the person container
        personElement.remove();

        // Hide field descriptions if there are no people
        if (peopleContainer.childElementCount === 0) {
            hideFieldDescriptions();
        }

        // Update the calculate button
        updateCalculateButton();
        updateCalculateButtonDisplay();
    });

    // Append input fields and the remove button to the person container
    personElement.appendChild(nameInput);
    personElement.appendChild(amountInput);
    personElement.appendChild(payingForInput);
    personElement.appendChild(removeBtn);

    return personElement;
}

// Add a new person when the "Add Person" button is clicked
document.getElementById("addPerson").addEventListener("click", function() {
    const personElement = createPersonElement();
    document.getElementById("peopleContainer").appendChild(personElement);

    // Show field descriptions and update the calculate button
    showFieldDescriptions();
    updateCalculateButtonDisplay();

    // Add an animation for the new person container
    setTimeout(() => {
        personElement.classList.add("show");
    }, 50);

    // Add a scaling animation to the container
    const container = document.getElementById("container");
    container.classList.add("scale");
    setTimeout(() => {
        container.classList.remove("scale");
    }, 150);
});

// Calculate the results when the "Calculate" button is clicked
document.getElementById("calculate").addEventListener("click", function () {
    const result = document.getElementById("result");
    const total = document.getElementById("total");
    const transactions = document.getElementById("transactions");

    // Clear previous transactions
    transactions.innerHTML = "";

    let totalAmount = 0;
    let totalPeople = 0;
    let validInputs = true;
    let people = [];

    // Collect input data and validate it
    for (let i = 1; i <= personCount; i++) {
        if (document.getElementById(`name${i}`) == null) {
            continue;
        }
        const name = document.getElementById(`name${i}`).value;
        const amount = parseFloat(document.getElementById(`amount${i}`).value);
        const payingFor = parseInt(document.getElementById(`payingFor${i}`).value);

        // Check if the inputs are valid
        if (isNaN(amount) || amount < 0 || isNaN(payingFor) || payingFor < 1) {
            validInputs = false;
            break;
        }

        // Update totals and store person data
        totalAmount += amount;
        totalPeople += payingFor;
        people.push({ name, amount, payingFor });
    }

// Calculate and display the results if inputs are valid
    if (!validInputs) {
        result.textContent = "Please enter valid values for all fields.";
    } else {
        const amountPerPerson = totalAmount / totalPeople;
        result.innerHTML = `<strong>Amount per person:</strong> $${amountPerPerson.toFixed(2)}`;
        total.innerHTML = `<strong>Total:</strong> $${totalAmount}`;

        // Calculate balances for each person
        people.forEach((person) => {
            person.balance = person.amount - person.payingFor * amountPerPerson;
        });

        // Sort people by balance
        people.sort((a, b) => a.balance - b.balance);

        // Generate transactions
        let left = 0;
        let right = people.length - 1;
        transactions.innerHTML = '<strong>Transaction list:</strong>';

        while (left < right) {
            const diff = Math.min(-people[left].balance, people[right].balance);

            // Only create a transaction element if the diff is greater than 0
            if (diff > 0) {
                people[left].balance += diff;
                people[right].balance -= diff;

                const transaction = document.createElement("p");
                transaction.textContent = `${people[left].name} pays $${diff.toFixed(2)} to ${people[right].name}`;
                transactions.appendChild(transaction);
            }

            // Update left and right pointers
            if (people[left].balance === 0) {
                left++;
            }
            if (people[right].balance === 0) {
                right--;
            }
        }
    }
});

// Show or hide field descriptions
function showFieldDescriptions() {
    const fieldDescriptions = document.getElementById("fieldDescriptions");
    fieldDescriptions.style.display = "flex";
}

function hideFieldDescriptions() {
    const fieldDescriptions = document.getElementById("fieldDescriptions");
    fieldDescriptions.style.display = "none";
}

// Update the calculate button based on input values
function updateCalculateButton() {
    const calculateButton = document.getElementById("calculate");
    const peopleContainer = document.getElementById("peopleContainer");
    const hasPeople = peopleContainer.childElementCount > 0;
    let totalAmount = 0;
    for (let i = 1; i <= personCount; i++) {
        if (document.getElementById(`amount${i}`) == null) {
            continue;
        }
        const amount = parseFloat(document.getElementById(`amount${i}`).value);
        if (!isNaN(amount) && amount > 0) {
            totalAmount += amount;
        }
    }

    calculateButton.disabled = !hasPeople || totalAmount === 0;
    updateCalculateButtonDisplay();
}

// Show or hide the calculate button based on the number of people
function updateCalculateButtonDisplay() {
    const calculateButton = document.getElementById("calculate");
    const peopleContainer = document.getElementById("peopleContainer");
    const hasPeople = peopleContainer.childElementCount > 0;
    calculateButton.style.display = hasPeople ? "block" : "none";
}

// Update the visibility of the copy button based on transaction content
const transactionsContainer = document.getElementById("transactions");
const copyButton = document.getElementById("copyButton");
function updateCopyButtonVisibility() {
    if (transactionsContainer.textContent.trim() !== "") {
        copyButton.style.display = "block";
    } else {
        copyButton.style.display = "none";
    }
}

// Observe changes in the transactions container and update the copy button visibility
const observer = new MutationObserver(updateCopyButtonVisibility);
observer.observe(transactionsContainer, { childList: true });

// Copy the transaction list when the "Copy" button is clicked
copyButton.addEventListener("click", () => {
    const tempTextArea = document.createElement("textarea");
    // Extract the text from each child element and join them with newline characters
    const transactionsText = Array.from(transactionsContainer.children)
        .map(child => child.textContent.trim())
        .join('\n');

    // Remove the "Transaction list:" part from the transactionsText
    const cleanedTransactionsText = transactionsText.replace(/^Transaction list:/, '');

    // Create a formatted text version of the transaction list
    tempTextArea.value = "Transaction list:\n" + cleanedTransactionsText;

    // Copy the formatted text to the clipboard
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
});

// Initialize the copy button visibility
updateCopyButtonVisibility();

// Show the container when the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    setTimeout(() => {
        container.classList.add("show");
    }, 50);
});

// Show and hide the tooltip on help icon hover
document.getElementById("helpIcon").addEventListener("mouseenter", function () {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.display = "block";
});

document.getElementById("helpIcon").addEventListener("mouseleave", function () {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
});
