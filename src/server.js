if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const cert = fs.readFileSync(
    path.resolve(__dirname, `../certs/${process.env.GN_CERT}`)
)

const agent = new https.Agent({
    pfx: cert,
    passphrase:''
});


const credentials = Buffer.from( `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIET_SECRET}`).toString('base64');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', (req, res) => {

  let data = JSON.stringify({
    "grant_type": "client_credentials"
  });
  
  let configure = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-pix-h.gerencianet.com.br/oauth/token',
    httpsAgent: agent,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Basic Q2xpZW50X0lkX2ZlNjc3ZGQzYzM5NWE4ODBhYTcyNjkyODljNDdlYmExMDY5NTE0ZmI6Q2xpZW50X1NlY3JldF9kYTc2ZmQzZDkzNTEwYWQ4YmQ1NTI4MGFkYzU5YTFmNmIzYTU3MzBl'
    },
    data : data
  };
  
  axios.request(configure).then((response) => {
    const acessToken = response.data.access_token;
    console.log(acessToken)
  
    /*const reqGN = axios.create({
      baseUrl: process.env.GN_ENDPOINT,
      httpsAgent: agent,
      headers:{
        Authorization: `Bearer  ${acessToken}`,
        'Content-Type': 'application/json'
      }
    })*/
  
    const endpoint = 'https://api-pix-h.gerencianet.com.br/v2/cob'
  
     const dataCob = {
         calendario: {
           "expiracao": 3600
         },
         devedor: {
           "cpf": "12345678909",
           "nome": "Francisco da Silva"
         },
         valor: {
           "original": "0.01"
         },
         chave: "a38c5745-3787-4230-b5ef-d5cf68e6570f",
         "solicitacaoPagador": "Informe o número ou identificador do pedido."
       }
  
       const config = {
         httpsAgent: agent,
         headers: {
           Authorization: `Bearer ${acessToken}`,
           'Content-Type': 'application/json'
         }
       };
  
       axios.post(endpoint, dataCob, config).then((response) => {
         res.send((response.data));
  })
  });
 
})

app.listen(8000, () => {
  console.log('running');
})

