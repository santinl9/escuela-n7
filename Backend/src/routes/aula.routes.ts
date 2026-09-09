import { Router } from "express";
import * as aulaController from "../controllers/aula.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { aulaCreateSchema, aulaUpdateSchema } from "../validations/aula.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.AULAS;

router.get("/", authorize(P.ver), aulaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), aulaController.getById);
router.post("/", authorize(P.crear), validate(aulaCreateSchema), aulaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(aulaUpdateSchema),
  aulaController.update,
);
// Baja logica: exige el mismo permiso que Editar.
router.patch("/:id", authorize(P.editar), validateParams(idParamSchema), aulaController.desactivar);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), aulaController.remove);

export default router;
