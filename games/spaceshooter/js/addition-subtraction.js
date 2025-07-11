window.generateQuestion = function () {
  const a = Math.floor(Math.random() * 10 + 1);
  const b = Math.floor(Math.random() * 10 + 1);
  const op = Math.random() < 0.5 ? '+' : '-';
  const answer = op === '+' ? a + b : a - b;

  return {
    text: `${a} ${op} ${b} = ?`,
    answer: answer
  };
};
