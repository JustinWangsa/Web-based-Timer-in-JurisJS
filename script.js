const Counter = (props, context) => {
    const { getState, setState } = context;

    return {
        render: () => ({
            div: {
                className: 'multi-timer',
                children: [
                    {
                        h1: {
                            className: 'timer-title',
                            text: 'Juris Multi Timer'
                        }
                    },
                    {
                        div: {
                            className: 'timer-main'
                        }
                    }
                ]
            }
        })
    }
}