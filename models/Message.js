import mongoose from "mongoose";

//Creamos el Schema
const MessageSchema = mongoose.Schema({
    emmiter: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User' //este es la referencia asia el id del usuario que emite el mensaje
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId, //este es el que indica que sera un tipo id objeto
        ref: 'User' //este es la referencia asia el id del usuario que recibe el mensaje
    },
    text:{
        type: String,
        default:''
    },
    estado:{
        type: Boolean,
        default: true
    },
    view:{
        type: Boolean,
        default: false
    },
    create_at:{
        type: Date,
        default:Date.now
    },
    update_at:{
        type: Date,
        default:Date.now
    }
})

//Retornamos solo los datos que nesecitamos ver no el passsword, no el __v, no _id esto es del Schema y al _id le cambiamos el nombre visualmente
MessageSchema.methods.toJSON = function(){
    const {__v, _id, estado, ...message} = this.toObject();
    message.uid = _id;
    return message;
}

//Creamos el modelo dentro colocamos el nombre de la coleccion y le pasamos el schema, la coleccione ahora en mongo sera Articulo
const Message = mongoose.model('Message',MessageSchema);

//Exportamos el modelo
export default Message;