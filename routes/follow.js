import {Router} from "express";
import { body, check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { follow, unfollow, followin, followers, followsCount, listfollowers } from '../controllers/index.js'

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
route.get('/follow/followin/:id',validarJWT,followin)

//Ruta para mostrar los usuarios que me siguen
route.get('/follow/followers/:id',validarJWT,followers)

//Ruta para mostrar cuantos usuarios sigo y cuandos me siguen
route.get('/follow/followsCount/:id?',validarJWT,followsCount)

//Ruta para mostrar usuarios que me siguen sin paginar
route.get('/follow/followersList',validarJWT,listfollowers)

export default route
