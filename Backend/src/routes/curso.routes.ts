import { Router } from "express";
import * as cursoController from "../controllers/curso.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { cursoCreateSchema, cursoUpdateSchema } from "../validations/curso.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.CURSOS;

router.get("/", authorize(P.ver), cursoController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), cursoController.getById);
router.post("/", authorize(P.crear), validate(cursoCreateSchema), cursoController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(cursoUpdateSchema),
  cursoController.update,
);
// Baja logica: exige el mismo permiso que Editar.
router.patch("/:id", authorize(P.editar), validateParams(idParamSchema), cursoController.desactivar);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), cursoController.remove);

export default router;
