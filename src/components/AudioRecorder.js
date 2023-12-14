import React, { useCallback, useEffect, useState, useRef } from "react";
import { useCheetah } from "@picovoice/cheetah-react";
import cheetahModel from "../lib/cheetahModel";
import { createBlobUrl } from "../util/UtilityFunctions";
import { FaMicrophone, FaMicrophoneAltSlash, FaMicrophoneAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import { Button } from "@mui/material";
// require('dotenv').config()

let isDone = false

export default function VoiceWidget() {
  const accessKey = "4I5RhbaRB7sy1VlFAqBR+v6yx2CyK8mYQpHRihd71gwcGrsl6riVIg=="
  console.log(accessKey)

  const [play, setPlay] = useState(false)
  const [chunks, setChunks] = useState([])
  const [index, setIndex] = useState(0)  
  const [isBusy, setIsBusy] = useState(false);
  const [transcript, setTranscript] = useState("");

  const { result, isLoaded, isListening, error, init, start, stop, release } =
    useCheetah();

  const reset = () => {
    setPlay(false)
    setChunks([])
    setIndex(0)
    isDone = false
  }

  async function readAllChunks(readableStream) {
    const reader = readableStream.getReader();
    
    let done, value, count = 0
    while (!done) {
      ({ value, done } = await reader.read());
      if (!done) {
        const audio = new Audio()
        audio.src = createBlobUrl(value)

        setChunks(chunks => [...chunks ,audio])
        if (count === 0) {
            setPlay(true)
            audio.play()
            audio.addEventListener('ended', (() => { setPlay(false) }))
            setIndex(1)
        }
        count = 1
      }   
    }
  }

  const toggleRecord = async () => {
    setIsBusy(true);
    if (isListening) {
      await stop();
    } else {
      setTranscript("");
      reset()
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
      isDone = true
      const res = await fetch(`https://fast-server-api-53bf38087fa1.herokuapp.com/processText/?text=${data}`, {
          method: 'post',
        }
      )
      readAllChunks(res.body)
    }
  }

  useEffect(() => {
    if (result !== null) {
      setTranscript((prev) => {
        let newTranscript = prev + result.transcript;

        if (result.isComplete) {
          newTranscript += "\n";
          processAudio(newTranscript)
          stop();
        }

        return newTranscript;
      });
    }
  }, [result]);

  useEffect(() => {
    if (!play && index < chunks.length) {
        setPlay(true)
        chunks[index].play()
        chunks[index].addEventListener('ended', (() => { setPlay(false) }))
        setIndex(index + 1)
    }
  }, [play, chunks])

  return (
    <div className="voice-widget">
      <h1>Voice Chat Bot</h1>
      <IconContext.Provider value={{ color: "grey", className: "global-class-name", style: { marginTop: '100px'}, size: "200px", }}>
        {!isLoaded && <FaMicrophoneAltSlash onClick={initEngine}/>}
        {isLoaded && !isBusy && !isListening && <FaMicrophone onClick={toggleRecord}/>}
        {isLoaded && !isBusy && isListening && <FaMicrophoneAlt onClick={() => console.log("click")}/>}
      </IconContext.Provider>
      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" onClick={release} disabled={!isLoaded || isBusy}>Release</Button>
      </div>
      <h3 style={{ marginTop: '50px' }}>Transcript:</h3>
      <p className="transcript">{transcript}</p>
    </div>
  );
}
