
import { createClient } from "redis";
import { spawn } from "child_process";
import fs from "fs"
import { prisma } from "./db";

const client = createClient();

client.connect().then(async ()=>{
    while(1){
        const res = await client.rPop("problems");

        if (!res){
            await new Promise((r)=> setTimeout(r, 1000));
            continue;
        }

        let finalOutput = "";

        const parsedRes = JSON.parse(res);
        const code = parsedRes.code;
        const language = parsedRes.language;
        const submissionId = parsedRes.submissionId;

        console.log("processing ques for submissionId: ", parsedRes.submissionId);
        if (language == "c++"){
            const filePath = __dirname + "/code/a.cpp";
            console.log("running c++ code");
            fs.writeFileSync(filePath, code);

            const responseCompiler = spawn("g++", [filePath, "-o" , "./code/a.cpp"]);
            let compilerExitCode = null;
            await new Promise<void> ((resolve) => {
                responseCompiler.on("exit", async (exitCode) =>{
                    compilerExitCode = exitCode;
                    if(exitCode != 0){
                        await prisma.submission.update({
                            where: {
                                id: submissionId,
                            },
                            data: {
                                status: "Failure"
                            }
                        })
                    }
                    resolve();
                })
            })

            if(compilerExitCode != 0){
                continue;
            }

            const response = spawn("./out/a.cpp");
            response.stdout.on("data", (chunk) => {
                finalOutput += chunk;
            })

            await new Promise<void> ((resolve) => {
                response.on("exit", async (exitCode) => {
                    if(exitCode == 0){
                        await prisma.submission.update({
                            where: {
                                id: submissionId,
                            },
                            data: {
                                output: finalOutput,
                                status: "Success"
                            }
                        })
                    } else {
                        await prisma.submission.update({
                            where: {
                                id: submissionId,
                            },
                            data: {
                                status: "Failure"
                            }
                        })
                    }
                    resolve();
                })
            })
        }

        if (language == "js"){
            const filePath = __dirname + "/code/a.js";
            console.log("running js code")
            fs.writeFileSync(filePath, code);

            const response = spawn("node", [filePath]);
            response.stdout.on("data", (chunk) =>{
                finalOutput += chunk.toString();
            })
            await new Promise<void>((resolve) => {
                response.on("exit", async (exitCode) =>{
                    if(exitCode == 0){
                        await prisma.submission.update({
                            where: {
                                id: submissionId
                            },
                            data : {
                                status: "Success",
                                output: finalOutput,
                            }
                        })
                    } else{
                        await prisma.submission.update({
                            where: {
                                id: submissionId,
                            },
                            data: {
                                status: "Failure",
                            }
                        })
                    }
                    resolve();
                })
            })
            
        }


        if (language == "py"){
            const filePath = __dirname + "/code/a.py";
            console.log("running python code code")
            fs.writeFileSync(filePath, code);

            const response = spawn("python", [filePath]);
            response.stdout.on("data", (chunk) =>{
                finalOutput += chunk.toString();
            })
            await new Promise<void>((resolve) => {
                response.on("exit", async (exitCode) =>{
                    if(exitCode == 0){
                        await prisma.submission.update({
                            where: {
                                id: submissionId
                            },
                            data : {
                                status: "Success",
                                output: finalOutput,
                            }
                        })
                    } else{
                        await prisma.submission.update({
                            where: {
                                id: submissionId,
                            },
                            data: {
                                status: "Failure",
                            }
                        })
                    }
                    resolve();
                })
            })
            
        }

        console.log("output : " , finalOutput);

        // update the status in db
    }
})