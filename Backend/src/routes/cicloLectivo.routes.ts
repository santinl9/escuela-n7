import { Router } from "express";
import * as cicloLectivoController from "../controllers/cicloLectivo.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { cicloLectivoCreateSchema, cicloLectivoUpdateSchema } from "../validations/cicloLectivo.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.CICLOS_LECTIVOS;

router.get("/", authorize(P.ver), cicloLectivoController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), cicloLectivoController.getById);
router.post("/", authorize(P.crear), validate(cicloLectivoCreateSchema), cicloLectivoController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(cicloLectivoUpdateSchema),
  cicloLectivoController.update,
);
// Baja logica: exige el mismo permiso que Editar.
router.patch("/:id", authorize(P.editar), validateParams(idParamSchema), cicloLectivoController.desactivar);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), cicloLectivoController.remove);

export default router;
