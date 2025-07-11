function generateQuestion() {
  const operations = ["+", "-", "×", "÷"];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let aNum, aDen, bNum, bDen;
  let resultNum, resultDen;

  // Limit denominators to 2–6
  aDen = Math.floor(Math.random() * 5) + 2;
  bDen = Math.floor(Math.random() * 5) + 2;

  aNum = Math.floor(Math.random() * (aDen - 1)) + 1;
  bNum = Math.floor(Math.random() * (bDen - 1)) + 1;

  switch (op) {
    case "+":
      resultNum = aNum * bDen + bNum * aDen;
      resultDen = aDen * bDen;
      break;
    case "-":
      // Ensure result is not negative
      if (aNum * bDen < bNum * aDen) {
        [aNum, bNum] = [bNum, aNum];
        [aDen, bDen] = [bDen, aDen];
      }
      resultNum = aNum * bDen - bNum * aDen;
      resultDen = aDen * bDen;
      break;
    case "×":
      resultNum = aNum * bNum;
      resultDen = aDen * bDen;
      break;
    case "÷":
      resultNum = aNum * bDen;
      resultDen = aDen * bNum;
      break;
  }

  // Simplify the result
  const g = gcd(resultNum, resultDen);
  resultNum /= g;
  resultDen /= g;

  // Make sure it's a proper fraction
  if (resultNum >= resultDen) return generateQuestion(); // retry

  return {
    text: `Solve: ${aNum}/${aDen} ${op} ${bNum}/${bDen}`,
    answer: `${resultNum}/${resultDen}`
  };
}

function createWrongAnswer(correct) {
  const [num, den] = correct.split("/").map(Number);
  const wrongAnswers = new Set();

  while (wrongAnswers.size < 1) {
    let offset = Math.floor(Math.random() * 2) + 1;
    let newNum = num + (Math.random() < 0.5 ? offset : -offset);
    let newDen = den;

    if (newNum <= 0 || newNum >= newDen) continue;

    const g = gcd(newNum, newDen);
    const simplified = `${newNum / g}/${newDen / g}`;

    if (simplified !== correct) {
      wrongAnswers.add(simplified);
    }
  }

  return [...wrongAnswers][0];
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
