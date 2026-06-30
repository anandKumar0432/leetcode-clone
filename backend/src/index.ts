
import express from "express"
import { createClient } from "redis";
import { prisma } from "./db";
import cors from "cors"

let client = createClient();
client.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/submission", async (req, res)=>{
    const code = req.body.code;
    const language = req.body.language;

    try{
        const submission = await prisma.submission.create({
            data: {
                code,
                language,
                status: "Processing"
            }
        })

        const submissionId = submission.id
        client.lPush("problems", JSON.stringify({submissionId, code, language}));

        res.json({
            submissionId: submission.id,
            status: submission.status
        })
    }catch(e){
        res.json({
            msg: "Something went wrong!!!"
        })
    }
})

app.get("/submission/:submissionId", async (req, res) =>{
    const submissionId = req.params.submissionId;

    try{
        const submission = await prisma.submission.findFirst({
            where: {
                id : submissionId
            }
        })

        res.json({
            submission
        })
    } catch (e){
        res.json({
            msg: "something went wrong!!!"
        })
    }
})


app.listen(3000);