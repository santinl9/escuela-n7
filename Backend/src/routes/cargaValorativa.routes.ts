import { Router } from "express";
import * as cargaValorativaController from "../controllers/cargaValorativa.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { PERMISOS } from "../constants/permisos";
import { cargaValorativaCreateSchema, cargaValorativaUpdateSchema } from "../validations/cargaValorativa.validation";
import { idParamSchema } from "../validations/common.validation";

const router = Router();

// La autenticacion (authenticate) se aplica de forma global en index.ts; aca
// solo se declara el permiso que exige cada operacion. `authorize` va antes de
// `validate`: no tiene sentido validar el body de quien no puede ejecutar la
// accion, y evita filtrar reglas de negocio en los mensajes de validacion.
const P = PERMISOS.CARGAS_VALORATIVAS;

router.get("/", authorize(P.ver), cargaValorativaController.getAll);
router.get("/:id", authorize(P.ver), validateParams(idParamSchema), cargaValorativaController.getById);
router.post("/", authorize(P.crear), validate(cargaValorativaCreateSchema), cargaValorativaController.create);
router.put(
  "/:id",
  authorize(P.editar),
  validateParams(idParamSchema),
  validate(cargaValorativaUpdateSchema),
  cargaValorativaController.update,
);
// Borrado fisico: solo el Administrador tiene este permiso.
router.delete("/:id", authorize(P.eliminar), validateParams(idParamSchema), cargaValorativaController.remove);

export default router;
