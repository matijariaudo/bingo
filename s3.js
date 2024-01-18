import { S3, CreateBucketCommand,PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv'
dotenv.config()
 
 // Create an Amazon S3 service client object.
 const s3Client = new S3({ 
    region:'us-east-1',
    credentials: {
        accessKeyId:process.env.AWS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET
    }
});
 
 
//upload('img/bingo.jpg');
//createNewBucket("b-test-node-01")
 
export async function uploadS3(bucketName,archivoStream,name){
    // Set the parameters
    const params = {
    Bucket: bucketName, // The name of the bucket. For example, 'sample-bucket-101'.
    Key: name, // The name of the object. For example, 'sample_upload.txt'.
    Body: archivoStream, // The content of the object. For example, 'Hello world!".
    };
   // Create an object and upload it to the Amazon S3 bucket.
   try {
     const results = await s3Client.send(new PutObjectCommand(params));
     //console.log("Successfully created "+params.Key +" and uploaded it to " +params.Bucket + "/" + params.Key);
     return results; // For unit tests.
   } catch (err) {
     console.log("Error", err);
   }
 
 };

async function createNewBucket(name){
    const params = {
    Bucket: name, // The name of the bucket. For example, 'sample-bucket-101'.
    };
       
      // Create an Amazon S3 bucket.
    try {
        const data = await s3Client.send(
            new CreateBucketCommand({ Bucket: params.Bucket })
        );
        console.log(data);
        console.log("Successfully created a bucket called ", data.Location);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }

}

export async function showImg(name) {
    try {
        const input = {
        "Bucket": "b-test-node-01",
        "Key": name
        };
        const command = new GetObjectCommand(input);
        const url=await getSignedUrl(s3Client,command,{expiresIn:3600})
        return url;
      
    } catch (error) {
        console.log("Marca error la choota")
        console.error('Error al obtener la imagen desde S3:', error);
        return null;
    }
  }

  