const remSize=parseInt(getComputedStyle(document.documentElement).fontSize),gamePanel=document.getElementById("gamePanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),startButton=document.getElementById("startButton"),romaNode=document.getElementById("roma"),japanese=document.getElementById("japanese"),hint=document.getElementById("hint"),courseOption=document.getElementById("courseOption"),aa=document.getElementById("aa"),tmpCanvas=document.createElement("canvas"),mode=document.getElementById("mode"),gameTime=120;let playing,countdowning,typeTimer;const bgm=new Audio("mp3/bgm.mp3");bgm.volume=.1,bgm.loop=!0;let typeIndex=0,errorCount=0,normalCount=0,solveCount=0,problems=[],guide=!1;const layout104={default:["{esc} ` 1 2 3 4 5 6 7 8 9 0 - =","{tab} q w e r t y u i o p [ ] \\","{lock} a s d f g h j k l ; '","{shift} z x c v b n m , . /","🌏 {altLeft} {space} {altRight}"],shift:["{esc} ~ ! @ # $ % ^ & * ( ) _ +","{tab} Q W E R T Y U I O P { } |",'{lock} A S D F G H J K L : "',"{shift} Z X C V B N M < > ?","🌏 {altLeft} {space} {altRight}"]},layout109={default:["{esc} 1 2 3 4 5 6 7 8 9 0 - ^ \\","{tab} q w e r t y u i o p @ [","{lock} a s d f g h j k l ; : ]","{shift} z x c v b n m , . / \\","🌏 無変換 {space} 変換"],shift:[`{esc} ! " # $ % & ' ( ) = ~ |`,"{tab} Q W E R T Y U I O P ` {","{lock} A S D F G H J K L + * ]","{shift} Z X C V B N M < > ? _","🌏 無変換 {space} 変換"]},keyboardDisplay={"{esc}":"Esc","{tab}":"Tab","{lock}":"Caps","{shift}":"Shift","{space}":" ","{altLeft}":"Alt","{altRight}":"Alt","🌏":navigator.language.startsWith("ja")?"🇯🇵":"🇺🇸"},simpleKeyboard=new SimpleKeyboard.default({layout:navigator.language.startsWith("ja")?layout109:layout104,display:keyboardDisplay,onInit:()=>{document.getElementById("keyboard").classList.add("d-none")},onKeyPress:e=>{switch(e){case"{esc}":return typeEventKey("Escape");case"{space}":return typeEventKey(" ");case"無変換":case"{altLeft}":return typeEventKey("NonConvert");case"変換":case"{altRight}":return typeEventKey("Convert");case"🌏":simpleKeyboard.options.layout==layout109?(keyboardDisplay["🌏"]="🇺🇸",simpleKeyboard.setOptions({layout:layout104,display:keyboardDisplay})):(keyboardDisplay["🌏"]="🇯🇵",simpleKeyboard.setOptions({layout:layout109,display:keyboardDisplay}));break;case"{shift}":case"{lock}":{const e=simpleKeyboard.options.layoutName=="default"?"shift":"default";simpleKeyboard.setOptions({layoutName:e});break}default:return typeEventKey(e)}}}),audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("keyboard","mp3/keyboard.mp3"),loadAudio("correct","mp3/correct.mp3"),loadAudio("incorrect","mp3/cat.mp3");let englishVoices=[];loadVoices(),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark"),localStorage.getItem("bgm")!=1&&(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"))}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}function toggleBGM(){localStorage.getItem("bgm")==1?(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"),localStorage.setItem("bgm",0),bgm.pause()):(document.getElementById("bgmOn").classList.remove("d-none"),document.getElementById("bgmOff").classList.add("d-none"),localStorage.setItem("bgm",1),bgm.play())}function toggleKeyboard(){const e=document.getElementById("virtualKeyboardOn"),t=document.getElementById("virtualKeyboardOff");e.classList.contains("d-none")?(e.classList.remove("d-none"),t.classList.add("d-none"),document.getElementById("keyboard").classList.remove("d-none"),resizeFontSize(aa)):(e.classList.add("d-none"),t.classList.remove("d-none"),document.getElementById("keyboard").classList.add("d-none"),document.getElementById("guideSwitch").checked=!1,guide=!1,resizeFontSize(aa))}function toggleGuide(e){e.target.checked?guide=!0:guide=!1}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),t=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];e.then(e=>{englishVoices=e.filter(e=>e.lang=="en-US").filter(e=>!t.includes(e.voiceURI))})}function loopVoice(e,t){speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e);n.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],n.lang="en-US";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function loadProblems(){const e=courseOption.radio.value;fetch("data/"+e+".tsv").then(e=>e.text()).then(e=>{problems=e.trim().split(`
`).map(e=>{const[t,n]=e.split("	"),s=n.split("|").slice(0,3).join(`
`);return{en:t,ja:s}})}).catch(e=>{console.error(e)})}function typeNormal(e){e.style.visibility="visible",playAudio("keyboard"),e.classList.add("typed"),typeIndex+=1,normalCount+=1}function underlineSpace(e){e.textContent==" "&&e.style.removeProperty("text-decoration");const t=e.nextElementSibling;t&&t.textContent==" "&&(t.style.textDecoration="underline")}function nextProblem(){playAudio("correct",.3),typeIndex=0,solveCount+=1,typable()}function removeGuide(e){const n=e.previousSiblingElement;if(n){let e=n.textContent;e==" "&&(e="{space}");const t=simpleKeyboard.getButtonElement(e);t.classList.remove("guide")}let t=e.textContent;t==" "&&(t="{space}");const s=simpleKeyboard.getButtonElement(t);if(s)s.classList.remove("guide"),simpleKeyboard.setOptions({layoutName:"default"});else{const e=simpleKeyboard.getButtonElement("{shift}");e&&e.classList.remove("guide")}}function showGuide(e){if(guide){let t=e.textContent;t==" "&&(t="{space}");const n=simpleKeyboard.getButtonElement(t);if(n)n.classList.add("guide");else{const e=simpleKeyboard.getButtonElement("{shift}");e&&e.classList.add("guide")}}}function upKeyEvent(e){switch(e.key){case"Shift":case"CapsLock":guide&&(simpleKeyboard.setOptions({layoutName:"default"}),showGuide(romaNode.childNodes[typeIndex]))}}function convertJaEn(e,t,n,s,o){return e.shiftKey?typeEventKey(simpleKeyboard.options.layout==layout109?n:o):typeEventKey(simpleKeyboard.options.layout==layout109?t:s)}function convertShiftJaEn(e,t,n){return e.shiftKey?typeEventKey(simpleKeyboard.options.layout==layout109?t:n):typeEventKey(e.key)}function typeEvent(e){switch(e.code){case"AltLeft":return typeEventKey("NonConvert");case"AltRight":return typeEventKey("Convert");case"Digit2":return convertShiftJaEn(e,'"',"@");case"Digit6":return convertShiftJaEn(e,"&","^");case"Digit7":return convertShiftJaEn(e,"'","&");case"Digit8":return convertShiftJaEn(e,"(","*");case"Digit9":return convertShiftJaEn(e,")","(");case"Digit0":return convertShiftJaEn(e,"~",")");case"Minus":return convertShiftJaEn(e,"=","_");case"Equal":return convertJaEn(e,"^","~","=","+");case"BracketLeft":return convertJaEn(e,"@","`","{","[");case"BracketRight":return convertJaEn(e,"{","[","}","]");case"Semicolon":return convertShiftJaEn(e,"+",";");case"Quote":return convertJaEn(e,":","+","'",'"');case"Space":e.preventDefault();default:return typeEventKey(e.key)}}function typeEventKey(e){switch(e){case"NonConvert":[...romaNode.children].forEach(e=>{e.style.visibility="visible"}),downTime(5);return;case"Convert":{const e=romaNode.textContent;loopVoice(e,1);return}case"Shift":case"CapsLock":guide&&(simpleKeyboard.setOptions({layoutName:"shift"}),showGuide(romaNode.childNodes[typeIndex]));return;case"Escape":startGame();return;case"Enter":if(!playing){startGame();return}}const t=romaNode.childNodes[typeIndex];e.length==1&&(e==t.textContent?(typeNormal(t),removeGuide(t),underlineSpace(t)):(playAudio("incorrect",.3),errorCount+=1),typeIndex==romaNode.childNodes.length?nextProblem():showGuide(romaNode.childNodes[typeIndex]))}function startGame(){clearInterval(typeTimer),removeGuide(romaNode.childNodes[typeIndex]),initTime(),loadProblems(),countdown(),countPanel.classList.remove("d-none"),scorePanel.classList.add("d-none")}function resizeFontSize(e){function h(e,t){const n=tmpCanvas.getContext("2d");n.font=t;const s=n.measureText(e);return s.width}function f(e,t,n,s){const o=e.split(`
`),a=t+"px "+n;let i=0;for(let e=0;e<o.length;e++){const t=h(o[e],a);i<t&&(i=t)}return[i,t*o.length*s]}function m(e){const t=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight),n=parseFloat(e.paddingTop)+parseFloat(e.paddingBottom);return[t,n]}const n=getComputedStyle(e),c=n.fontFamily,t=parseFloat(n.fontSize),l=parseFloat(n.lineHeight)/t,d=document.getElementById("aaOuter").offsetHeight,u=infoPanel.clientWidth,i=[u,d],a=f(e.textContent,t,c,l),r=m(n),o=t*(i[0]-r[0])/a[0]*.9,s=t*(i[1]-r[1])/a[1]*.9;s<o?s<remSize?e.style.fontSize=remSize+"px":e.style.fontSize=s+"px":o<remSize?e.style.fontSize=remSize+"px":e.style.fontSize=o+"px"}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e))+e}function shuffle(e){for(let t=e.length;1<t;t--){const n=Math.floor(Math.random()*t);[e[n],e[t-1]]=[e[t-1],e[n]]}return e}function typable(){const t=problems[getRandomInt(0,problems.length)];japanese.textContent=t.ja;const e=t.en;if(mode.textContent=="NORMAL"){hint.classList.remove("d-none");const t=shuffle(e.replace(/[,.?]/,"").split(" "));hint.textContent="hint: "+t.join(" ")}else hint.classList.add("d-none");for(loopVoice(e,2);romaNode.firstChild;)romaNode.removeChild(romaNode.firstChild);for(let t=0;t<e.length;t++){const n=document.createElement("span");mode.textContent!="EASY"&&(n.style.visibility="hidden"),n.textContent=e[t],romaNode.appendChild(n)}showGuide(romaNode.childNodes[0])}function countdown(){if(countdowning)return;countdowning=!0,typeIndex=normalCount=errorCount=solveCount=0,document.getElementById("courseOption").classList.remove("show"),document.getElementById("guideSwitch").disabled=!0,document.getElementById("virtualKeyboard").disabled=!0,gamePanel.classList.add("d-none"),infoPanel.classList.add("d-none"),countPanel.classList.remove("d-none"),counter.textContent=3;const e=setInterval(()=>{const t=document.getElementById("counter"),n=["skyblue","greenyellow","violet","tomato"];if(parseInt(t.textContent)>1){const e=parseInt(t.textContent)-1;t.style.backgroundColor=n[e],t.textContent=e}else countdowning=!1,playing=!0,clearInterval(e),document.getElementById("guideSwitch").disabled=!1,document.getElementById("virtualKeyboard").disabled=!1,gamePanel.classList.remove("d-none"),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),scorePanel.classList.add("d-none"),resizeFontSize(aa),window.scrollTo({top:document.getElementById("typePanel").getBoundingClientRect().top,behavior:"auto"}),typable(),startTypeTimer(),localStorage.getItem("bgm")==1&&bgm.play()},1e3)}function startTypeTimer(){const e=document.getElementById("time");typeTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(typeTimer),bgm.pause(),playAudio("end"),scoring())},1e3)}function downTime(e){const t=document.getElementById("time"),s=parseInt(t.textContent),n=s-e;n<0?t.textContent=0:t.textContent=n}function initTime(){document.getElementById("time").textContent=gameTime}function changeMode(e){e.target.textContent=="EASY"?e.target.textContent="NORMAL":e.target.textContent=="NORMAL"?e.target.textContent="HARD":e.target.textContent="EASY"}courseOption.addEventListener("change",()=>{initTime(),clearInterval(typeTimer)});function scoring(){playing=!1,infoPanel.classList.remove("d-none"),gamePanel.classList.add("d-none"),countPanel.classList.add("d-none"),scorePanel.classList.remove("d-none");const t=courseOption.radio.value,e=(normalCount/gameTime).toFixed(2);document.getElementById("totalType").textContent=normalCount+errorCount,document.getElementById("typeSpeed").textContent=e,document.getElementById("errorType").textContent=errorCount,document.getElementById("twitter").href="https://twitter.com/intent/tweet?text=英文法タイピングの"+t+"をプレイしたよ! (速度: "+e+"回/秒) &url=https%3a%2f%2fmarmooo.github.com/english-grammar-typing/%2f&hashtags=英文法タイピング"}resizeFontSize(aa),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("toggleBGM").onclick=toggleBGM,document.getElementById("virtualKeyboard").onclick=toggleKeyboard,window.addEventListener("resize",()=>{resizeFontSize(aa)}),mode.onclick=changeMode,startButton.addEventListener("click",startGame),document.getElementById("guideSwitch").onchange=toggleGuide,document.addEventListener("keyup",upKeyEvent),document.addEventListener("keydown",typeEvent),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})