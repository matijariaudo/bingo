import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoConnect from './DBconnect.js';
import multer from 'multer';
import fs from 'fs'
import { uploadS3 , showImg} from './s3.js';
import https from 'https'
import { generarLetrasNumeros } from './nroAzar.js';
import { revisar } from './ocr.js';
import userModel from './DBuser.js';
import bingoModel from './DBbingo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);


const app = express();
await mongoConnect()
app.use(express.static(join(__dirname, 'public')));
app.use(express.json())

// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
  //destination: join(__dirname, 'uploads'), // Define la carpeta donde se guardarán los archivos
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Usa el nombre original del archivo
  }
});
const upload = multer({ storage: storage });


app.post('/user/new',async(req,res)=>{
    const {name,password}=req.body;
    console.log(name,password)
    if(!name || !password){
      return res.status(200).send({"req":"Error"})
    }
    
    const checkU=await userModel.findOne({name})
    if(checkU){
      const newBingo=new bingoModel({"name":"Nuevo Bingo",userId:checkU._id});
      await newBingo.save();
      return res.status(200).send({"error":"The user is already created"})}
    
    return res.status(200).send({checkU})
})

// Mostrar el formulario de carga de archivos
app.get('*', (req, res) => {
  console.log("Mostrando1")
  return res.sendFile(join(__dirname, 'public/index.html'))
});

app.get('/img/:name', async (req, res) => {
    const { name } = req.params;
    try {
        console.log(name)
        const imgUrl = await showImg(name);
        res.status(200).send(imgUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener la imagen');
    }
});

app.post('/cambios', async (req, res) => {
    const { ids , valor} = req.body;
    // Buscar cualquier documento 'Bingo' que tenga al menos una canción con la ID proporcionada
    const bingo = await bingoModel.find({ 'bingo._id': { $in: ids } });
    if (!bingo) {
      return res.status(404).json({ error: 'No se encontró el documento Bingo que contiene las canciones proporcionadas.' });
    }
    console.log(bingo)
    bingo.forEach(async(b) => {
      b.bingo.forEach(song => {
        if (ids.includes(song._id.toString())) {
          // Realizar la actualización según tus requisitos
          console.log(song._id.toString(),"check")
          song.chequeado = valor; // Por ejemplo, actualizar el campo 'chequeado' a true
        }
      });
      await b.save();   
    });
    
    return res.status(200).json({ message: 'Canciones actualizadas exitosamente.' });

})

app.post('/delete', async (req, res) => {
  const { id , status} = req.body;
  // Buscar cualquier documento 'Bingo' que tenga al menos una canción con la ID proporcionada
  const bingo = await bingoModel.findById(id);
  if (!bingo) {
    return res.status(404).json({ error: 'No se encontró el documento Bingo que contiene las canciones proporcionadas.' });
  }
  bingo.active=status;
  await bingo.save()
  return res.status(200).json({ message: 'Canciones actualizadas exitosamente.' });
})

app.post('/user/img',async(req,res)=>{
  const {user_id}=req.body;
  if(!user_id){return res.status(400).send('Ha ocurrido un error al leer la imagen');}
  const img=await bingoModel.find({active:true,user_id});
  for (let i = 0; i < img.length; i++) {
    img[i].url= await showImg(img[i].url);
  }
  return res.status(200).send(img)
})

// Manejar la carga del archivo utilizando multer
app.post('/upload', upload.single('archivo'),async(req, res) => {
  // Verificar si req.file está definido antes de acceder a sus propiedades
  if (req.file) {
    const archivo = req.file;
    const {archivo_name,user_id} = req.body;
    const name=generarLetrasNumeros(21)+".jpg";
    const archivoStream = fs.createReadStream(archivo.path);
    await uploadS3("b-test-node-01",archivoStream,name)
    const contenido= await revisar(name);
    if(!contenido){return res.status(400).send('Ha ocurrido un error al leer la imagen');}
    const img=new bingoModel({url:name,name:archivo_name,user_id})
    let f=0; let c=0;
    contenido.forEach(t => {
      t.forEach(e => {
        img.bingo.push({song:e,fila:f,columna:c})
        c++;
      });
      c=0;f++;
    });
    await img.save();
    res.status(200).send({contenido});
  } else {
    return res.status(400).send('No se ha subido ningún archivo');
  }
});

app.listen(8000,()=>{console.log("Funcionando en puerto 8000")})

