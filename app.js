// Import Express.js
import express, { response } from 'express';
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

// Route for (existing number)
app.post('/existing-number', (req, res) => {
  // const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  // console.log(`\n\nWABA Details: ${timestamp}\n`);
  // console.log(JSON.stringify(req.body, null, 2));
  const payload=req.body
  const WABAid=payload.singnupData.data.waba_id
  const businessid=payload.singnupData.data.business_id
  const tempToken=payload.tempToken

  console.log("WABA id is:",WABAid)
  console.log("Business id is:",businessid)
  console.log("temperory token is:",tempToken)


  // Get Business Access Token valid for 60 days by exchanging tempToken
  const url=new URL('https://graph.facebook.com/v21.0/oauth/access_token')
  url.searchParams.append('client_id',process.env.FB_APP_ID)
  url.searchParams.append('client_secret',process.env.FB_APP_SECRET)
  url.searchParams.append('code',tempToken)

  fetch(url.toString())
  .then(res=>res.json())
  .then(response=>{
    console.log("Business Token is:",response)
    const bSUAT=response.access_token
    res.json({success:true,message:"bSUAT created successfually"})

    const revokeUrl=new URL('https://graph.facebook.com/v23.0/oauth/revoke')
    revokeUrl.searchParams.append('client_id',process.env.FB_APP_ID)
    revokeUrl.searchParams.append('client_secret',process.env.FB_APP_SECRET)
    revokeUrl.searchParams.append('revoke_token',bSUAT)
    revokeUrl.searchParams.append('access_token',process.env.VERIFY_TOKEN)

    setTimeout(()=>{
      fetch(revokeUrl.toString())
      .then(res=>res.json())
      .then(response=>{
        console.log("Access Token removed:",response)
      })
      .catch(error=>{
        console.log("Access Token removed error:",error)
      })
    },30000)

  })
  .catch(error=>{
    console.log("There is an Error:",error)
    res.json({success:false,message:'bSUAT creation error'})
  })

});


// Route for digest webhooks by WhatsApp
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received-02 ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});