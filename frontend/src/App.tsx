
import { useRef, useState } from "react";
import { Topbar } from "./components/topbar";
import { Button } from "./components/ui/button";
import "./index.css";
import axios from "axios";
import { Divide } from "lucide-react";

const BACKEND_URL = "http://localhost:3000"

export function App() {

  const [code, setCode] = useState("");
  const [response, setResponse] =  useState({});
  const [pollResponse, setPollResponse] = useState({});
  const [language, setLanguage] = useState("js")

  async function runCode(){
  try {
    const res = await axios.post(`${BACKEND_URL}/submission`, {
      code,
      language: language
    });

    const submissionId = res.data.submissionId;
    setResponse(res.data.submission);

    while (true) {
      const pollRes = await axios.get(`${BACKEND_URL}/submission/${submissionId}`);
      const submissionStatus = pollRes.data.submission?.status ?? pollRes.data.status;
      const submissionData = pollRes.data.submission ?? pollRes.data;

      if (submissionStatus !== "Processing") {
        setPollResponse(submissionData);
        break;
      }

      await new Promise((r) => setTimeout(r, 5000));
    }
  } catch (err) {
    console.error("runCode failed:", err);
    setPollResponse({ status: "Error", output: "Request failed." });
  }
}

  return (
    <div>
      <div className="sticky w-full h-16 bg-transparent pt-3">
            <div className="flex justify-between px-3 text-2xl">
                <div className="flex">
                    <div className="mx-2">
                      <Button onClick={() => setLanguage("c++")} className="hover:cursor-pointer">Cpp</Button>
                    </div>
                    <div className="mx-2">
                      <Button onClick={() => setLanguage("py")} className="hover:cursor-pointer">Python</Button>
                    </div>
                    <div className="mx-2">
                      <Button onClick={() => setLanguage("js")} className="hover:cursor-pointer">Javascript</Button>
                    </div>
                </div>
                <div>
                    <Button onClick={() => runCode()}>Run Code</Button>
                </div>
            </div>
      </div>
      <div className="flex justify-between h-screen w-screen">
          <div className="h-screen w-screen text-center bg-red-50 p-2">
              <textarea onChange={(e) => setCode(e.target.value)} className="border-black border-2 h-full w-full"></textarea>
          </div>
          <div className="h-screen w-screen text-center bg-green-50 p-2">
              <div className=" text-center bg-green-50 p-2">
                {pollResponse.status && (
                  <p className="font-semibold mb-2">Status: {pollResponse.status}</p>
                )}
                <pre className="text-left whitespace-pre-wrap">
                  {pollResponse.output}
                </pre>
              </div>
          </div>
      </div>
    </div>
  )
}

export default App;
