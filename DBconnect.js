import mongoose from 'mongoose'
import userModel from './DBuser.js';
import dotenv from 'dotenv'
dotenv.config()

// URL de conexión a tu base de datos MongoDB
const uri = process.env.MONGO;

async function mongoConnect(){
    try{
    const clientDB=mongoose.connect(uri);
      console.log('Conexión a MongoDB establecida');
    } catch (error) {
      console.error('Error al conectar a MongoDB', error);
      process.exit(1); // Salir de la aplicación en caso de error de conexión
    }

}



export default mongoConnect;

