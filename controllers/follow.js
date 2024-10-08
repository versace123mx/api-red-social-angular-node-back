import User from '../models/User.js'
import Follow from '../models/Follow.js'
import Publication from '../models/Publication.js'
import {mongoose} from "mongoose";


//Accion de guardar un follow (accion seguir)
const follow = async (req, res) => {
    
    const { idfolow } = req.body

    if(!idfolow){
        return res.status(400).json({status:"error",msg:"El campo id follow esta vacio."})
    }

    if(idfolow == req.usuario.id){
        return res.status(400).json({status:"error",msg:"No te puedes seguir a ti mismo."})
    }
    
    try {

        //validamos que el usuario a seguir exita y su estado sea true
        const verificaUser = await User.findById(idfolow)

        if( !verificaUser || !verificaUser.estado ){
            return res.status(400).json({status:"error",msg:"El usuario no existe o fue dado de baja."})
        }
        //validamos que no se siga ya previamente
        const verificaFollow = await Follow.find({
            $and:[
                {user:req.usuario.id},{followed:idfolow}
            ]
        })

        //Si el usuario ya se sigue entonces mandamos un error de que no se puede volver a seguir
        if( verificaFollow.length ){
            return res.status(400).json({status:"error",msg:"El usuario ya esta en seguimiento."})
        }

        const follow = new Follow({user:req.usuario.id,followed:idfolow})
        const resultFollow = await follow.save()
        res.status(200).json({status:"success",msg:"follow correctamente",data:resultFollow})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"No se pudo realizar el seguimiento.", error})
    }
}

//Accion de borrar un follow (accion dejar de seguir)
const unfollow = async (req, res) => {
    
    const { id } = req.params

    try {
    
        const {deletedCount} = await Follow.deleteOne({
            $and:[
                {user:req.usuario.id},{followed:id}
            ]
        })

        if( !deletedCount ){
            return res.status(400).json({status:"error",msg:"No se pudo eliminar, vuelve a intentarlo o quizas ya ha sido eliminado."})
        }
    
        
        res.status(200).json({status:"success",msg:"un-follow "})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Error al intentar borrar el usuario.", error})
    }
    
}

//Accion listado de usuarios que estoy siguiendo
const followin = async (req, res) => {

    const { id } = req.params
    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, nameUser, datosUser,follows,followers,followsUserLogin,followersUserLogin] = await Promise.all([
            Follow.countDocuments({user:id,estado: true}), //cuento cuantos usuarios sigo
            
            //Traigo el nombre del usuario que hace la peticion
            User.find({_id:id, estado:true}).select('name surname'),
            //se llama a los id de los seguidores y se popula para traer sus datos desde user
            Follow.find({user:id,estado: true}).select('followed')
            .populate({
                path:'followed',
                select:'-create_at -update_at -email -password -estado -role -__v'
            })
            .skip((pagina-1)*limite).limit(limite).sort({create_at:-1}),

            //a quien sigue y quien lo sigue del usuario que hace la peticion
            Follow.find({estado: true, user:id}).select("followed"),
            Follow.find({estado: true, followed:id}).select("user"),


            //a quien sigue y quien lo sigue del usuario de la session
            Follow.find({estado: true, user:req.usuario.id}).select("followed"),
            Follow.find({estado: true, followed:req.usuario.id}).select("user")
        ])

        let siguiendoUserLogin = []
        let quientesigueUserLogin = []


        let siguiendo = follows.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let quientesigue = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow

        if(!datosUser.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",data:[] })
        }

        //verifico si el que hace la peticion es otro usuario y no el logueado
        if( id != req.usuario.id){
            siguiendoUserLogin = followsUserLogin.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
            quientesigueUserLogin = followersUserLogin.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow

            siguiendo = siguiendoUserLogin.filter(x => siguiendo.includes(x));

            if(!siguiendo.length){
                siguiendo = quientesigueUserLogin
            }
            
        }
        
        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado x user",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,follows:siguiendo,followers:quientesigue,nameUser,data:datosUser})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[] })
    }

}

//Accion listado de usuarios que me siguen
const followers = async (req, res) => {

    const { id } = req.params
    const { limite = 5, pagina = 1 } = req.query //Los parametros que bienen en la query

    if(isNaN(limite) || isNaN(pagina)){
        return res.json({ status: "error", msj: 'Los valores deben de ser numeros' });
    }

    try {

        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [total, nameUser, datosUser,follows,followers,followsUserLogin,followersUserLogin] = await Promise.all([
            Follow.countDocuments({followed:id,estado: true}), //cuento cuantos usuarios sigo
            
            //Traigo el nombre del usuario que hace la peticion
            User.find({_id:id, estado:true}).select('name surname'),
            //se llama a los id de los seguidores y se popula para traer sus datos desde user
            Follow.find({followed:id,estado: true}).select('followed')
            .populate({
                path:'user',
                select:'-create_at -update_at -email -password -estado -role -__v'
            })
            .skip((pagina-1)*limite).limit(limite).sort({create_at:-1}),

            //a quien sigue y quien lo sigue del usuario que hace la peticion
            Follow.find({estado: true, user:id}).select("followed"),
            Follow.find({estado: true, followed:id}).select("user"),


            //a quien sigue y quien lo sigue del usuario de la session
            Follow.find({estado: true, user:req.usuario.id}).select("followed"),
            Follow.find({estado: true, followed:req.usuario.id}).select("user")
        ])

        let siguiendoUserLogin = []
        let quientesigueUserLogin = []

        let siguiendo = follows.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
        let quientesigue = followers.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow
        
        quientesigue = siguiendo.filter(x => quientesigue.includes(x));

        if(!datosUser.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",data:[] })
        }

        //verifico si el que hace la peticion es otro usuario y no el logueado
        if( id != req.usuario.id){
            siguiendoUserLogin = followsUserLogin.map(follow => follow.followed.toString());//Devuelve arreglo de personas quien sigo para manejar el boton de follow
            quientesigueUserLogin = followersUserLogin.map(follow => follow.user.toString());//Devuelve arreglo de personas que me sigen para manejar el boton de unfollow

            quientesigue = quientesigueUserLogin.filter(x => quientesigue.includes(x));
            if(!quientesigue.length){
                quientesigue = siguiendoUserLogin
            }

        
        }
        
        const totalPaginas = Math.ceil(total/limite)
        res.status(200).json({ status: "success", msg:"desde el listado x user",
        totalRegistros:total,pagina,totalPaginas,numRegistrosMostrarXPagina:limite,follows:siguiendo,followers:quientesigue,nameUser,data:datosUser})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[] })
    }

}

//Accion para mostrar el numero de usuarios que sigo y cuantos me siguen, cuantas publicaciones he realizado como usuario logueado
const followsCount =  async (req, res) => {

    try {
        const { id } = req.query
        let iduser = ''
        if(id){
            iduser = id
        }else{
            iduser = req.usuario.id
        }
        //Para este caso se crean dos promesas para que corra al mismo tiempo y se hace una destructuracion de arreglos
        const [totalFollow, totalFollowing, totalPublications] = await Promise.all([
            Follow.countDocuments({user:iduser,estado: true}),
            Follow.countDocuments({followed:iduser,estado: true}),
            Publication.countDocuments({user:iduser,estado: true})
        ])
        
        if( !totalFollow && !totalFollowing && !totalPublications ){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",data:[] })
        }

        res.status(200).json({ status: "success", msg:"desde el contador de seguidores y siguiendo",
        data:[{
            follow:totalFollow,
            followme:totalFollowing,
            publication:totalPublications
        }]})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[], error })
    }

}


//Accion listado de usuarios que me siguen
const listfollowers = async (req, res) => {
    //console.log(req.usuario.id)
    try {

        //se llama a los id de los seguidores y se popula para traer sus datos desde user
        const datosUser = await Follow.find({followed:req.usuario.id, estado:true}).select('followed')
        .populate('user',"-create_at -update_at -email -password -estado -role -__v")
        
        if(!datosUser.length){
            return res.status(404).json({status:"success",msg:"No hay registros encontrados",data:[] })
        }

        res.status(200).json({ status: "success", msg:"desde el listado de los que me siguen",data:datosUser})

    } catch (error) {
        return res.status(400).json({status:"error",msg:"Eror en la operacion, no se pudo ejecutar",data:[] })
    }

}

export{
    follow,
    unfollow,
    followin,
    followers,
    followsCount,
    listfollowers
}