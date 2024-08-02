import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from 'express-fileupload'
import responseTime from "response-time";

import { dbConecction } from "./database/connection.js";
//las rutas estan el en index y el index llama a cada ruta, aplique la del nombre por default que aplico juanpablo
import { userRouter, publicationRouter, followRouter, messageRouter } from './routes/index.js'

dotenv.config(); //iniciando variables de entorno
dbConecction(); //conexion base de datos Mongo

//Crear servidor de node
const app = express();
const puerto = process.env.PUERTO_EXPRESS || 3000;

//configurar cors
//Asemos uso de cors para solo permitir ciertos dominios se conecten a nuestra API
const dominiosPermitidos = [process.env.URL_CONFIRMAR,process.env.URL_FRONT];
const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1 || !origin ){
            callback(null, true)
        }else{
            callback(new Error('No permitido por CORS'))
        }
    }
}
app.use(cors(corsOptions))


//Habilitamos el middleware de response time, genera una nueva respuesta de header con el nombre X-Response-Time
app.use(responseTime())

//FileUpload carga de archivos
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
}))

//Convertir body a objeto de js, cuando se mandan datos en postman -> body -> row JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}))//para recibir datos desde un formulario si carga de imagenes postman -> body -> x-www-form-urlencoded o form-data

//Crear Rutas, como todas comienzan con /api ahi mandamos todas en el array
app.use("/api/red-social",[userRouter, publicationRouter, followRouter, messageRouter])

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        errors: [{ msg: 'Ruta no encontrada' }]
    });
});

//Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log(`El servidor de espress esta funcionando en el puerto ${puerto}`);
});
