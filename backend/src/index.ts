
import express from "express"
import { createClient } from "redis";

let client = createClient();
client.connect();

const app = express();

app.use(express.json());



app.post("/submission", (req, res)=>{
    const userId = req.body.userId;
    const quesId = req.body.userId;
    const code = req.body.code;
    const lang = req.body.lang;

    client.lPush("problems", JSON.stringify({userId, quesId, code, lang}));

    res.json({
        message: "processing",
    })
})


app.listen(3000);