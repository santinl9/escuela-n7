import { Router } from "express";
import * as permisoController from "../controllers/permiso.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { permisoCreateSchema, permisoUpdateSchema } from "../validations/permiso.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.PERMISOS;

router.get("/", authorize(P.ver), permisoController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), permisoController.getById);
router.post("/", authorize(P.crear), validate(permisoCreateSchema), permisoController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(permisoUpdateSchema),
  permisoController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), permisoController.remove);

export default router;
