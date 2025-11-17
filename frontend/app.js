/* Frontend JS - vanilla
   Features:
   - Send message to backend /chat (POST JSON: { text, lang })
   - Voice input using Web Speech API (if supported)
   - Speech Synthesis for TTS of last bot reply
   - Clear chat, download chat (txt), dark mode toggle
   - Language selector popup (en, hi, mr)
   - Message timestamps (real-time)
*/

const API_URL = "http://127.0.0.1:8000/chat"; // change if different
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");
const messagesEl = document.getElementById("messages");
const micBtn = document.getElementById("micBtn");
const ttsBtn = document.getElementById("ttsBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const langBtn = document.getElementById("langBtn");
const langPopup = document.getElementById("langPopup");
const closeLangPopup = document.getElementById("closeLangPopup");
const langChoices = document.querySelectorAll(".lang-choice");
const darkToggle = document.getElementById("darkToggle");

let CURRENT_LANG = "en";
let lastBotReply = "";

// helpers
function nowTimestamp(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  const mo = String(d.getMonth()+1).padStart(2,"0");
  return `${hh}:${mm} • ${dd}/${mo}`;
}

function appendMessage(text, who="them"){
  const wrap = document.createElement("div");
  wrap.className = `message ${who === "me" ? "me" : "them"}`;
  const txt = document.createElement("div");
  txt.className = "txt";
  txt.textContent = text;
  const meta = document.createElement("div");
  meta.className = "meta";
  const time = document.createElement("div");
  time.className = "timestamp";
  time.textContent = nowTimestamp();
  meta.appendChild(time);
  wrap.appendChild(txt);
  wrap.appendChild(meta);
  messagesEl.appendChild(wrap);
  // autoscroll
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendToBackend(text){
  appendMessage(text,"me");
  inputBox.value = "";
  inputBox.disabled = true;
  sendBtn.disabled = true;

  try {
    const payload = { text, lang: CURRENT_LANG };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const txt = `Server error: ${res.status}`;
      appendMessage(txt,"them");
      inputBox.disabled = false;
      sendBtn.disabled = false;
      return;
    }
    const data = await res.json();
    const reply = data.reply ?? "Sorry, I didn't get that.";
    lastBotReply = reply;
    appendMessage(reply,"them");
  } catch(err){
    appendMessage("Network error: cannot reach backend","them");
    console.error(err);
  } finally {
    inputBox.disabled = false;
    sendBtn.disabled = false;
    inputBox.focus();
  }
}

// Send on button or enter
sendBtn.addEventListener("click",() => {
  const v = inputBox.value.trim();
  if(!v) return;
  sendToBackend(v);
});
inputBox.addEventListener("keydown",(e)=> {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendBtn.click();
  }
});

// language popup
langBtn.addEventListener("click", () => {
  langPopup.classList.toggle("hidden");
  langPopup.setAttribute("aria-hidden", langPopup.classList.contains("hidden"));
});
closeLangPopup.addEventListener("click", () => {
  langPopup.classList.add("hidden");
});
langChoices.forEach(btn=> {
  btn.addEventListener("click", ()=> {
    CURRENT_LANG = btn.dataset.lang;
    langBtn.textContent = `Language: ${btn.textContent.split(" ")[0]} ▾`;
    langPopup.classList.add("hidden");
  });
});

// clear chat
clearBtn.addEventListener("click", ()=> {
  messagesEl.innerHTML = "";
  lastBotReply = "";
});

// download chat (text)
downloadBtn.addEventListener("click", ()=> {
  const nodes = Array.from(messagesEl.querySelectorAll(".message"));
  const lines = nodes.map(n => {
    const who = n.classList.contains("me") ? "YOU" : "BOT";
    const txt = n.querySelector(".txt").textContent.replace(/\n/g," ");
    const time = n.querySelector(".timestamp").textContent;
    return `[${time}] ${who}: ${txt}`;
  });
  const blob = new Blob([lines.join("\n")], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// TTS (speak last bot reply)
ttsBtn.addEventListener("click", ()=> {
  if(!lastBotReply) return;
  speakText(lastBotReply, CURRENT_LANG);
});
function speakText(text, lang="en"){
  if(!("speechSynthesis" in window)) {
    alert("Speech synthesis not supported in this browser.");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  // choose voice/language heuristics
  utter.lang = (lang === "hi" ? "hi-IN" : (lang === "mr" ? "mr-IN" : "en-US"));
  // try to pick a matching voice
  const voices = speechSynthesis.getVoices();
  let chosen = voices.find(v => v.lang && v.lang.startsWith(utter.lang.split("-")[0]));
  if(chosen) utter.voice = chosen;
  utter.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// Voice input (Web Speech API)
let recognition = null;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = (CURRENT_LANG === "hi" ? "hi-IN" : (CURRENT_LANG === "mr" ? "mr-IN" : "en-US"));
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.addEventListener("click", ()=>{
    try {
      recognition.lang = (CURRENT_LANG === "hi" ? "hi-IN" : (CURRENT_LANG === "mr" ? "mr-IN" : "en-US"));
      recognition.start();
      micBtn.classList.add("recording");
      micBtn.textContent = "🎙️";
    } catch(err){
      console.error(err);
    }
  });

  recognition.addEventListener("result", (ev) => {
    const spoken = ev.results[0][0].transcript;
    micBtn.classList.remove("recording");
    micBtn.textContent = "🎤";
    inputBox.value = spoken;
    sendBtn.click();
  });

  recognition.addEventListener("end", ()=> {
    micBtn.classList.remove("recording");
    micBtn.textContent = "🎤";
  });

} else {
  micBtn.addEventListener("click", ()=> {
    alert("Voice input not supported in your browser.");
  });
}

// Dark mode toggle, persisted in localStorage
darkToggle.addEventListener("change", (e) => {
  if(e.target.checked){
    document.body.classList.add("dark");
    localStorage.setItem("dark","1");
  } else {
    document.body.classList.remove("dark");
    localStorage.removeItem("dark");
  }
});
(function(){
  if(localStorage.getItem("dark")) {
    darkToggle.checked = true;
    document.body.classList.add("dark");
  }
})();

// small UX: focus input on click into area
document.querySelector(".chat-area").addEventListener("click", ()=> inputBox.focus());

// quick sample welcome
appendMessage("Hi! This is a multilingual chatbot. Select language and start typing.", "them");
