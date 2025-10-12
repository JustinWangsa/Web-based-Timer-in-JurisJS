const savedTimers = JSON.parse(localStorage.getItem("timers")) || [];

const app = new Juris({
  states: {
    timers: savedTimers,
    newTimer: {
      name: "",
      duration: "",
    },
  },

  components: {
    Timer: (props, { getState, setState }) => {
      const { id } = props;

      const startTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.running) return;

        timer.running = true;
        timer.intervalId = setInterval(() => {
          const updatedTimers = getState("timers").map((t) => {
            if (t.id === id) {
              if (t.time > 0) {
                return { ...t, time: t.time - 1 };
              } else {
                clearInterval(t.intervalId);
                alert(t.name + " Time’s up!");
                return {
                  ...t,
                  running: false,
                  intervalId: null,
                  time: t.originalTime,
                };
              }
            }
            return t;
          });
          setState("timers", updatedTimers);
          localStorage.setItem("timers", JSON.stringify(updatedTimers));
        }, 1000);

        setState("timers", [...timers]);
        localStorage.setItem("timers", JSON.stringify(timers));
      };

      const pauseTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.running = false;
          timer.intervalId = null;
          setState("timers", [...timers]);
          localStorage.setItem("timers", JSON.stringify(timers));
        }
      };

      const resetTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.intervalId) clearInterval(timer.intervalId);
        timer.time = timer.originalTime;
        timer.running = false;
        timer.intervalId = null;
        setState("timers", [...timers]);
        localStorage.setItem("timers", JSON.stringify(timers));
      };

      return {
        div: {
          class: "timer-card",
          children: [
            { h3: { text: () => props.name } },
            {
              p: {
                text: () => {
                  const timers = getState("timers");
                  const t = timers.find((t) => t.id === id);
                  const minutes = Math.floor(t.time / 60);
                  const seconds = t.time % 60;
                  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
                },
              },
            },
            {
              div: {
                class: "button-container",
                children: [
                  { button: { text: "Start", onclick: startTimer } },
                  { button: { text: "Pause", onclick: pauseTimer } },
                  { button: { text: "Reset", onclick: resetTimer } },
                ],
              },
            },
          ],
        },
      };
    },
  },

  layout: {
    div: {
      class: "main-container",
      children: [
        {
          div: {
            class: "form-section",
            children: [
              { h2: { text: "Add New Timer" } },
              {
                input: {
                  placeholder: "Name",
                  value: () => app.getState("newTimer").name,
                  oninput: (e) => {
                    const nt = app.getState("newTimer");
                    nt.name = e.target.value;
                    app.setState("newTimer", nt);
                  },
                },
              },
              {
                input: {
                  placeholder: "Duration (seconds or mm:ss)",
                  value: () => app.getState("newTimer").duration,
                  oninput: (e) => {
                    const nt = app.getState("newTimer");
                    nt.duration = e.target.value;
                    app.setState("newTimer", nt);
                  },
                },
              },

              {
                button: {
                  text: "Add Timer",
                  class: "add-timer-button",
                  onclick: () => {
                    const nt = app.getState("newTimer");
                    if (!nt.name.trim()) {
                      alert("Name cannot be empty!");
                      return;
                    }

                    let totalSeconds = 0;
                    if (nt.duration.includes(":")) {
                      const [m, s] = nt.duration.split(":").map(Number);
                      if (isNaN(m) || isNaN(s)) {
                        alert("Invalid mm:ss format!");
                        return;
                      }
                      totalSeconds = m * 60 + s;
                    } else {
                      totalSeconds = Number(nt.duration);
                      if (isNaN(totalSeconds) || totalSeconds <= 0) {
                        alert("Duration must be a positive number!");
                        return;
                      }
                    }

                    const timers = app.getState("timers");
                    const newTimer = {
                      id: Date.now(),
                      name: nt.name.trim(),
                      time: totalSeconds,
                      originalTime: totalSeconds,
                      running: false,
                      intervalId: null,
                    };

                    const updated = [...timers, newTimer];
                    app.setState("timers", updated);
                    localStorage.setItem("timers", JSON.stringify(updated));

                    app.setState("newTimer", {
                      name: "",
                      duration: "",
                    });
                  },
                },
              },
            ],
          },
        },

        {
          div: {
            class: "timers-card-container",
            children: () => {
              const timers = app.getState("timers");
              if (timers.length === 0)
                return [{ p: { text: "No timers yet. Add one above!" } }];
              return timers.map((timer) => ({
                Timer: {
                  id: timer.id,
                  name: timer.name,
                },
              }));
            },
          },
        },
      ],
    },
  },
});

app.render("#app");
