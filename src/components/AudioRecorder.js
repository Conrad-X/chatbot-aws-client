import React, { useCallback, useEffect, useState, useRef } from "react";
import { useCheetah } from "@picovoice/cheetah-react";
import cheetahModel from "../lib/cheetahModel";
import { createBlobUrl } from "../util/UtilityFunctions";
import { FaMicrophone, FaMicrophoneAltSlash, FaMicrophoneAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import { Button, Typography } from "@mui/material";
import axios from 'axios'
import Header from "./Header";
import BackgroundImage from '../images/bg1.png';
import '../App.css'

let isDone = false

export default function VoiceWidget() {
  const accessKey = process.env.REACT_APP_CHEETAH_ACCESS_KEY
  const serverUrl = process.env.REACT_APP_SERVER_URL

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

  const toggleRecord = async (e) => {
    // e.preventDefault()
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
      const requestData = { text: data };
      const res = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
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
    <div className="voice-widget" style={{ background: `url(${BackgroundImage})`, backgroundRepeat: 'no-repeat', width: '100%', height: '100%' }}>
      <Header />
      {!isLoaded ? (
        <div style={{ padding: '23%' }}>
          <Button size="large" style={{ fontWeight: 'bolder', fontSize: '25px' }} variant="contained" onClick={initEngine} > 
            {isBusy ? "Connecting..." : "Get Started"}
          </Button>
        </div>
      ) : (
          <div style={{ padding: '15%', backgroundColor: "black" }}> 
            <Typography fontWeight="bolder" variant="h4" mb={3} fontFamily={'sans-serif'} color={'white'} noWrap component="div" sx={{ flexGrow: 1 }}>
              { isListening ? "Recording..." : "Start Recording" }
            </Typography>          
            <IconContext.Provider value={{ color: isListening ? "red" : "blue", className: "microphone", size: "200px", }}>
              <FaMicrophone onClick={toggleRecord}/>
            </IconContext.Provider>
            <div style={{ marginTop: '30px' }}>
              <Button color="error" variant="contained" onClick={release} disabled={!isLoaded || isBusy}>Release</Button>
            </div>
            <Typography fontWeight="bolder" variant="h6" mt={5} fontFamily={'sans-serif'} color={'white'} noWrap component="div" sx={{ flexGrow: 1 }}>
              Transcript: {transcript}
            </Typography>
            {/* <p className="transcript">{transcript}</p> */}
          </div>
      )}
    </div>
  );
}
