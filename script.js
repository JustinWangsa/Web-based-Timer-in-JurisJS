const TimerItem = (props, context) => {
    const { getState, setState } = context;
    const { timerId } = props;

    return {
        render: () => ({
            div: {
                className: 'timer-item',
                children: () => {
                    const timer = getState(`timers.${timerId}`);
                    if (!timer) return null;

                    return [
                        { span: { text: `${timer.name} - ${Math.floor(timer.remainSec/60).toString().padStart(2,'0')}:${(timer.remainSec%60).toString().padStart(2,'0')} - ${timer.status}` } },
                        { div: {
                            className: 'timer-controls',
                            children: [
                                (timer.status !== 'running' && timer.status !== 'done') ? { button: { text: 'Start', onclick: () => {
                                    const now = Date.now();
                                    setState(`timers.${timerId}.status`, 'running');
                                    setState(`timers.${timerId}.endsAt`, now + timer.remainSec*1000);
                                }}} : null,
                                (timer.status === 'running') ? { button: { text: 'Pause', onclick: () => {
                                    const now = Date.now();
                                    const remain = Math.max(0, Math.ceil((timer.endsAt - now)/1000));
                                    setState(`timers.${timerId}.status`, 'paused');
                                    setState(`timers.${timerId}.remainSec`, remain);
                                    setState(`timers.${timerId}.endsAt`, null);
                                }}} : null,
                                { button: { text: 'Reset', onclick: () => {
                                    setState(`timers.${timerId}.status`, 'idle');
                                    setState(`timers.${timerId}.remainSec`, timer.durationSec);
                                    setState(`timers.${timerId}.endsAt`, null);
                                }}},
                                { button: { text: 'Delete', onclick: () => {
                                    const timers = getState('timers');
                                    const { [timerId]: removed, ...rest } = timers;
                                    setState('timers', rest);
                                    const list = getState('timerList', []);
                                    setState('timerList', list.filter(id => id !== timerId));
                                }}} 
                            ].filter(Boolean)
                        }}
                    ];
                }
            }
        })
    };
};

const TimersApp = (props, context) => {
    const { getState, setState } = context;

    function parseDuration(s) {
        if (!s) return 0;
        if (s.includes(':')) {
            const [m, sec] = s.split(':').map(Number);
            return m*60 + sec;
        }
        return parseInt(s) || 0;
    }

    return {
        render: () => ({
            div: {
                className: 'timers-app',
                children: [
                    { h1: { text: 'Multi-Timer App' } },
                    {
                        div: {
                            className: 'form',
                            children: [
                                { input: { placeholder: 'Name', value: () => getState('newName',''), oninput: e => setState('newName', e.target.value) }},
                                { input: { placeholder: 'Duration (ss or mm:ss)', value: () => getState('newDuration',''), oninput: e => setState('newDuration', e.target.value) }},
                                { input: { placeholder: 'Message', value: () => getState('newMessage',''), oninput: e => setState('newMessage', e.target.value) }},
                                { button: { text: 'Add', onclick: () => {
                                    const name = getState('newName').trim() || 'Timer';
                                    const dur = parseDuration(getState('newDuration').trim());
                                    const msg = getState('newMessage').trim() || "Time's up!";
                                    if(dur<=0) return alert('Enter valid duration');
                                    const id = Date.now().toString();
                                    const t = { id, name, durationSec: dur, remainSec: dur, status:'idle', endsAt:null, message: msg };
                                    setState(`timers.${id}`, t);
                                    setState('timerList', [id, ...getState('timerList',[])]);
                                    setState('newName',''); setState('newDuration',''); setState('newMessage','');
                                }}} 
                            ]
                        }
                    },
                    { div: {
                        children: () => getState('timerList', []).map(id => ({ TimerItem: { timerId: id, key: id } }))
                    }}
                ]
            }
        })
    };
};

const juris = new Juris({
    components: { TimersApp, TimerItem },
    layout: { div: { children: [{ TimersApp: {} }] } },
    states: { timers: {}, timerList: [], newName: '', newDuration: '', newMessage: '' }
});

juris.render('#app');

setInterval(() => {
    const timerIds = juris.getState('timerList');
    const now = Date.now();

    timerIds.forEach(id => {
        const timer = juris.getState(`timers.${id}`);
        if (timer && timer.status === 'running') {
            const remain = Math.max(0, Math.ceil((timer.endsAt - now)/1000));
            juris.setState(`timers.${id}.remainSec`, remain);

            if (remain === 0) {
                juris.setState(`timers.${id}.status`, 'done');
                juris.setState(`timers.${id}.endsAt`, null);
                alert(`${timer.name}: ${timer.message}`);
            }
        }
    });
}, 1000);
