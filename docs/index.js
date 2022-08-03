const remSize=parseInt(getComputedStyle(document.documentElement).fontSize),gamePanel=document.getElementById("gamePanel"),playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),aaOuter=document.getElementById("aaOuter"),startButton=document.getElementById("startButton"),romaNode=document.getElementById("roma"),japanese=document.getElementById("japanese"),hint=document.getElementById("hint"),courseOption=document.getElementById("courseOption"),aa=document.getElementById("aa"),tmpCanvas=document.createElement("canvas"),mode=document.getElementById("mode"),gameTime=120;let playing,countdowning,typeTimer;const bgm=new Audio("mp3/bgm.mp3");bgm.volume=.1,bgm.loop=!0;let typeIndex=0,errorCount=0,normalCount=0,solveCount=0,problems=[],englishVoices=[],guide=!1,keyboardAudio,correctAudio,incorrectAudio,endAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext,audioContext=new AudioContext,layout104={default:["{esc} ` 1 2 3 4 5 6 7 8 9 0 - =","{tab} q w e r t y u i o p [ ] \\","{lock} a s d f g h j k l ; '","{shift} z x c v b n m , . /","🌏 {altLeft} {space} {altRight}"],shift:["{esc} ~ ! @ # $ % ^ & * ( ) _ +","{tab} Q W E R T Y U I O P { } |",'{lock} A S D F G H J K L : "',"{shift} Z X C V B N M < > ?","🌏 {altLeft} {space} {altRight}"]},layout109={default:["{esc} 1 2 3 4 5 6 7 8 9 0 - ^ \\","{tab} q w e r t y u i o p @ [","{lock} a s d f g h j k l ; : ]","{shift} z x c v b n m , . / \\","🌏 無変換 {space} 変換"],shift:["{esc} ! \" # $ % & ' ( ) = ~ |","{tab} Q W E R T Y U I O P ` {","{lock} A S D F G H J K L + * ]","{shift} Z X C V B N M < > ? _","🌏 無変換 {space} 変換"]},keyboardDisplay={"{esc}":"Esc","{tab}":"Tab","{lock}":"Caps","{shift}":"Shift","{space}":" ","{altLeft}":"Alt","{altRight}":"Alt","🌏":navigator.language=="ja"?"🇯🇵":"🇺🇸"},simpleKeyboard=new SimpleKeyboard.default({layout:navigator.language=="ja"?layout109:layout104,display:keyboardDisplay,onInit:()=>{document.getElementById("keyboard").classList.add("d-none")},onKeyPress:a=>{switch(a){case"{esc}":return typeEventKey("Escape");case"{space}":return typeEventKey(" ");case"無変換":case"{altLeft}":return typeEventKey("NonConvert");case"変換":case"{altRight}":return typeEventKey("Convert");case"🌏":simpleKeyboard.options.layout==layout109?(keyboardDisplay["🌏"]="🇺🇸",simpleKeyboard.setOptions({layout:layout104,display:keyboardDisplay})):(keyboardDisplay["🌏"]="🇯🇵",simpleKeyboard.setOptions({layout:layout109,display:keyboardDisplay}));break;case"{shift}":case"{lock}":{const a=simpleKeyboard.options.layoutName=="default"?"shift":"default";simpleKeyboard.setOptions({layoutName:a});break}default:return typeEventKey(a)}}});loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("bgm")!=1&&(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"))}function toggleBGM(){localStorage.getItem("bgm")==1?(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"),localStorage.setItem("bgm",0),bgm.pause()):(document.getElementById("bgmOn").classList.remove("d-none"),document.getElementById("bgmOff").classList.add("d-none"),localStorage.setItem("bgm",1),bgm.play())}function toggleKeyboard(){const a=document.getElementById("virtualKeyboardOn"),b=document.getElementById("virtualKeyboardOff");a.classList.contains("d-none")?(a.classList.remove("d-none"),b.classList.add("d-none"),document.getElementById("keyboard").classList.remove("d-none"),resizeFontSize(aa)):(a.classList.add("d-none"),b.classList.remove("d-none"),document.getElementById("keyboard").classList.add("d-none"),document.getElementById("guideSwitch").checked=!1,guide=!1,resizeFontSize(aa))}function toggleGuide(){this.checked?guide=!0:guide=!1}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function playAudio(c,b){const a=audioContext.createBufferSource();if(a.buffer=c,b){const c=audioContext.createGain();c.gain.value=b,c.connect(audioContext.destination),a.connect(c),a.start()}else a.connect(audioContext.destination),a.start()}function unlockAudio(){audioContext.resume()}function loadAudio(a){return fetch(a).then(a=>a.arrayBuffer()).then(a=>new Promise((b,c)=>{audioContext.decodeAudioData(a,a=>{b(a)},a=>{c(a)})}))}function loadAudios(){promises=[loadAudio("mp3/keyboard.mp3"),loadAudio("mp3/correct.mp3"),loadAudio("mp3/cat.mp3"),loadAudio("mp3/end.mp3")],Promise.all(promises).then(a=>{keyboardAudio=a[0],correctAudio=a[1],incorrectAudio=a[2],endAudio=a[3]})}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US")})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US";for(let b=0;b<c;b++)speechSynthesis.speak(a)}function loadProblems(){const a=courseOption.radio.value;fetch("data/"+a+".tsv").then(a=>a.text()).then(a=>{problems=a.trim().split("\n").map(a=>{const[b,c]=a.split("	"),d=c.split("|").slice(0,3).join("\n");return{en:b,ja:d}})}).catch(a=>{console.error(a)})}function typeNormal(a){a.style.visibility="visible",playAudio(keyboardAudio),a.style.color="silver",typeIndex+=1,normalCount+=1}function underlineSpace(a){a.textContent==" "&&a.style.removeProperty("text-decoration");const b=a.nextElementSibling;b&&b.textContent==" "&&(b.style.textDecoration="underline")}function nextProblem(){playAudio(correctAudio),typeIndex=0,solveCount+=1,typable()}function removeGuide(b){const c=b.previousSiblingElement;if(c){let a=c.textContent;a==" "&&(a="{space}");const b=simpleKeyboard.getButtonElement(a);b.classList.remove("bg-info")}let a=b.textContent;a==" "&&(a="{space}");const d=simpleKeyboard.getButtonElement(a);if(d)d.classList.remove("bg-info"),simpleKeyboard.setOptions({layoutName:"default"});else{const a=simpleKeyboard.getButtonElement("{shift}");a.classList.remove("bg-info")}}function showGuide(a){if(guide){let b=a.textContent;b==" "&&(b="{space}");const c=simpleKeyboard.getButtonElement(b);if(c)c.classList.add("bg-info");else{const a=simpleKeyboard.getButtonElement("{shift}");a.classList.add("bg-info")}}}function upKeyEvent(a){switch(a.key){case"Shift":case"CapsLock":guide&&(simpleKeyboard.setOptions({layoutName:"default"}),showGuide(romaNode.childNodes[typeIndex]))}}function patchEvent(a){return a.key=="@"&&a.code=="Digit2"?'"':a.key=="&"&&a.code=="Digit7"?"'":a.key}function typeEvent(a){switch(a.code){case"AltLeft":return typeEventKey("NonConvert");case"AltRight":return typeEventKey("Convert");case"Space":a.preventDefault();default:return typeEventKey(a.key)}}function typeEventKey(b){switch(b){case"NonConvert":[...romaNode.children].forEach(a=>{a.style.visibility="visible"}),downTime(5);return;case"Convert":{const a=romaNode.textContent;loopVoice(a,1);return}case"Shift":case"CapsLock":guide&&(simpleKeyboard.setOptions({layoutName:"shift"}),showGuide(romaNode.childNodes[typeIndex]));return;case"Escape":replay();return;case" ":if(!playing){replay();return}}const a=romaNode.childNodes[typeIndex];b.length==1&&(b==a.textContent?(typeNormal(a),removeGuide(a),underlineSpace(a)):(playAudio(incorrectAudio,.3),errorCount+=1),typeIndex==romaNode.childNodes.length?nextProblem():showGuide(romaNode.childNodes[typeIndex]))}function replay(){clearInterval(typeTimer),removeGuide(romaNode.childNodes[typeIndex]),initTime(),loadProblems(),countdown(),countPanel.classList.remove("d-none"),scorePanel.classList.add("d-none")}function resizeFontSize(a){function n(b,c){const a=tmpCanvas.getContext("2d");a.font=c;const d=a.measureText(b);return d.width}function i(g,c,d,e){const b=g.split("\n"),f=c+"px "+d;let a=0;for(let c=0;c<b.length;c++){const d=n(b[c],f);a<d&&(a=d)}return[a,c*b.length*e]}function m(a){const b=parseFloat(a.paddingLeft)+parseFloat(a.paddingRight),c=parseFloat(a.paddingTop)+parseFloat(a.paddingBottom);return[b,c]}const b=getComputedStyle(a),l=b.fontFamily,c=parseFloat(b.fontSize),o=parseFloat(b.lineHeight)/c,j=aaOuter.offsetHeight,k=infoPanel.clientWidth,h=[k,j],f=i(a.textContent,c,l,o),g=m(b),d=c*(h[0]-g[0])/f[0]*.9,e=c*(h[1]-g[1])/f[1]*.9;e<d?e<remSize?a.style.fontSize=remSize+"px":a.style.fontSize=e+"px":d<remSize?a.style.fontSize=remSize+"px":a.style.fontSize=d+"px"}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a))+a}function shuffle(a){for(let b=a.length-1;b>0;b--){const c=Math.floor(Math.random()*(b+1)),d=a[b];a[b]=a[c],a[c]=d}return a}function typable(){const b=problems[getRandomInt(0,problems.length)];japanese.textContent=b.ja;const a=b.en;if(mode.textContent=="NORMAL"){hint.classList.remove("d-none");const b=shuffle(a.replace(/[,.?]/,"").split(" "));hint.textContent="hint: "+b.join(" ")}else hint.classList.add("d-none");for(loopVoice(a,2);romaNode.firstChild;)romaNode.removeChild(romaNode.firstChild);for(let b=0;b<a.length;b++){const c=document.createElement("span");mode.textContent!="EASY"&&(c.style.visibility="hidden"),c.textContent=a[b],romaNode.appendChild(c)}showGuide(romaNode.childNodes[0])}function countdown(){if(countdowning)return;countdowning=!0,typeIndex=normalCount=errorCount=solveCount=0,document.getElementById("guideSwitch").disabled=!0,document.getElementById("virtualKeyboard").disabled=!0,gamePanel.classList.add("d-none"),countPanel.classList.remove("d-none"),counter.textContent=3;const a=setInterval(()=>{const b=document.getElementById("counter"),c=["skyblue","greenyellow","violet","tomato"];if(parseInt(b.textContent)>1){const a=parseInt(b.textContent)-1;b.style.backgroundColor=c[a],b.textContent=a}else countdowning=!1,playing=!0,clearInterval(a),document.getElementById("guideSwitch").disabled=!1,document.getElementById("virtualKeyboard").disabled=!1,gamePanel.classList.remove("d-none"),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),aaOuter.classList.remove("d-none"),scorePanel.classList.add("d-none"),resizeFontSize(aa),window.scrollTo({top:document.getElementById("timePanel").getBoundingClientRect().top+document.documentElement.scrollTop,behavior:"auto"}),typable(),startTypeTimer(),localStorage.getItem("bgm")==1&&bgm.play()},1e3)}function startTypeTimer(){const a=document.getElementById("time");typeTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(typeTimer),bgm.pause(),playAudio(endAudio),scoring())},1e3)}function downTime(c){const a=document.getElementById("time"),d=parseInt(a.textContent),b=d-c;b<0?a.textContent=0:a.textContent=b}function initTime(){document.getElementById("time").textContent=gameTime}function changeMode(){this.textContent=="EASY"?this.textContent="NORMAL":this.textContent=="NORMAL"?this.textContent="HARD":this.textContent="EASY"}courseOption.addEventListener("change",()=>{initTime(),clearInterval(typeTimer)});function scoring(){playing=!1,infoPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),aaOuter.classList.add("d-none"),countPanel.classList.add("d-none"),scorePanel.classList.remove("d-none");const b=courseOption.radio.value,a=(normalCount/gameTime).toFixed(2);document.getElementById("totalType").textContent=normalCount+errorCount,document.getElementById("typeSpeed").textContent=a,document.getElementById("errorType").textContent=errorCount,document.getElementById("twitter").href="https://twitter.com/intent/tweet?text=英文法タイピングの"+b+"をプレイしたよ! (速度: "+a+"回/秒) "+"&url=https%3a%2f%2fmarmooo.github.com/english-grammar-typing/%2f&hashtags=英文法タイピング"}resizeFontSize(aa),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("toggleBGM").onclick=toggleBGM,document.getElementById("virtualKeyboard").onclick=toggleKeyboard,window.addEventListener("resize",()=>{resizeFontSize(aa)}),mode.onclick=changeMode,startButton.addEventListener("click",replay),document.getElementById("guideSwitch").onchange=toggleGuide,document.addEventListener("keyup",upKeyEvent),document.addEventListener("keydown",typeEvent),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})