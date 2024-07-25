import {Router} from "express";
import { body, check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { follow, unfollow, followin, followers } from '../controllers/index.js'

const route = Router();

//Rutas para seguir a un usuario
route.post('/follow/follow',validarJWT,follow)

//Ruta para dejar de seguir a un usuario
route.delete('/follow/unfollow/:id',[
    validarJWT,
    check('id','No es un id de mongo valido').isMongoId(),
    validarCampos
],unfollow)

//Ruta para mostrar los usuarios que sigo
route.get('/follow/followin',validarJWT,followin)

//Ruta para mostrar los usuarios que me siguen
route.get('/follow/followers',validarJWT,followers)

export default route
