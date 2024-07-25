import User from '../models/User.js'
import Follow from '../models/Follow.js'
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
        res.status(200).json({status:"success",msg:"follow correctamente"})

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

    try {
        
        const results = await Follow.aggregate([
            {$match: { user: new mongoose.Types.ObjectId(req.usuario.id) }},
            {
                $lookup: {
                    from: 'users',
                    localField: 'followed',
                    foreignField: '_id',
                    as: 'followedUser'
                }
            },
            { $unwind: '$followedUser' },
            {
                $project: {
                    _id: 0,
                    followedUser: {
                        name: '$followedUser.name',
                        nick: '$followedUser.nick',
                        email: '$followedUser.email'
                    }
                }
            }
        ]);

        if(!results.length){
            return res.status(200).json({status:"success",msg:"followin ", followedUsers: 'No hay registros a mostrar' })
        }
        
        
        res.status(200).json({status:"success",msg:"followin ", followedUsers: results.map(result => result.followedUser) })
    } catch (error) {
        return res.status(400).json({status:"error",msg:"Error al intentar Obtener los followin.", error})
    }
}

//Accion listado de usuarios que me siguen
const followers = async (req, res) => {

    try {
        
        const results = await Follow.aggregate([
            {$match: { followed: new mongoose.Types.ObjectId(req.usuario.id) }},
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'followedUser'
                }
            },
            { $unwind: '$followedUser' },
            {
                $project: {
                    _id: 0,
                    followedUser: {
                        name: '$followedUser.name',
                        nick: '$followedUser.nick',
                        email: '$followedUser.email'
                    }
                }
            }
        ]);

        if(!results.length){
            return res.status(200).json({status:"success",msg:"followin ", followedUsers: 'No hay registros a mostrar' })
        }
        
        
        res.status(200).json({status:"success",msg:"followin ", followedUsers: results.map(result => result.followedUser) })
    } catch (error) {
        return res.status(400).json({status:"error",msg:"Error al intentar Obtener los followin.", error})
    }
}

export{
    follow,
    unfollow,
    followin,
    followers
}