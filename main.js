const savedTimers = JSON.parse(localStorage.getItem("timers")) || null;

const app = new Juris({
  states: {
    timers: savedTimers || [
      {
        id: 1,
        name: "Timer 1",
        time: 0.1 * 60,
        running: false,
        intervalId: null,
      },
      {
        id: 2,
        name: "Timer 2",
        time: 0.1 * 60,
        running: false,
        intervalId: null,
      },
      {
        id: 3,
        name: "Timer 3",
        time: 0.1 * 60,
        running: false,
        intervalId: null,
      },
      {
        id: 4,
        name: "Timer 4",
        time: 0.1 * 60,
        running: false,
        intervalId: null,
      },
    ],
  },

  components: {
    Timer: (props, { getState, setState }) => {
      const { id } = props;

      const startTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.running) return;

        if (timer.intervalId) clearInterval(timer.intervalId);

        timer.running = true;
        timer.intervalId = setInterval(() => {
          const updatedTimers = getState("timers").map((t) => {
            if (t.id === id) {
              if (t.time > 0) return { ...t, time: t.time - 1 };
              else {
                clearInterval(t.intervalId);
                alert(`${t.name} finished!`);
                return {
                  ...t,
                  time: 0.1 * 60,
                  running: false,
                  intervalId: null,
                };
              }
            }
            return t;
          });
          setState("timers", updatedTimers);
          localStorage.setItem("timers", JSON.stringify(getState("timers")));
        }, 1000);

        setState("timers", [...timers]);
        localStorage.setItem("timers", JSON.stringify(getState("timers")));
      };

      const pauseTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.running = false;
          timer.intervalId = null;
          setState("timers", [...timers]);
          localStorage.setItem("timers", JSON.stringify(getState("timers")));
        }
      };

      const resetTimer = () => {
        const timers = getState("timers");
        const timer = timers.find((t) => t.id === id);
        if (timer.intervalId) clearInterval(timer.intervalId);
        timer.time = 0.1 * 60;
        timer.running = false;
        timer.intervalId = null;
        setState("timers", [...timers]);
        localStorage.setItem("timers", JSON.stringify(getState("timers")));
      };

      // Restore running timers on load
      const timers = getState("timers");
      const timer = timers.find((t) => t.id === id);
      if (timer.running && !timer.intervalId) {
        timer.intervalId = setInterval(() => {
          const updatedTimers = getState("timers").map((t) => {
            if (t.id === id) {
              if (t.time > 0) return { ...t, time: t.time - 1 };
              else {
                clearInterval(t.intervalId);
                alert(`${t.name} finished!`);
                return {
                  ...t,
                  time: 0.1 * 60,
                  running: false,
                  intervalId: null,
                };
              }
            }
            return t;
          });
          setState("timers", updatedTimers);
          localStorage.setItem("timers", JSON.stringify(getState("timers")));
        }, 1000);
      }

      return {
        div: {
          class: "timer-card",
          children: [
            { h1: { text: () => props.name } },
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

            { button: { text: "Start", onclick: startTimer } },
            { button: { text: "Pause", onclick: pauseTimer } },
            { button: { text: "Reset", onclick: resetTimer } },
          ],
        },
      };
    },
  },

  layout: {
    div: {
      children: () => {
        const timers = app.getState("timers");
        return timers.map((timer) => ({
          Timer: { id: timer.id, name: timer.name },
        }));
      },
    },
  },
});

app.render("#app");
