// Import Express.js
import express from 'express';
import cors from 'cors';

// Create an Express app
const app = express();


app.use(cors())

// app.use(cors({
//     origin:'<your_origin>',
//     methods:['GET','POST'],
//     allowedHeaders:['Content-Type','Authorization']
// }))

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/existing-number', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
  res.send('ok')
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});