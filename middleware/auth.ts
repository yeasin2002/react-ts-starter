import { defineHandler } from "nitro/h3";

export default defineHandler((event) => {
  // Extends or modify the event
  event.context.user = { name: "Yeasin" };
});
