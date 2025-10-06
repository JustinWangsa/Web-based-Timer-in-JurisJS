
Data model
    
    id: string,              // unique id (timestamp or UUID)
    name: string,
    durationSec: number,     // original duration
    endsAt: number | null,   // expected finish time (if running)
    remainSec: number,       // remaining seconds (if paused or idle)
    message: string,
    status: 'idle' | 'running' | 'paused' | 'done'
    

Hints
    
    Use one global interval (setInterval) to update all running timers.//why not individual?

    For running timers, compute remaining time as Math.max(0, floor((endsAt - Date.now())/1000)).

    For paused or idle timers, display remainSec.

    On pause, calculate and store remainSec.

    On reset, restore remainSec = durationSec and status = idle.

    Save back to localStorage whenever timers are added, updated, or deleted.


# Todo

Interface Requirements
    
Top section: Form to add a new timer (name, duration, message, [Add] button).

    * [X] ~~*Each timer has:*~~ [2025-10-05]
        A name               : cannot be empty.
        A duration           : {Z+} Seconds ("90"), mm:ss format ("02:30")
        A completion message : optional; if blank, use "Time’s up!".
    * [X] ~~*After pressing “Add”, the timer is added to the list and saved in localStorage.*~~ [2025-10-05]


Bottom section: List of existing timers.
    
    * [X] ~~*Each timer should display:*~~ [2025-10-06]
            Name
            Remaining time (format mm:ss)
            Control buttons: Start / Pause / Reset / Delete
            * [X] ~~*Completion message when finished*~~ [2025-10-06]

    * [X] ~~*Multiple independent timers*~~ [2025-10-06]
        The app must support multiple timers simultaneously.

    * [X] ~~*Persistence*~~ [2025-10-06]
        Timers must be saved in localStorage.
        After refresh, the list and their states must reload.
        If a timer was running, it should continue with the correct remaining time.

    * [X] ~~*Completion behavior*~~ [2025-10-06]
        When a timer reaches zero, display its completion message.
        Extra credit: use visual highlight, sound, or browser notifications.






            
    



A zip file contains
    
    * [ ] index.html file
    
    * [ ] The index.html must include:
        <script src="https://jurisjs.com/juris.js"></script>
        <div id="app"></div> as the root container.

    (optional) You may properly modulize the implementation into some other CSS and JavaScript files

    Optional: a hyperlink in index.html to a short (30–60 sec) screencast demo.


