import { Router } from "express";
import * as personaController from "../controllers/persona.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { personaCreateSchema, personaUpdateSchema } from "../validations/persona.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.PERSONAS;

router.get("/", authorize(P.ver), personaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), personaController.getById);
router.post("/", authorize(P.crear), validate(personaCreateSchema), personaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(personaUpdateSchema),
  personaController.update,
);
// Baja logica: exige el mismo permiso que Editar.
router.patch("/:id", authorize(P.editar), validateParams(idParamSchema), personaController.desactivar);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), personaController.remove);

export default router;
