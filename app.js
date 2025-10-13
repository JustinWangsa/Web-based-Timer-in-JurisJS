"use strict";

class TimerData {
  static State = Object.freeze({
    running: "running",
    paused: "paused",
    finished: "finished",
  });

  constructor(name, duration, message) {
    this.name = name;
    this.duration = duration;
    this.message = message;
    this.id = Date.now() + this.name;
    this.states = TimerData.State.paused;
    this.remainder = this.duration;
    this.end = 0;
  }
}

const _timer_Adder_Field = (props, ctx) => {
  let { ns, field, initial, validator, required, placeholder } = props;
  let { getState, setState } = ctx;

  let d_field = ns + ".d";
  setState(d_field, initial ?? "");
  let w_field = ns + ".w";
  if (required) setState(w_field, "Can't be empty");
  else setState(w_field, "");

  let labelPart = {
    div: {
      class: "form-label",
      text: field,
    },
  };
  let inputPart = {
    div: {
      class: "form-input",
      contenteditable: "true",
      "data-placeholder": placeholder,
      oninput: (e) => {
        let input = e.target.innerText.trim();
        let { value, warning } = validator(input);

        if (warning.length > 0) {
          setState(w_field, warning);
        } else {
          setState(w_field, "");
          setState(d_field, value);
        }

        if (input.length == 0) {
          e.target.removeChild(e.target.firstChild);
        }
      },
      onkeydown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
        }
      },
    },
  };
  let warningPart = {
    div: {
      class: "warning-text",
      text: () => getState(w_field),
    },
  };
  return [labelPart, inputPart, warningPart];
};

const _timer_Adder = (props, ctx) => {
  let { getState, setState } = ctx;
  let { ns } = props;
  let timerList = "_timer._list";

  return {
    div: {
      id: "timerAdder",
      class: "timer-form",
      children: [
        {
          div: {
            class: "form-group",
            children: [
              ..._timer_Adder_Field(
                {
                  ns: ns + "._nameField",
                  field: "Name",
                  required: 1,
                  validator: (input) => ({
                    warning: input.length > 0 ? "" : "Can't be empty",
                    value: input.length > 0 ? input : "",
                  }),
                  placeholder: "enter timer name",
                },
                ctx
              ),
              ..._timer_Adder_Field(
                {
                  ns: ns + "._durationField",
                  field: "Duration",
                  required: 1,
                  placeholder: "enter timer duration",
                  validator: (input) => {
                    if (input.length < 1)
                      return { warning: "Can't be empty", value: "" };

                    let raw;
                    if ((raw = input.match(/^(\d\d):([012345]\d)$/))) {
                      let duration =
                        Number(raw[1]) * 60000 + Number(raw[2]) * 1000;
                      return {
                        warning:
                          duration > 0 ? "" : "must be longer that 0 second",
                        value: duration > 0 ? duration : "",
                      };
                    }

                    if ((raw = input.match(/^\d+$/))) {
                      let duration = Number(raw[0]) * 1000;
                      return {
                        warning:
                          duration > 0 ? "" : "must be longer that 0 second",
                        value: duration > 0 ? duration : "",
                      };
                    }

                    return { warning: "invalid format", value: "" };
                  },
                },
                ctx
              ),
              ..._timer_Adder_Field(
                {
                  ns: ns + "._messageField",
                  field: "Message",
                  required: 0,
                  placeholder: "(optional) enter completion message",
                  initial: "Time's up!",
                  validator: (input) => ({
                    warning: "",
                    value: input.length > 0 ? input : "Time's up!",
                  }),
                },
                ctx
              ),
            ],
          },
        },
        {
          button: {
            class: "start-btn",
            text: "Add Timer",
            onclick: () => {
              if (
                getState(ns + "._nameField.w").length ||
                getState(ns + "._durationField.w").length ||
                getState(ns + "._messageField.w").length
              ) {
                console.warn("Validation failed.");
              } else {
                let newTimerData = new TimerData(
                  getState(ns + "._nameField.d"),
                  getState(ns + "._durationField.d"),
                  getState(ns + "._messageField.d")
                );
                setState(timerList + "._" + newTimerData.id, newTimerData);
              }
            },
          },
        },
      ],
    },
  };
};

// timer list item
const _timer_List_node = (props, ctx) => {
  let { getState, setState } = ctx;
  let { ns } = props;

  let thisNode = {
    name: ns + ".name",
    message: ns + ".message",
    duration: ns + ".duration",
    id: ns + ".id",
    states: ns + ".states",
    remainder: ns + ".remainder",
    end: ns + ".end",
  };

  let peekState = { remainder: 0, end: 0 };
  let intervalId;

  return {
    div: {
      class: "timer",

      sync_LS: () => {
        let value;
        if ((value = getState(ns))) {
          localStorage.setItem(ns, JSON.stringify(value));
        }
      },

      sync_peekState_remainder: () => {
        peekState.remainder = getState(thisNode.remainder);
      },
      sync_peekState_end: () => {
        peekState.end = getState(thisNode.end);
      },
      phase: () => {
        switch (getState(thisNode.states)) {
          case TimerData.State.running:
            peekState.end = Date.now() + peekState.remainder;
            setState(thisNode.end, peekState.end);
            intervalId = setInterval(() => {
              let remainder = Math.max(0, peekState.end - Date.now());
              setState(thisNode.remainder, remainder);
              if (remainder <= 0) {
                setState(thisNode.states, TimerData.State.finished);
                new Audio("notification.mp3").play();
                clearInterval(intervalId);
              }
            }, 500);
            break;
          case TimerData.State.paused:
            clearInterval(intervalId);
            break;
        }
      },
      children: [
        {
          div: {
            class: "timer-name",
            text: () => getState(thisNode.name),
          },
        },
        {
          div: {
            class: "timer-remainder",
            text: () => {
              let millis = getState(thisNode.remainder);
              let seconds = Math.floor(millis / 1000);
              let minutes = Math.floor(seconds / 60);
              seconds = seconds % 60;
              minutes = minutes % 60;
              return `${String(minutes).padStart(2, "0")}:${String(
                seconds
              ).padStart(2, "0")}`;
            },
          },
        },
        {
          div: {
            class: "message",
            text: () =>
              getState(thisNode.remainder) > 1
                ? ""
                : `${getState(thisNode.message)}`,
          },
        },
        {
          div: {
            class: "button-container",
            children: [
              {
                button: {
                  class: "start-btn",
                  text: "Start",
                  onclick: () => {
                    if (getState(thisNode.states) == TimerData.State.paused)
                      setState(thisNode.states, TimerData.State.running);
                  },
                },
              },
              {
                button: {
                  class: "pause-btn",
                  text: "Pause",
                  onclick: () => {
                    if (getState(thisNode.states) == TimerData.State.running)
                      setState(thisNode.states, TimerData.State.paused);
                  },
                },
              },
              {
                button: {
                  class: "reset-btn",
                  text: "Reset",
                  onclick: () => {
                    setState(thisNode.states, TimerData.State.paused);
                    setState(thisNode.remainder, getState(thisNode.duration));
                  },
                },
              },
              {
                button: {
                  class: "delete-btn",
                  text: "Delete",
                  onclick: () => {
                    clearInterval(intervalId);
                    setState(thisNode.states, TimerData.State.paused);
                    let [all, parentNs, thisProperty] =
                      ns.match(/(^.*)\.(\w*$)/);
                    let { [thisProperty]: _, ...newParentNs } =
                      getState(parentNs);
                    setState(parentNs, newParentNs);
                    localStorage.removeItem(ns);
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
};

const _timer_List = (props, ctx) => {
  let { getState } = ctx;
  let { ns } = props;

  return {
    div: {
      id: "timerList",
      children: () => {
        if (getState(ns)) {
          let subNodeList = Object.keys(getState(ns));
          return subNodeList.map((id) => ({
            _timer_List_node: { ns: ns + "." + id },
          }));
        }
      },
    },
  };
};

function dumpLS() {
  let result = {};
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let value = JSON.parse(localStorage.getItem(key));
    let ptr = result;
    key.split(".").forEach((token, idx, arr) => {
      if (!(token in ptr)) ptr[token] = {};
      if (idx != arr.length - 1) ptr = ptr[token];
      else ptr[token] = value;
    });
  }
  return result;
}

// app
const app = new Juris({
  states: dumpLS(),
  components: {
    _timer_Adder,
    _timer_List,
    _timer_List_node,
  },
  layout: [
    { _timer_Adder: { ns: "_timer._adder" } },
    { _timer_List: { ns: "_timer._list" } },
  ],
});
app.render("#app");
