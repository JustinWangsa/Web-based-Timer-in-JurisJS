 document.addEventListener('DOMContentLoaded', function () {
    
    
    //stating timer to be 0
    let timerID;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;

    //timer logic 
    const UpdateTimer = () => {
        seconds ++;
        if (seconds === 60){
            seconds = 0;
            minutes ++;
        }
        if (minutes === 60){
            minutes = 0;
            hours ++;
        }
    }



    }
);