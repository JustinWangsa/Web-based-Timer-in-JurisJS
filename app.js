// {
//   id: string,              
//   name: string,            
//   durationSec: number,     
//   remainSec: number,       
//   endsAt: number | null,   
//   message: string,         
//   status: 'idle' | 'running' | 'paused' | 'done'  
// }

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

const App = () => { // form input states
  let nameInput = "";
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
    App.render(); 
  };

  return (
    <div>
      <h1>Add Timer</h1>
      <input type = "text" placeholder= "Name" value = {nameInput} onInput = {e => nameInput = e.target.value} />
      <input type = "text" placeholder= "Duration (mm:ss or in seconds)" value = {durationInput} onInput = {e => durationInput = e.target.value} />
      <input type = "text" placeholder= "Message (optional)" value = {messageInput} onInput = {e => messageInput = e.target.value} />
      <button onClick = {addTimer}>Add Timer</button>

      <h2>My Timers</h2>
      <ul>
        {timers.map(timer => (
          <li key={timer.id}>
            <strong>{timer.name}</strong> – {formatTime(timer.remainSec)}
            <button>Start</button>
            <button>Pause</button>
            <button>Reset</button>
            <button>Delete</button>
          </li>
        ))}
      </ul>
    </div>  
  );
};

timers = loadTimers();
App.mount("#app");