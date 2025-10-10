// {
//   id: string,
//   name: string,
//   durationSec: number, // total duration
//   remainSec: number,   // remaining time
//   endsAt: number|null, // timestamp when timer should end
//   message: string,
//   status: 'idle'|'running'|'paused'|'done'
// }
let timers = loadTimers();
let audio = new Audio('backsound_timer.mp3');
function saveTimers(timers) {
  localStorage.setItem("timers", JSON.stringify(timers));
} // for save time (so the time doesn't reset)

function loadTimers() {
  return JSON.parse(localStorage.getItem("timers")) || [];
} // for load timers when re open file


function createTimer(name, durationSec, message) { // for making new timers (data)
  return {
    id: Date.now().toString(),   
    name,
    durationSec,
    remainSec: durationSec,      
    endsAt: null,                
    message: message || "Time’s up!",
    status: "idle"
  };
}

function parseDuration(input) {
  if (input.includes(":")) { // if user input mm:ss
    const parts = input.split(":");
    const minutes = parseInt(parts[0], 10); 
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  } else { // else if user just input in second 
    return parseInt(input, 10);
  }
}

function formatTime(sec) {
  const m = Math.floor(sec/60); // for minutes
  const s = sec % 60; 
  return `${m.toString().padStart(2,'0')} : ${s.toString().padStart(2,0)}`;
}

window.startTimer = function(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer || timer.status === 'running') return;

  timer.status = 'running';
  timer.endsAt = Date.now() + timer.remainSec * 1000; // convert remaining seconds to ms

  const intervalId = setInterval(() => {
    const now = Date.now();
    timer.remainSec = Math.max(Math.round((timer.endsAt - now) / 1000), 0); // convert back to seconds
    renderApp();

    if (timer.remainSec <= 0) {
      audio.play();
      clearInterval(intervalId);
      timer.intervalId = null;
      timers = timers.filter(t => t.id !== timer.id); // Remove the timer from the array
      alert(timer.message);
      saveTimers(timers);
      renderApp();
    }
  }, 1000);

  timer.intervalId = intervalId;
};

window.pauseTimer = function(id){
  const timer = timers.find(t => t.id === id);
  if (!timer || timer.status !== 'running') return;

  clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.remainSec = Math.max(Math.round((timer.endsAt - Date.now())/1000), 0);
  timer.status = 'paused';
  timer.endsAt = null;

  saveTimers(timers);
  renderApp();
};

window.resetTimer = function(id){
  const timer = timers.find(t => t.id === id);
  if (timer){
    timer.remainSec = timer.durationSec;
    timer.status = "idle";
    saveTimers(timers);
    renderApp();
  }
}

window.deleteTimer = function(id){
  timers = timers.filter(t => t.id !== id);
  saveTimers(timers);
  renderApp();
};

let nameInput = "";// form input states
let durationInput = "";
let messageInput = "";

const addTimer  = () => {
    if(!nameInput)  
      return alert("The name CANNOT be empty!"); // check empty or no
    let durationSec = parseDuration(durationInput); // change all to second
    if(isNaN(durationSec) || durationSec <= 0) 
      return alert("Duration MUST be positive!"); // check positive or no

    const timer = createTimer(nameInput , durationSec , messageInput);
    timers.push(timer); // input in timers array
    saveTimers(timers); // save the timers into localStorage

    nameInput = durationInput = messageInput = ""; // make blank so can add new timer 
    renderApp();
  };

function renderApp() {
  const app = document.getElementById("app");

let timerListHTML = timers.map(timer => `
  <div class="card">
  <div class="name"<strong>${timer.name}</strong> </div>
  <div class="countdown">${formatTime(timer.remainSec)}</div>
    <div class="button">
      <button onclick="startTimer('${timer.id}')">Start</button>
      <button onclick="pauseTimer('${timer.id}')">Pause</button>
      <button onclick="resetTimer('${timer.id}')">Reset</button>
      <button onclick="deleteTimer('${timer.id}')">Delete</button>
    </div>
  </div>
`).join("");

app.innerHTML = `
    <div class="input">
      <h1>Multi Timers</h1>
      <input type="text" placeholder="Name" id="nameInput" value="${nameInput}">
      <input type="text" placeholder="Duration (mm:ss or seconds)" id="durationInput" value="${durationInput}">
      <input type="text" placeholder="Message (optional)" id="messageInput" value="${messageInput}">
      <div class= "add"><button id="addBtn">Add Timer</button></div> 
      <h2>My Timers List</h2>
    </div>
    <div class="container">${timerListHTML}</div>
  `;

  document.getElementById("nameInput").oninput = e => nameInput = e.target.value;
  document.getElementById("durationInput").oninput = e => durationInput = e.target.value;
  document.getElementById("messageInput").oninput = e => messageInput = e.target.value;
  document.getElementById("addBtn").onclick = addTimer;
}

renderApp();
