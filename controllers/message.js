import { Message, User } from '../models/index.js'
import {mongoose} from "mongoose";


//Accion de guardar un mensage
const saveMessage = async (req, res) => {
    
    const { receiver, text } = req.body
    
    try {

        //verifico si existe el usuario al que se le mandara el mensaje
        const validaUserRecepccion = User.findOne({_id:receiver,estdo:true})
        if(!validaUserRecepccion){
            return res.status(400).json({status:"error",msg:"El usuario al que intentas enviarle mensage no ha sido encontrado."})
        }

        const mensaje = new Message({emmiter:req.usuario.id,receiver, text})
        const resultMessage = await mensaje.save()
        res.status(200).json({status:"success",msg:"Mensaje enviado..."})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"No se pudo enviar el menssage.", error})
    }

}


//Metodo que muestra todos los mensajes recibidos del usuario logueado y paginado
const showMessageRecived = async (req, res) => {

    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }
    try {
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, meesage] = await Promise.all([
            Message.countDocuments({receiver:req.usuario.id,estado: true}),
            Message.find({receiver:req.usuario.id,estado: true}).skip((pagina-1)*limite).limit(limite)
            .select("-emmiter -receiver -update_at")
            .populate({
                path:'emmiter',
                select:'name surname nick imagen'
            })
        ])

        if(!total){
            return res.status(400).json({ status: "error", msg: "No hay mensages nuevos",data:[] })
        }

        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado de messages",
            totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,data:meesage})    
    } catch (error) {
        return res.status(400).json({ status: "error", msg: "Problema al obtener los usuarios",data:[],error })
    }

}


//Metodo para listar los mensajes enviados
const showMessagesSend = async (req, res) => {

    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }
    try {
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, meesage] = await Promise.all([
            Message.countDocuments({emmiter:req.usuario.id,estado: true}),
            Message.find({emmiter:req.usuario.id,estado: true}).skip((pagina-1)*limite).limit(limite)
            .select("-emmiter -receiver -update_at, -view -update_at")
            .populate({
                path:'receiver',
                select:'name surname nick imagen'
            })
        ])

        if(!total){
            return res.status(400).json({ status: "error", msg: "No hay mensages enviados",data:[] })
        }

        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado de messages enviados",
            totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,data:meesage})    
    } catch (error) {
        return res.status(400).json({ status: "error", msg: "Problema al obtener los mensajes enviados",data:[],error })
    }

}

//Metodo para mostrar los mensages sin leer
const showCountMessagesRecivedNoView = async (req, res) => {

    try {
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const messageRecivedNoView =  await Message.countDocuments({receiver:req.usuario.id,estado: true, view:false})

        if(!messageRecivedNoView){
            return res.status(400).json({ status: "error", msg: "No hay mensages nuevos",data:[] })
        }

        res.status(200).json({ status: "success", msg:"desde el listado de messages no leidos",
            data:[{messageNoLeidos: messageRecivedNoView}]})    
    } catch (error) {
        return res.status(400).json({ status: "error", msg: "Problema al obtener los mensajes no vistos",data:[],error })
    }

}

//Marcar mensajes leidos
const checkMessagesRecivedView = async (req, res) => {

    const { id } = req.params

    try {
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const messageRecivedNoView =  await Message.findOneAndUpdate({_id:id,receiver:req.usuario.id,estado: true, view:false},{view:true,update_at:Date.now()})

        if(!messageRecivedNoView){
            return res.status(400).json({ status: "error", msg: "No hay mensages nuevos",data:[] })
        }

        res.status(200).json({ status: "success", msg:"Menssage marcado como leido correctamente",data:[]})    
    } catch (error) {
        return res.status(400).json({ status: "error", msg: "Problema al markar el mensaje no vistos a visto",data:[],error })
    }

}

export {
    saveMessage,
    showMessageRecived,
    showMessagesSend,
    showCountMessagesRecivedNoView,
    checkMessagesRecivedView
}