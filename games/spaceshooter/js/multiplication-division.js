function generateQuestion() {
  const a = Math.floor(Math.random() * 12 + 1);
  const b = Math.floor(Math.random() * 12 + 1);
  const isMultiply = Math.random() < 0.5;

  if (isMultiply) {
    return {
      text: `${a} × ${b} = ?`,
      answer: a * b
    };
  } else {
    const product = a * b;
    return {
      text: `${product} ÷ ${a} = ?`,
      answer: b
    };
  }
}
