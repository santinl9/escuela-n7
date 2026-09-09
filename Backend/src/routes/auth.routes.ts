import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

// Pública: es la única forma de obtener un token.
router.post("/login", validate(loginSchema), authController.login);

// Protegida: dar de alta usuarios es una operación administrativa. Requiere
// "Crear Usuarios", que solo tiene el Administrador. Un register público
// dejaría que cualquiera con un email institucional se auto-asigne roles.
router.post(
  "/register",
  authenticate,
  authorize(PERMISOS.USUARIOS.crear),
  validate(registerSchema),
  authController.register,
);

// Devuelve la identidad y los permisos efectivos del token actual.
router.get("/yo", authenticate, authController.yo);

export default router;
