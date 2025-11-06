export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");

  // Mock user data
  const users = {
    "1": { id: 1, name: "John Doe", email: "john@example.com" },
    "2": { id: 2, name: "Jane Smith", email: "jane@example.com" },
  };

  const user = users[id as keyof typeof users];

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return { user };
});
