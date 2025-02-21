export const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

export const randomSleep = () => {
  const msec = Math.floor(Math.random() * 1000 + 1000);

  return new Promise((resolve) => setTimeout(resolve, msec));
};
