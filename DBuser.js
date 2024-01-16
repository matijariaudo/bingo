import { Schema, Document, model } from 'mongoose';

const userSchema = new Schema({
    name:
    {
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//quita el password de la rta
userSchema.methods.toJSON= function(){
    const {password,_id,__v,... user}=this.toObject();
    user.id=_id;
    return user;
}

const userModel=model('User',userSchema);
export default userModel;