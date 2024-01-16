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
    valores.shift()
    //console.log(valores)
    const minx=Math.min(...valores.map(a=>a.x));
    const maxx=Math.max(...valores.map(a=>a.xf));
    const miny=Math.min(...valores.map(a=>a.y));
    const maxy=Math.max(...valores.map(a=>a.yf));
    const pasox=(maxx-minx)/5;const limitx=[minx+0*pasox*.98,minx+1*pasox*.98,minx+2*pasox*.98,minx+3*pasox*.98,minx+4*pasox*.98,minx+5*pasox]
    const pasoy=(maxy-miny)/5;const limity=[miny+0*pasoy*.98,miny+1*pasoy*.98,miny+2*pasoy*.98,miny+3*pasoy*.98,miny+4*pasoy*.98,miny+5*pasoy]
    var rta=[]
    valores.forEach(e => {
        var posx=limitx.findIndex(a=>a>e.x)-1;
        var posy=limity.findIndex(a=>a>e.y)-1;
        !rta[posx]?rta[posx]=[]:"";
        !rta[posx][posy]?rta[posx][posy]=[]:"";
        rta[posx][posy].push(e.text)
        //console.log(e.text,posx,posy);
    });
    console.log(rta.map(a=>a.map(b=>b.join(" "))))
    return rta.map(a=>a.map(b=>b.join(" ")));
    
  } catch (error) {
    // error handling.
    console.log(error)
  }
}


//revisar("IQB583xAJAoDgYrchudkV.jpg");
//revisar("94ifrtNqIdRjoaxtZCuoR.jpg");
//revisar("DvPqZdEmP1PrSnDTugIV2.jpg");
//revisar("4VStFZi7mK29aRRvog2Oy.jpg");
//revisar("DjC6sRYyGzA7nxlfDOJUu.jpg")