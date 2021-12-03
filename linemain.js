const { google } = require("googleapis");
const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');

const env = dotenv.config().parsed
const app = express()

const lineConfig = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN,
    channelSecret: env.CHANNEL_SECRET
}

const client = new line.Client(lineConfig);

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
});
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events
        console.log('event', events)
        return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK")
    } catch (e) {
        res.status(500).end()
    }
});

let p = "$$"
const handleEvent = async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text' || !event.message.text.startsWith(p)) return null;
    else {
        const authclient = await auth.getClient();
        const googleSheets = google.sheets({version: "v4", auth: authclient });
        const spreadsheetId = "1LElQCBlh9v37dUnwzqCaa9fKdd1rtxYsXGHAskfPq6w";
        const getRows = await googleSheets.spreadsheets.values.get({auth, spreadsheetId, range: "stock1"});

        
        const args = event.message.text.trim().split(/ +/g);
        const cmd = args[0].slice(p.length).toLowerCase();    
        let x, y,pt //x=คำในตาราง y=จำนวน pt=รูป
        let z = true;//เช็คว่ามีในตารางรึป่าว

        //console.log(getRows.data.values[1][0]);
        for (var i=0;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] != cmd) {
                z=false; 
            }
        }

        for (var i=0;i<getRows.data.values.length; i++){
            if(getRows.data.values[i][0] == cmd) {
                z=true;
                
                x = getRows.data.values[i][1]
                y = getRows.data.values[i][2] 
                pt = getRows.data.values[i][3]
               

            }
        }

      var msg = {"type": "flex",
      "altText": "this is a flex message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": cmd,
              "align": "center",
              "contents": []
            }
          ]
        },
        "hero": {
          "type": "image",
          "url": pt,
          "size": "full",
          "aspectRatio": "1.51:1",
          "aspectMode": "fit"
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": x,
              "align": "center",
              "contents": []
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": y,
              "align": "center",
              "contents": []
            }
          ]
        },
        
      }
        }

        

        if(z!=true){
            var msg = {"type": "text", "text": "ไม่พบข้อมูลนะ ตัวตึง"}
            return client.replyMessage(event.replyToken, msg)
        }
            return client.replyMessage(event.replyToken, msg)
    }
  }

  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(PORT);
   console.log(`listening on Port ${PORT}`);
});