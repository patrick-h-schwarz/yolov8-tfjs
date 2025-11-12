import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect, detectVideo } from "./utils/detect";
import "./style/App.css";
import { Webcam } from "./utils/webcam";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3]
  }); // init model & input shape
  const webcam = new Webcam(); // webcam handler
  const [detections, setDetections] = useState(0)
  const [detectionStart,setDetectionStart] = useState(undefined)
  const [devices,setDevices] = useState(undefined)
  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // model configs
  const modelName = "yolov8n";
  function onPlay(){
    setDetections(0)
    setDetectionStart(new Date());
    detectVideo(cameraRef.current, model, canvasRef.current, () => setDetections(function (d) {return (d += 1);}));
  }
  useEffect(() => {
    webcam.getDevices().then(devices=>setDevices(devices));
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>}
      <div className="header">
        <h1>📷 YOLOv8 Live Detection App</h1>
        <p>
          YOLOv8 live detection application on browser powered by <code>tensorflow.js</code>
        </p>
        <p>
          Serving : <code className="code">{modelName}</code>
        </p>
        <p>
          Detections : {detections}
          Time : {detectionStart == undefined ? 0 : (new Date().getTime() - detectionStart.getTime()) / 1000}
          Per Second :{(detections /  (detectionStart == undefined ? 1 : Math.max((new Date().getTime() - detectionStart.getTime()) / 1000, 1))).toFixed(2)}
        </p>
        
        { devices !== undefined && devices.length > 0 &&
          <select onChange={(event) => webcam.setDevice(cameraRef.current, event.target.value)}>
              <option value={undefined} >None</option>
            {devices.filter(device=> device.label !== "").map(device => 
              <option value={device.label} >{device.label}</option>
            )}
          </select>
        }
      </div>
      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detect(imageRef.current, model, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={onPlay}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, canvasRef.current)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>

      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} webcam={webcam} />
    </div>
  );
};

export default App;
