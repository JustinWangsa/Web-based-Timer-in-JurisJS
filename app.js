const app = new Juris({ states: { timers: [] } });

const renderTimers = () => {
  const timerList = document.getElementById("timerList");
  timerList.innerHTML = "";  

  app.getState('timers').forEach((timer, index) => {
    const timerElement = document.createElement('div');
    timerElement.classList.add('timer');
    timerElement.innerHTML = `
      <h3>${timer.name}</h3>
      <p>Time remaining: ${formatTime(timer.remainSec)}</p>
      <p>Status: ${timer.status}</p>
      <button class="start-btn" data-id="${timer.id}">${timer.status === 'running' ? 'Pause' : 'Start'}</button>
      <button class="reset-btn" data-id="${timer.id}">Reset</button>
      <button class="delete-btn" data-id="${timer.id}">Delete</button>
      
    `;
    timerList.appendChild(timerElement);
  });

  // start - reset - delete button
  document.querySelectorAll('.start-btn').forEach(button => {
    button.addEventListener('click', () => toggleTimer(button.dataset.id));
  });

  document.querySelectorAll('.reset-btn').forEach(button => {
    button.addEventListener('click', () => resetTimer(button.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => deleteTimer(button.dataset.id));
  });
};

// formatting time to hh:mm:ss
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600); // calculate hours
  const mins = Math.floor((seconds % 3600) / 60); // calculate minutes
  const secs = seconds % 60; // calculate seconds
  return [
    hours, mins,secs
    ]
    .map(unit => unit.toString().padStart(2, '0'))  // Use .map to pad each part
    .join(':');  
};

// Add a new timer
const addTimer = (name, durationSec, message = "Time's up!") => {
  const id = Date.now().toString(); 
  const newTimer = {
    id,
    name,
    durationSec,
    remainSec: durationSec, // Set the remaining time initially to duration
    endsAt: null,
    message,
    status: 'idle'
  };
  const timers = [...app.getState('timers'), newTimer];
  app.setState('timers', timers);
  saveTimersToLocalStorage(timers);
};

// Toggle the timer 
const toggleTimer = (id) => {
  const timers = app.getState('timers');
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  if (timer.status === 'running') {
    // Pause timer
    timer.status = 'paused';
    timer.remainSec = Math.max(0, Math.floor((timer.endsAt - Date.now()) / 1000)); // Update remaining time
  } else {
    // Start timer
    timer.status = 'running';
    timer.endsAt = Date.now() + timer.remainSec * 1000; // Calculate the end time
    runTimers(); 
  }
  app.setState('timers', timers);
  saveTimersToLocalStorage(timers);
  renderTimers();
};

// Reset the timer
const resetTimer = (id) => {
  const timers = app.getState('timers');
  const timer = timers.find(t => t.id === id);
  if (!timer) return;

  timer.status = 'idle';
  timer.remainSec = timer.durationSec; // Reset remaining time
  timer.endsAt = null;
  app.setState('timers', timers);
  saveTimersToLocalStorage(timers);
  renderTimers();
};

// Delete the timer
const deleteTimer = (id) => {
  const timers = app.getState('timers');
  const updatedTimers = timers.filter(t => t.id !== id);
  app.setState('timers', updatedTimers);
  saveTimersToLocalStorage(updatedTimers);
  renderTimers();
};

// Save timers to localStorage
const saveTimersToLocalStorage = (timers) => {
  localStorage.setItem('timers', JSON.stringify(timers));
};

// Load timers from localStorage
const loadTimersFromLocalStorage = () => {
  const savedTimers = localStorage.getItem('timers');
  return savedTimers ? JSON.parse(savedTimers) : [];
};

// Run the timers 
const runTimers = () => {
  setInterval(() => {
    const timers = app.getState('timers');
    timers.forEach(timer => {
      if (timer.status === 'running') {
        const remainingTime = Math.max(0, Math.floor((timer.endsAt - Date.now()) / 1000));
        timer.remainSec = remainingTime;
      if (remainingTime === 0 && timer.status !== 'done') {
        timer.status = 'done';
        timerEndSound.play(); //sound
        alert(`⏰ "${timer.name}" is done!`); //alert
        }
      }
    });
    app.setState('timers', timers);
    saveTimersToLocalStorage(timers);  // Keep persistence updated
    renderTimers();
  }, 1000);
};

// form submission for timer
document.getElementById('timerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('timerName').value;
  const durationSec = parseInt(document.getElementById('timerDuration').value, 10);
  const message = "Time's up!";
  if (name && durationSec > 0) {
    addTimer(name, durationSec, message);
    renderTimers();
  }
});

// loading timer from storage
const init = () => {
  const timers = loadTimersFromLocalStorage();
  app.setState('timers', timers);

  // calculating running time
  timers.forEach(timer => {
    if (timer.status === 'running') {
      timer.remainSec = Math.max(0, Math.floor((timer.endsAt - Date.now()) / 1000));
    }
  });

  renderTimers();
};

//Timer sound
const timerEndSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");


init();
