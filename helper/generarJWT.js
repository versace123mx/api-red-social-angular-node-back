import jwt from 'jsonwebtoken';

const generarJWT = (id) => {
    return jwt.sign({ uid: id }, process.env.JWT_SECRET,{
        expiresIn: "1h",
    });
}

export default generarJWT;