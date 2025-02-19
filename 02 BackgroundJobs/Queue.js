import Queue from 'bull';

export const emailQueue = new Queue('email', {
    redis: { 
        port:  6379, 
        host:  '127.0.0.1',
        
      }
});


// Add an email job to the queue
export const addEmailToQueue = (to, subject, text) => {
  emailQueue.add({ to, subject, text });
  console.log("email is added to queue")
};




emailQueue.process(async (job) => {
  const { to, subject, text } = job.data;
  console.log(`Sending email to ${to}: ${subject} - ${text}`);
});


emailQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});


