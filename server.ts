export default {
  fetch(req: Request) {
    const time = new Date();
    console.log(`[${time.toISOString()}] [${req.method}] ${req.url}`);
  },
};
