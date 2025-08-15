import express from "express";
import multer from "multer";
import cors from "cors"
import { Queue } from "bullmq";

import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files are saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({storage})

const app = express();
app.use(cors())
app.use(express.json());

const queue = new Queue('fileUploadQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});


app.get("/", (req,res) => {
    return res.status(200).json({
        message: "Backend is up, working and serving requests"
    })
})

app.post("/fileUpload",upload.single("file"), async (req, res) => {
    if(!req.file) {
        console.log("File upload failed");
        return res.status(300).json({
            message: "File upload failed"
        })
    }
    await queue.add("file-upload-ready",JSON.stringify({
        filePath: req.file?.path
    }))
    res.status(200).json({
        message:"File upload successfull",
        filePath: req.file?.path
    })
})

app.post("/query", async (req, res) => {
  // here we need to get the query from req.body
  const query = req.body.query;
  if(!query) {
    return res.status(400).json({
      message: "No query found"
    })
  }

  // here we need to retrieve the documents from the qdrant vector store:
  // define embeddings
  // define vector store:
  // define retriever
  // query

  const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: "http://localhost:11434",
  })

  // console.log("Starting instantiation of vector store via embeddings");
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: "http://localhost:6333",
      collectionName: "chat_rag"
  })

  const retriever = vectorStore.asRetriever({
  // Optional filter
    k: 5, 
  });

  const result = await retriever.invoke(query);
  // result -> [{pageContent, metadata}]
  // result.map((res) => {
  //   console.log("result chunk: ", res)
  //   console.log("metadata: ",res.metadata);
  // })

  const contextText = result
      .map((doc, i) => `Document ${i + 1}:\n${doc.pageContent}`)
      .join("\n\n");

  const prompt = `You are a helpful assistant. 
  Use the provided context to answer the question as accurately as possible.
  If you don't know, say "I don't know".

  Context:
  ${contextText}

  Question: ${query}
  Answer:`;

  try {
    console.log("Fetching to the model")
    const GPTResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: true // Set true if you want streaming tokens
      })
    });

    const reader = GPTResponse.body?.getReader();
    if (!reader) throw new Error("No body returned from Ollama");

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        break;
      }
      const text = decoder.decode(value);
      /*
        chunk example:
          {"model":"llama3.2","created_at":"2025-08-15T17:14:57.35293Z","response":":\n\
                               │n","done":false}
      */
      const parsed = JSON.parse(text);
      process.stdout.write(parsed.response);
      res.write(parsed.response);
    }
    return res.status(200);

    // // console.log("Model fetching complete")
    // const data = await GPTResponse.json();
    // console.log(data.response);
    // return res.json({ answer: "Uery" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to call Ollama" });
  }

  return res.status(200).json({
    message: "query completed",
    result: JSON.stringify(result)
  })

})

app.listen(8000, () => {
    console.log("Server listening on http://localhost:8000")
})