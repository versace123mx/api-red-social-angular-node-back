import {Router} from "express";
import { body, check } from 'express-validator'
import { validarCampos, validarArchivoSubir, validarJWT } from '../middleware/index.js'
import { saveMessage, showMessageRecived, showMessagesSend, showCountMessagesRecivedNoView, checkMessagesRecivedView } from '../controllers/index.js'

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

//Ruta para mostrar todos los mensajes recividos del usuario logueado
route.get('/message/showMessageRecived',validarJWT,showMessageRecived)

//Ruta para mostrar todos los mensajes enviados del usuario logueado
route.get('/message/showMessagesSend',validarJWT,showMessagesSend)

//Ruta para mostrar el numero de mensages no leidos
route.get('/message/showMessagesNoView',validarJWT,showCountMessagesRecivedNoView)

//Ruta para marcar un mensaje como leido
route.put('/message/checkMessagesView/:id',[
    validarJWT,
    check('id','El id no es un id de Mongo Valido').isMongoId(),
    validarCampos
],checkMessagesRecivedView)
export default route
