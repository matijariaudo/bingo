import { TextractClient, DetectDocumentTextCommand} from "@aws-sdk/client-textract";
import dotenv from 'dotenv'
dotenv.config()

// a client can be shared by different commands.
const client = new TextractClient({ 
    region:'us-east-1',
    credentials: {
        accessKeyId:process.env.AWS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET
    }
});

export async function revisar(nameArchivo)
{
    console.log("Iniciando")
    var valores=[]
    const params = {
        Document: {
            S3Object: {
                Bucket: 'b-test-node-01', // Nombre del bucket de prueba
                Name: nameArchivo // Nombre del documento de prueba en el bucket
            },
            FeatureTypes: ['TABLES']
        }
    };

try {
    const command = new DetectDocumentTextCommand(params);
    const response = await client.send(command);
    //console.log(response)
    const blocks=response.Blocks;
    blocks.filter(a=>a.BlockType=='LINE').forEach((e,i) => {
    //    console.log(e.BlockType,e.Text,e.Geometry.BoundingBox.Top,e.Geometry.BoundingBox.Left)
        valores.push({text:e.Text,
                    x:e.Geometry.BoundingBox.Top,xf:e.Geometry.BoundingBox.Top+e.Geometry.BoundingBox.Height,
                    y:e.Geometry.BoundingBox.Left,yf:e.Geometry.BoundingBox.Left+e.Geometry.BoundingBox.Width,
                    pos:i})
    });
    //valores.shift()
    //console.log(valores)
    let minx=Math.min(...valores.map(a=>a.x));
    const maxx=Math.max(...valores.map(a=>a.xf));
    const miny=Math.min(...valores.map(a=>a.y));
    const maxy=Math.max(...valores.map(a=>a.yf));
    minx=minx-(maxx-minx)/11;
    const pasox=(maxx-minx)/12;const limitx=[minx+1*pasox,minx+3*pasox,minx+5*pasox,minx+7*pasox,minx+9*pasox,minx+11*pasox]
    const pasoy=(maxy-miny)/10;const limity= [minx+1*pasoy,minx+3*pasoy,minx+5*pasoy,minx+7*pasoy,minx+9*pasoy]
    //console.log("const coordenadasY = ",limitx)
    //console.log("const coordenadasX = ",limity)
    var rta=[]
    valores.forEach(e => {
        var distanciasx1=limitx.map(a=>Math.abs(a-e.x))
        var disMinx1=Math.min(...distanciasx1)
        var distanciasx2=limitx.map(a=>Math.abs(a-e.xf))
        var disMinx2=Math.min(...distanciasx2)
        var posx;
        if(disMinx1<disMinx2){posx=distanciasx1.indexOf(disMinx1);}else{posx=distanciasx2.indexOf(disMinx2)} 
        
        var distanciasy=limity.map(a=>Math.abs(a-(e.yf+e.y)/2))
        var disMiny=Math.min(...distanciasy)
        var posy=distanciasy.indexOf(disMiny)
        !rta[posx]?rta[posx]=[]:"";
        !rta[posx][posy]?rta[posx][posy]=[]:"";
        rta[posx][posy].push(e.text)
        //console.log(e.text,posx,posy);
    });
    const fin=rta.map(a=>a.map(b=>b.join(" ")));
    //console.log(rta.map(a=>a.map(b=>b.join(" "))))
    return  fin.slice(1)
    
    
  } catch (error) {
    // error handling.
    console.log(error)
  }
}

//console.log(await revisar("ES1kHvVgGE4YvFTERmupI.jpg"))
//console.log(await revisar("p7mRTbJpMLcrK99krtyiE.jpg"))

//revisar("94ifrtNqIdRjoaxtZCuoR.jpg");
//revisar("DvPqZdEmP1PrSnDTugIV2.jpg");
//revisar("4VStFZi7mK29aRRvog2Oy.jpg");
//revisar("DjC6sRYyGzA7nxlfDOJUu.jpg")