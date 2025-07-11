function generateQuestion() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  const num1 = (Math.random() * 10).toFixed(1); // 0.0 to 9.9
  const num2 = (Math.random() * 10).toFixed(1); // 0.0 to 9.9

  let text, answer;

  switch (op) {
    case "+":
      answer = +(parseFloat(num1) + parseFloat(num2)).toFixed(2);
      text = `Solve: ${num1} + ${num2}`;
      break;
    case "-":
      answer = +(parseFloat(num1) - parseFloat(num2)).toFixed(2);
      text = `Solve: ${num1} - ${num2}`;
      break;
    case "×":
      answer = +(parseFloat(num1) * parseFloat(num2)).toFixed(2);
      text = `Solve: ${num1} × ${num2}`;
      break;
  }

  return { text, answer };
}
