import jwt from 'jsonwebtoken'
import User from '../models/User.js'
export const protect = async(req, res,next)=>{
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            success:false,
            error:"Please Login"
        })
    }
    try{
        // verify token
        const data = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findById(data.userId)
        if(!user){
            return res.status(401).json({
                success:false,
                error:"Unauthorize!"
            })
        }
        user.password =undefined
        req.user = user
        next()
    }catch(err){
        res.status(401).json({
            success:false,
            error:"Invalid Token!"
        })
    }
}

