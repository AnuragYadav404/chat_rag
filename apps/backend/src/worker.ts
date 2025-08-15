import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";

const fileUploadWorker = new Worker('fileUploadQueue', async job => {
    if(job.name==="file-upload-ready") {
        const data = JSON.parse(job.data);
        const filePath = data.filePath;


        // here when we are usng PDFLoader, each page in itself becomes a chunk
        // we probably do not want this
        // or probably need to look into overlapping logic


        const loader = new PDFLoader(filePath, {
            splitPages: false
        });
        const docs = await loader.load();
        if(!docs) {
            console.log("Failed to load PDF file");
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 200,
        });
        const texts = await textSplitter.splitDocuments(docs);

        // here when we are usng PDFLoader, each page in itself becomes a chunk

        const embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
            baseUrl: "http://localhost:11434",
        })

        // console.log("Starting instantiation of vector store via embeddings");
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "chat_rag"
        })
        console.log("Starting addition to vector store via embeddings");
        await vectorStore.addDocuments(texts);
        console.log("Adding documents completed")
        // worker is done here, its only job was to creat and store embeddings for a file upload
    }
   
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});