//入力バー
const value = document.querySelector("#angle_value");
const input = document.querySelector("#angleInput");
value.textContent = `${localStorage.angle_value}°`;
input.addEventListener("input", (event) => {
  setTimeout(()=>{
    value.textContent = `${localStorage.angle_value}°`;
  },200)
  localStorage.angle_value = event.target.value;
});
if(localStorage.angle_value){
  input.value = Number(localStorage.angle_value);
  value.textContent = ` ${localStorage.angle_value}°`;
}

const cameraSize = { w: 360, h: 240 };
const canvasSize = { w: 360, h: 500 };
const resolution = { w: 1080, h: 720 };
let video;
let media;
let canvas;
let canvasCtx;

// video要素をつくる
video          = document.getElementById('video');
video.width    = cameraSize.w;
video.height   = cameraSize.h;

// video要素にWebカメラの映像を表示させる
media = navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    width: { ideal: resolution.w },
    height: { ideal: resolution.h },
    facingMode: "environment"
  }
}).then(function(stream) {
  video.srcObject = stream;
});

// canvas要素をつくる
canvas        = document.createElement('canvas');
canvas.id     = 'canvas';
document.getElementById('resultDisplay').appendChild(canvas);

// コンテキストを取得する
canvasCtx = canvas.getContext('2d');

// video要素の映像をcanvasに描画する

let flag_canvasInitialized = false;
canvasUpdate();
function canvasUpdate() {
  if(!flag_canvasInitialized && video.videoWidth>0 && video.videoHeight>0){
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    flag_canvasInitialized = true;
  }
  canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  rotateColor();
  requestAnimationFrame(canvasUpdate);
};
function rotateColor(){
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const pixel = imageData.data;
  const angle = document.getElementById("angleInput").value;
  const N = [1,1,1].map((x)=>x/Math.sqrt(3));
  for (let i = 0; i < pixel.length; i += 4) {
    const afterColorRGB = Rodrigues(N, [pixel[i], pixel[i+1], pixel[i+2]], Math.PI*angle/180);
    pixel[i] = afterColorRGB[0];
    pixel[i + 1] = afterColorRGB[1];
    pixel[i + 2] = afterColorRGB[2];
  }
  imageData.data.set(pixel);
  canvasCtx.putImageData(imageData, 0, 0);
}

function VcrossW(V,W){
  return [V[1]*W[2] - V[2]*W[1], V[2]*W[0] - V[0]*W[2], V[0]*W[1] - V[1]*W[0]];
}
function VdotW(V,W){
  return V[0]*W[0] + V[1]*W[1] + V[2]*W[2];
}
function Rodrigues(N, R, T){
  return R.map((x,i)=>(R[i]*Math.cos(T) + (1-Math.cos(T))*VdotW(R,N)*N[i] + VcrossW(N,R)[i]*Math.sin(T)))
}