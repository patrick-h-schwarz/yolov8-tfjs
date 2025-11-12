/**
 * Class to handle webcam
 */
export class Webcam {
  /**
   * Open webcam and stream it through video tag.
   * @param {HTMLVideoElement} videoRef video tag reference
   */
  open = (videoRef) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
          },
        })
        .then((stream) => {
          videoRef.srcObject = stream;
        });
    } else alert("Can't open Webcam!");
  };
  
  async getDevices(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error('MediaDevices api not supported!');
        return Promise.resolve(undefined);
    }
    let devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(i=>i.kind === "videoinput")
  }
  setDevice(videoRef, deviceId){
    const constraints = {
      audio: {deviceId:  undefined},
      video: {deviceId: deviceId}
    };
    navigator.mediaDevices.getUserMedia(constraints).
      then(stream =>videoRef.srcObject = stream)
  }

  /**
   * Close opened webcam.
   * @param {HTMLVideoElement} videoRef video tag reference
   */
  close = (videoRef) => {
    if (videoRef.srcObject) {
      videoRef.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.srcObject = null;
    } else alert("Please open Webcam first!");
  };
}
