
import { createClient } from "redis";

const client = createClient();

client.connect().then(async ()=>{
    while(1){
        const res = await client.rPop("problems");

        if (!res){
            await new Promise((r)=> setTimeout(r, 1000));
            continue;
        }

        const parsedRes = JSON.parse(res);
        const code = parsedRes.code;
        const lang = parsedRes.lang;
        console.log("processing ques for User Id: ", parsedRes.userId);
        if (lang == "c++"){
            console.log("running c++ code");
            await new Promise((r) => setTimeout(r, 10000));
        }

        if (lang == "js"){
            console.log("running js code")
            await new Promise((r) => setTimeout(r, 10000));
        }

        // update the status in db
    }
})