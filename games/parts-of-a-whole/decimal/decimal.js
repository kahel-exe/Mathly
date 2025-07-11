const customerImages = [
  '../images/monsties/meepel.png',
  '../images/monsties/hay.png',
  '../images/monsties/tellie.png',
];

let cost = 0;
let payment = 0;

function getRandomDecimal(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function newTransaction() {
  // Random customer image
  const img = document.getElementById("customer-img");
  const randomImg = customerImages[Math.floor(Math.random() * customerImages.length)];
  img.src = randomImg;

  // Random cost and payment
  cost = parseFloat(getRandomDecimal(0.5, 10));
  payment = parseFloat(getRandomDecimal(cost, cost + 10));

  // Update text bubbles
  document.getElementById("customer-bubble").textContent = `"May I buy this?"`;
  document.getElementById("cost-bubble").textContent = `That will be $${cost.toFixed(2)}`;
  document.getElementById("payment-bubble").textContent = `Here's $${payment.toFixed(2)}`;
  document.getElementById("response-bubble").textContent = '';
  document.getElementById("change-input").value = '';
}

function checkAnswer() {
  const userChange = parseFloat(document.getElementById("change-input").value);
  const correctChange = +(payment - cost).toFixed(2);
  const responseBubble = document.getElementById("response-bubble");

  if (isNaN(userChange)) {
    responseBubble.textContent = "Please enter a valid number.";
    return;
  }

  if (Math.abs(userChange - correctChange) < 0.01) {
    responseBubble.textContent = `"Thank you!" 👛`;
    setTimeout(newTransaction, 1500); // Automatically go to next customer
  } else {
    responseBubble.textContent = `"I don’t think that’s quite right?" 🤔`;
  }
}

// Start first customer
window.onload = newTransaction;
