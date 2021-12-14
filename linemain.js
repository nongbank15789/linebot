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
    if (event.type !== 'message' || event.message.type !== 'text' ) return null;
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
        "hero": {
          "type": "image",
          "url": pt,
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover",
          "action": {
            "type": "uri",
            "label": "Action",
            "uri": "https://linecorp.com"
          }
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "action": {
            "type": "uri",
            "label": "Action",
            "uri": "https://linecorp.com"
          },
          "contents": [
            {
              "type": "text",
              "text": cmd,
              "weight": "bold",
              "size": "xl",
              "contents": []
            },
            {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": x,
                      "weight": "bold",
                      "margin": "sm",
                      "contents": []
                    },
                    {
                      "type": "text",
                      "text": "บาท",
                      "size": "sm",
                      "color": "#AAAAAA",
                      "align": "end",
                      "contents": []
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": y,
                      "weight": "bold",
                      "flex": 0,
                      "margin": "sm",
                      "contents": []
                    },
                    {
                      "type": "text",
                      "text": "ชิ้น",
                      "size": "sm",
                      "color": "#AAAAAA",
                      "align": "end",
                      "contents": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "spacer",
              "size": "xs"
            }
          ]
        }
      }
        }
var name=1
    if(name < 7 ){
      name++
    }else if(name==7){
      name=1
    }stop;
  let checkstock = {
    "type": "text",
    "text": getRows.data.values[name][0],
    "weight": "bold",
    "size": "xl",
    "flex": 0,
  }


        if (cmd == "stock") {
          return client.replyMessage(event.replyToken, checkstock)
      }

        

        if(z!=true){
            var msg = {"type": "text", "text": "ไม่พบคำสั่งหรือสินค้า โปรดพิมพ์ $$ตามด้วยชื่อสินค้า เช่น $$เมาส์"}
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