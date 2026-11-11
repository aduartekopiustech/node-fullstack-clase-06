import express from "express";
import cors from "cors";
import * as yup from "yup";

const createUserSchema = yup
  .object({
    name: yup.string().required(),
    email: yup.string().email().required(),
  })
  .noUnknown(true, "Unknown fields are not allowed");

const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid request body", error: error.errors });
  }
};

class Server {
  #app;
  #port;
  #nextId = 3;
  #users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
  ];

  constructor() {
    this.#app = express();
    this.#port = process.env.PORT || 3000;

    this.#middleware();
    this.#registerRoutes();
  }

  #sendNotFound(req, res) {
    res.status(404).json({ error: "Not Found" });
  }

  #findUserById(id) {
    return this.#users.find((user) => user.id === id);
  }

  #registerRoutes() {
    this.#app.get("/api/users", (req, res) => {
      res.json({ data: this.#users });
    });

    this.#app.get("/api/users/search", (req, res) => {
      const { keywords } = req.query;
      const search = String(keywords).trim().toLowerCase();

      const users = this.#users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search),
      );

      res.json({ data: users });
    });

    this.#app.get("/api/users/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const user = this.#findUserById(id);

      if (!user) {
        return this.#sendNotFound(req, res);
      }

      res.json({ data: user });
    });

    this.#app.post("/api/users", validateBody(createUserSchema), (req, res) => {
      const user = {
        id: this.#nextId++,
        ...req.body,
      };
      this.#users.push(user);
      res.status(201).json({ data: user });
    });
  }

  #middleware() {
    this.#app.use(express.json());
    this.#app.use(cors());
  }

  start() {
    this.#app.listen(this.#port, () => {
      console.log(`Server is running on port ${this.#port}`);
    });
  }
}

export default Server;
