import { defineHandler } from "nitro/h3";

export default defineHandler((event) => {
  const { name } = event.context.user as { name: string };
  console.log("🚀 ~ params :", name);
  return {
    success: true,
    message: `Hello ${name}`,
  };
});
