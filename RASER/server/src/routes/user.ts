// Retrieve users
app.get("/api/users", async (_req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Create a new user
  app.post("/api/users", async (req, res) => {
    const { name, email } = req.body;
  
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      res.status(400).json({ error: "Name and email are required" });
      return;
    }
  
    try {
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
        },
      });
  
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });