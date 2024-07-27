import {Router} from "express";
import { body, check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { saveMessage, showMessageRecived } from '../controllers/index.js'

const route = Router();

//Rutas para seguir a un usuario
route.post('/message/sendMessage',[
    validarJWT,
    check('id','El id del usuario que recibe el mensaje es obligatorio').notEmpty(),
    check('id','El id no es un id de Mongo Valido').isMongoId(),
    check('message','El campo mensage no debe de estar vacio').trim().toLowerCase().notEmpty(),
    check('message','El campo mensage debe de tener al menos 5 caracteres').isLength({min:5, max:800}),
    validarCampos
],saveMessage)

//Ruta para mostrar todos los mensajes del usuario logueado
route.get('/message/showMessageRecived',validarJWT,showMessageRecived)

/*
//Ruta para dejar de seguir a un usuario
route.delete('/message/unfollow/:id',[
    validarJWT,
    check('id','No es un id de mongo valido').isMongoId(),
    validarCampos
],unfollow)

//Ruta para mostrar los usuarios que sigo
route.get('/message/followin',validarJWT,followin)

//Ruta para mostrar los usuarios que me siguen
route.get('/message/followers',validarJWT,followers)

//Ruta para mostrar cuantos usuarios sigo y cuandos me siguen
route.get('/message/followsCount',validarJWT,followsCount)

*/
export default route
