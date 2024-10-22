import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../dao/models/user.model.js";
import UserDTO from "../dtos/user.dto.js";
import userRepository from "../repositories/user.repository.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, age, role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Rol no válido. Debe ser 'admin' o 'user'." });
    }

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Este correo ya está registrado" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: encryptedPassword,
      cart: null,
      role,
    };

    const savedUser = await userRepository.createUser(newUser);

    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post("/register", registerUser);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).lean();
  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const tokenPayload = { id: user._id, email: user.email, role: user.role };
  const authToken = jwt.sign(tokenPayload, "C0D3RB4CK", { expiresIn: "1h" });
  res.json({ message: "login OK", token: authToken });
});

router.get("/current", authenticateJWT, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  const currentUserDTO = new UserDTO(req.user);
  res.json({ message: "Autenticación exitosa", user: currentUserDTO });
});

export default router;
