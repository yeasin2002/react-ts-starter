const getTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;
  return `${formattedHour}:${minutes}${suffix}`;
};

export default {
  fetch(req: Request) {
    const time = getTime();
    console.log(`[${time}] [${req.method}] ${req.url}`);
  },
};
