function generateQuestion() {
  const type = Math.floor(Math.random() * 3); // 0: frac→dec, 1: dec→%, 2: %→dec

  if (type === 0) {
    const denom = Math.floor(Math.random() * 8 + 2);
    const numer = Math.floor(Math.random() * denom);
    return {
      text: `Convert: ${numer}/${denom} = ? (decimal)`,
      answer: +(numer / denom).toFixed(2)
    };
  } else if (type === 1) {
    const dec = +(Math.random() * 0.9 + 0.1).toFixed(2);
    return {
      text: `Convert: ${dec} = ? (%)`,
      answer: Math.round(dec * 100)
    };
  } else {
    const percent = Math.floor(Math.random() * 91 + 10); // 10–100%
    return {
      text: `Convert: ${percent}% = ? (decimal)`,
      answer: +(percent / 100).toFixed(2)
    };
  }
}
