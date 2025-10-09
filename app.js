let timers = [];

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

function startTimer(id){
  const timer = timers.find(t => t.id === id);
  
}

function pauseTimer(id){
  console.log("Time Paused!",id);
}

function resetTimer(id){
  const timer = timers.find(t => t.id === id);
  if (timer){
    timer.remainSec = timer.durationSec;
    timer.status = "idle";
    saveTimers();
    TimerApp.render();
  }
}

function deleteTimer(id) {
  timers = timers.filter(t => t.id !== id);
  saveTimers();
  TimerApp.render();
}

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
    saveTimers(); // save the timers into localStorage

    nameInput = durationInput = messageInput = ""; // make blank so can add new timer 
    renderApp();
  };

function renderApp() {
  const app = document.getElementById("app");

  let timerListHTML = timers.map(timer => `
    <li>
      <strong>${timer.name}</strong> – ${formatTime(timer.remainSec)}
      <button click="startTimer('${timer.id}')">Start</button>
      <button click="pauseTimer('${timer.id}')">Pause</button>
      <button click="resetTimer('${timer.id}')">Reset</button>
      <button click="deleteTimer('${timer.id}')">Delete</button>
    </li>
  `).join("");

  app.innerHTML = `
    <h1>Add Timer</h1>
    <input type="text" placeholder="Name" id="nameInput" value="${nameInput}">
    <input type="text" placeholder="Duration (mm:ss or seconds)" id="durationInput" value="${durationInput}">
    <input type="text" placeholder="Message (optional)" id="messageInput" value="${messageInput}">
    <button id="addBtn">Add Timer</button>
    <h2>My Timers</h2>
    <ul>${timerListHTML}</ul>
  `;

  document.getElementById("nameInput").oninput = e => nameInput = e.target.value;
  document.getElementById("durationInput").oninput = e => durationInput = e.target.value;
  document.getElementById("messageInput").oninput = e => messageInput = e.target.value;
  document.getElementById("addBtn").onclick = addTimer;
}

renderApp();
