window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var audioFile, audioBuffer;

// Getting HTML elements.
var playButton = document.getElementById("play-file");
var loadingButton = document.getElementById("select-file");
var inputSlider = document.getElementById("input-slider");
var driveSlider = document.getElementById("drive-slider");
var toneSlider = document.getElementById("tone-slider");
var outputSlider = document.getElementById("output-slider");

// Creating gain nodes.
var inputGainNode = context.createGain();
inputGainNode.gain.value = parseInt(inputSlider.value)/100;

var driveNode = context.createGain();
driveNode.gain.value = parseInt(driveSlider.value)/100;

var outputGainNode = context.createGain();
outputGainNode.gain.value = parseInt(outputSlider.value)/100;

//Creating filter nodes.
var hpfNode = context.createBiquadFilter();
hpfNode.type = "highpass";
hpfNode.frequency.value = 200;

var lpfNode = context.createBiquadFilter();
lpfNode.type = "lowpass";
lpfNode.frequency.value = parseFloat(toneSlider.value);

//Creating distortion transfer function.
var waveshape = context.createWaveShaper();
var waveShaperCurve = new Float32Array(1024);
for (var n = 0; n<waveShaperCurve.length; n++){
    waveShaperCurve[n] = (n/1025-0.5)*2
    if (waveShaperCurve[n] >= 1){
        waveShaperCurve[n] = 2/3;
    }
    else if (waveShaperCurve[n] <= -1){
        waveShaperCurve[n] = -2/3;
    }
    else{
        waveShaperCurve[n] = waveShaperCurve[n] - Math.pow(waveShaperCurve[n],3)/3;
    }
}
waveshape.curve = waveShaperCurve;

// Button functions...
function readFile(file) {
    var reader = new FileReader();    
    reader.onload = function() {        
        context.decodeAudioData(reader.result, function(buffer) { 
            audioBuffer = buffer;
            console.log("audio loaded!");
        });
    }    
    reader.readAsArrayBuffer(file);
}

function playSound(buffer) {    
    var source = context.createBufferSource();     
    source.buffer = buffer;
    source.connect(inputGainNode);
    
    inputGainNode.connect(lpfNode);
    
    inputGainNode.connect(driveNode);
    driveNode.connect(hpfNode);
    hpfNode.connect(waveshape);    
    waveshape.connect(lpfNode);
    
    lpfNode.connect(outputGainNode);
    outputGainNode.connect(context.destination);
    
    source.start(0);

}


// Event listeners...
loadingButton.addEventListener("change", function($event) { 
    if($event.target.files.length) {        
        readFile($event.target.files[0]);
    } else {
        alert("No files selected");
    }
});

playButton.addEventListener("click", function() {
    if(audioBuffer != null) {
        playSound(audioBuffer);
    } else {
        alert("Load some audio first!");
    }
});

inputSlider.addEventListener("input", function() {
    inputGainNode.gain.value = parseInt(inputSlider.value)/100; 
});

driveSlider.addEventListener("input", function() {
    driveNode.gain.value = parseInt(driveSlider.value)/100; 
});

toneSlider.addEventListener("input", function() {
    lpfNode.frequency.value = parseFloat(toneSlider.value);
});

outputSlider.addEventListener("input", function() {
    outputGainNode.gain.value = parseInt(outputSlider.value)/100; 
});


