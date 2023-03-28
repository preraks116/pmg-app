const clockDiv = document.getElementById("clock");
let time = 0;
let millis;
let timerbool = false;
const dt = 10;
const start = Date.now();

function getTime() {
    millis = Date.now() - start;
    let final_time; 
    if (timerbool) {
      time += 10;
      final_time = (time / 1000).toFixed(2);
      clockDiv.innerHTML = `Time: ${final_time}`
    }
    return final_time;
}

function startTimer() {
    if(timerbool) return;
    timerbool = true;
}

function stopTimer() {
    if(!timerbool) return;
    timerbool = false;
}

function resetTimer() {
    time = 0;
    timerbool = false;
    clockDiv.innerHTML = `Time: ${(time / 1000).toFixed(2)}`;
}

export { getTime, startTimer, stopTimer, resetTimer, dt, timerbool };