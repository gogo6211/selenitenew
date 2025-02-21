// 受け取った確率でtrueが返る
export const returnBoolFromProbability = (probability: number) => {
  // 1から100の乱数
  const rand1to100 = Math.round(Math.random() * 100);

  return rand1to100 <= probability;
};
