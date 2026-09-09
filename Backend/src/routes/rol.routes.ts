import { Router } from "express";
import * as rolController from "../controllers/rol.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { rolCreateSchema, rolUpdateSchema } from "../validations/rol.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.ROLES;

router.get("/", authorize(P.ver), rolController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), rolController.getById);
router.post("/", authorize(P.crear), validate(rolCreateSchema), rolController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(rolUpdateSchema),
  rolController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), rolController.remove);

export default router;
