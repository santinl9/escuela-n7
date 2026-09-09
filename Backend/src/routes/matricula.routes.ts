import { Router } from "express";
import * as matriculaController from "../controllers/matricula.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { matriculaCreateSchema, matriculaUpdateSchema } from "../validations/matricula.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.MATRICULAS;

router.get("/", authorize(P.ver), matriculaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), matriculaController.getById);
router.post("/", authorize(P.crear), validate(matriculaCreateSchema), matriculaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(matriculaUpdateSchema),
  matriculaController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), matriculaController.remove);

export default router;
