import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const fileUploadWorker = new Worker('fileUploadQueue', async job => {
    // here we do something with the job
    // what does this job do here now?
    // simple -> creates embedding for the file and stores it in a vectorDB
    if(job.name==="file-upload-ready") {
        // here the worker needs to do the embedding things:
        // 1. create embedding for the contents of the file in the queue:
        // 2. store these embeddings in a vector DB
        const data = JSON.parse(job.data);
        const filePath = data.filePath;
        console.log(filePath)
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        if(!docs) {
            console.log("Failed to load PDF file");
        }
        console.log("Docs are: ", docs)

        // here we get the doc in docs[0]
        // now we need to do the splitting
        const textSplitter = new CharacterTextSplitter({
            chunkSize: 100,
            chunkOverlap: 10,
        });
        const texts = await textSplitter.splitDocuments(docs);
        console.log("texts after splittng: ", texts)
        console.log("texts length: ", texts.length);
        console.log("Docs length:", docs.length)
        
    }
   
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});