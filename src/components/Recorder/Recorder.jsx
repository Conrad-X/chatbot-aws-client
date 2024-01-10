import React, { useCallback, useEffect, useState } from "react";
import { useCheetah } from "@picovoice/cheetah-react";
import cheetahModel from "../../lib/cheetahModel";
import { createBlobUrl } from "../../util/UtilityFunctions";
import { Button } from "@mui/material";
import Header from "../Header/Header";
import "./Recorder.css";
import "../../App.css";

let isDone = false;
let startTime, endTime = null

export default function VoiceWidget() {
  const accessKey = process.env.REACT_APP_CHEETAH_ACCESS_KEY;
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const [play, setPlay] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [index, setIndex] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [transcript, setTranscript] = useState("");


  const { result, isLoaded, isListening, init, start, stop, release } = useCheetah();

  const reset = () => {
    setPlay(false);
    setChunks([]);
    setIndex(0);
    isDone = false;
  };

  async function readAllChunks(readableStream) {
    const reader = readableStream.getReader();
    let done,
      value,
      count = 0;

    while (!done) {
      ({ value, done } = await reader.read());
      if (!done) {
        const audio = new Audio();
        audio.src = createBlobUrl(value);

        setChunks((chunks) => [...chunks, audio]);
        if (count === 0) {
          setPlay(true);
          audio.play();
          audio.addEventListener("ended", () => {
            setPlay(false);
          });
          setIndex(1);
        }
        count = 1;
      }
    }
  }

  const toggleRecord = async (e) => {
    setIsBusy(true);
    if (isListening) {
      await stop();
    } else {
      setTranscript("");
      reset();
      startTime = new Date().getMilliseconds();
      await start();
    }
    setIsBusy(false);
  };

  const initEngine = useCallback(async () => {
    setIsBusy(true);
    await init(accessKey, cheetahModel, {
      enableAutomaticPunctuation: true,
    });
    setIsBusy(false);
  }, [init]);

  const processAudio = async (data) => {
    if (!isDone) {
      isDone = true;
      const requestData = { text: data };
      const res = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      readAllChunks(res.body);
    }
  };

  const getFormattedTranscribedData = (data, time) => {
    return `<i>${data}</i>&nbsp;<b>${time} sec</b> <br/>`;
  }

  useEffect(() => {
    if (result?.transcript) {
      setTranscript((prev) => {
        endTime = new Date().getMilliseconds();
        let newTranscript = prev + getFormattedTranscribedData(result.transcript, (endTime-startTime)/1000);

        if (result.isComplete) {
          newTranscript += "\n";
          processAudio(newTranscript);
          stop();
        }

        return newTranscript;
      });
    }
  }, [result]);

  useEffect(() => {
    if (!play && index < chunks.length) {
      setPlay(true);
      chunks[index].play();
      chunks[index].addEventListener("ended", () => {
        setPlay(false);
      });
      setIndex(index + 1);
    }
  }, [play, chunks]);

  return (
    <div className="voice-widget" style={{ width: "100%", height: "100vh" }}>
      <Header />
      {!isLoaded ? (
        <div style={{ marginTop: "32vh" }}>
          <div className="status-button" onClick={initEngine}>
            {isBusy ? "Connecting ..." : "Connect"}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "25vh" }}>
          <div className="microphone-container">
            <span 
              className="material-symbols-outlined mic-on" 
              onClick={toggleRecord}
              style={{color: isListening ? "white" : "gray", backgroundColor: isListening ? "#2D9596": "#e0e0e0"}}
              > 
              {isListening ? "mic" : "mic_off"} 
            </span>
          </div>
          
          <div className="end-connection-button">
            <div className="end-button">
              <span 
                className="material-symbols-outlined" 
                onClick={release}
                > 
                close
              </span>
            </div>
          </div>

          {
            transcript ? <div className="response" dangerouslySetInnerHTML={{ __html: transcript }}></div> : 
            <div className="response">
              {isListening ? "Processing..." : "No Transcription Available"}
            </div>
          }
        </div>
      )}
    </div>
  );
}
