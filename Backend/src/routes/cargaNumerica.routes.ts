import { Router } from "express";
import * as cargaNumericaController from "../controllers/cargaNumerica.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { cargaNumericaCreateSchema, cargaNumericaUpdateSchema } from "../validations/cargaNumerica.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.CARGAS_NUMERICAS;

router.get("/", authorize(P.ver), cargaNumericaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), cargaNumericaController.getById);
router.post("/", authorize(P.crear), validate(cargaNumericaCreateSchema), cargaNumericaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(cargaNumericaUpdateSchema),
  cargaNumericaController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), cargaNumericaController.remove);

export default router;
