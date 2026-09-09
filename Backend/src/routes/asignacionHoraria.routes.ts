import { Router } from "express";
import * as asignacionHorariaController from "../controllers/asignacionHoraria.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { asignacionHorariaCreateSchema, asignacionHorariaUpdateSchema } from "../validations/asignacionHoraria.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.ASIGNACIONES_HORARIAS;

router.get("/", authorize(P.ver), asignacionHorariaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), asignacionHorariaController.getById);
router.post("/", authorize(P.crear), validate(asignacionHorariaCreateSchema), asignacionHorariaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(asignacionHorariaUpdateSchema),
  asignacionHorariaController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), asignacionHorariaController.remove);

export default router;
