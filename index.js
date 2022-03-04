const express = require('express');

const app = express();

const fs = require('fs');

const request = require('request');

const bodyParser = require('body-parser');
app.use(bodyParser.json({extended:true}), express.json());

const axios = require('axios');

const { v4: uuidv4 } = require('uuid');

const timestamp = require('time-stamp');

let token;

fs.watchFile('./payload.json', async function(event, filename){
    console.log('event is ' + event);
    await axios.post('https://identity.fortellis.io/oauth2/aus1p1ixy7YL8cMq02p7/v1/token', 
        {
            'grant_type': 'client_credentials',
            scope: 'anonymous'
        },
        {
            headers: {
                Accept: 'application/json',
                Authorization: 'Basic base64Encoded{yourAPI:yourSecret}',
                'Cache-Control': 'no-cache'
            }
        } ) 
        .then(function (response){
            console.log(response.data.access_token);
            token = response.data.access_token;
        })
        .catch(function (error){
            console.log(error);
        })
    if(filename){
        console.log('filename provided: ' + filename);
        fs.readFile('./payload.json', 'utf-8', function(err, data){
            const arrayOfObjects = JSON.parse(data);
            console.log(arrayOfObjects);
            const sendUpdatedData = () => {
                const serverOptions = {
                    uri: '{yourLocalHostOrDevelopmentServer}',
                    body: JSON.stringify(arrayOfObjects),
                    method: 'POST',
                    headers: {
                        'X-Request-Id': uuidv4(),
                        'Content-Type': 'application/json',
                        'Accept':'application/json',
                        'Authorization': 'Bearer ' + token,
                        'Enrollment-Id':'b99efbcf-090f-4ec7-a420-be3f709a471c',
                        'Source-Owner-Id':'14022b37-d996-4f57-90ca-3aa97b7cc42c',
                        'Data-Owner-Id':'{yourDataOwnerID}',
                        'Origin-Request-Id':'ea7314d7-85eb-4847-8c26-c15151e2b965',
                        'deliveredTimestamp': timestamp.utc("YYYY-MM-DD") +'T' + timestamp.utc("HH:mm:ss.ms") + 'Z',
                    }
                };
                request(serverOptions, function (error, response){
                    console.log(error, response.body);
                    return;
                });
            }
            sendUpdatedData();
        });
    }else {
        console.log('filename not provided');
    }
});

app.post("/updatePayload", (req, res) => {
    fs.writeFile('./payload.json', JSON.stringify(req.body, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    })
})

app.listen(5000, '127.0.0.1');

console.log("Node server running on port 3000");
