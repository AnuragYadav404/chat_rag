import { Worker } from "bullmq";

const fileUploadWorker = new Worker('fileUploadQueue', async job => {
    // here we do something with the job
   console.log("Job: ", job.data);
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});