import { Message, User } from '../models/index.js'
import {mongoose} from "mongoose";


//Accion de guardar un mensage
const saveMessage = async (req, res) => {
    
    const { id, message } = req.body

    try {

        //verifico si existe el usuario al que se le mandara el mensaje
        const validaUserRecepccion = User.findOne({_id:id,estdo:true})
        if(!validaUserRecepccion){
            return res.status(400).json({status:"error",msg:"El usuario al que intentas enviarle mensage no ha sido encontrado."})
        }

        const mensaje = new Message({emmiter:req.usuario.id,receiver:id, text:message})
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
                select:'name'
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

export {
    saveMessage,
    showMessageRecived
}