import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import dotenv from 'dotenv';
dotenv.config();

const client = new TextractClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET
    }
});

export async function revisar(nameArchivo) {
    console.log("Iniciando",nameArchivo);
    const params = {
        Document: {
            S3Object: {
                Bucket: 'b-test-node-01',
                Name: nameArchivo
            }
        },
        FeatureTypes: ['TABLES']
    };

    try {
        const command = new AnalyzeDocumentCommand(params);
        const response = await client.send(command);
        const blocks = response.Blocks;
        const tables = blocks.filter(block => block.BlockType === 'TABLE');

        // Initialize the table array to store rows
        let tableData = [];
        tables.forEach(table => {
            const rows = [];
            table.Relationships.forEach(relationship => {
                if (relationship.Type === 'CHILD') {
                    const cells = relationship.Ids.map(id => blocks.find(block => block.Id === id));
                    rows.push(cells);
                }
            });
            
            console.log(tableData)
            
            rows.forEach(row => {
                row.forEach(cell => {
                    if (cell.BlockType === 'CELL' && cell.Relationships) {
                        const cellText = extracText(cell,blocks);
                        !tableData[cell.RowIndex-1]?tableData[cell.RowIndex-1]=[cellText]:tableData[cell.RowIndex-1].push(cellText)
                        //.push(cellText);
                        //console.log(`  Cell (${cell.RowIndex}, ${cell.ColumnIndex}): ${cellText}`);
                        //console.log(tableData)
                    }
                });
                //tableData.push(rowData); // Push each row to the table data
            });
        });
        tableData=tableData.filter(a=>a)
        return tableData;
    
    } catch (error) {
        console.log(error);
    }
}

revisar("skpMgb1I4jbRJ7SVrJ8N2.jpg")

function extracText(cell,blocks){
    const text=cell.Relationships
    .filter(relationship => relationship.Type === 'CHILD')
    .flatMap(relationship => 
        relationship.Ids.map(id => blocks.find(block => block.Id === id))
    )
    .filter(block => block.BlockType === 'WORD')
    .map(word => word.Text)
    .join(' ');
    return text;
}