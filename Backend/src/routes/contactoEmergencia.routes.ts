import { Router } from "express";
import * as contactoEmergenciaController from "../controllers/contactoEmergencia.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { contactoEmergenciaCreateSchema, contactoEmergenciaUpdateSchema } from "../validations/contactoEmergencia.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.CONTACTOS_EMERGENCIA;

router.get("/", authorize(P.ver), contactoEmergenciaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), contactoEmergenciaController.getById);
router.post("/", authorize(P.crear), validate(contactoEmergenciaCreateSchema), contactoEmergenciaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(contactoEmergenciaUpdateSchema),
  contactoEmergenciaController.update,
);
// Baja logica: exige el mismo permiso que Editar.
router.patch("/:id", authorize(P.editar), validateParams(idParamSchema), contactoEmergenciaController.desactivar);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), contactoEmergenciaController.remove);

export default router;
