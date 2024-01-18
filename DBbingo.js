import { Type } from '@aws-sdk/client-s3';
import { ObjectId, Schema ,model } from 'mongoose';

const songSchema=new Schema({
    song:String,
    fila:Number,
    columna:Number,
    chequeado:{
        type:Boolean,
        default:false
    }
})

const bingoSchema = new Schema({
    url:String,
    name:String,
    user_id:String,
    active:{type:Boolean,default:true},
    //userId:ObjectId,
    bingo:
    {
        type:[songSchema],
    }
})

//quita el password de la rta
bingoSchema.methods.toJSON= function(){
    const {_v,_id,... dat}=this.toObject();
    dat.id=_id;
    return dat;
}

const bingoModel=model('Bingo',bingoSchema);
export default bingoModel;