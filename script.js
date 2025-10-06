

"use strict";

class TimerData {
    static State = Object.freeze({
        running:'running',
        paused:'paused',
        finished:'finished'
    });

    constructor(name,duration,message) {
        //static
        this.name = name;
        this.duration = duration;
        this.message = message;

        //operational
        this.id = Date.now()+this.name;
        this.states = TimerData.State.paused;
        this.remainder = this.duration;
        this.end = 0;//only relevant when TimerData.State.running
    }
}


//component

//TODO change ns into thisNode
/**
 * private state: timerAdder.d_field, timerAdder.w_field
 * @param {{ns:string, field:string, validator:(input:string)=>{warning:string,value:any}, required:boolean, placeholder:string}} props 
 * @param {*} ctx 
 * @return {*}
 */
const _timer_Adder_Field = (props, ctx)=>{
    //unpack props 
    let {ns,field,validator,required,placeholder} = props;
    let {getState,setState} = ctx;
    
    //private state
    let thisNode = ns;
    let d_field = thisNode+'.d_'+field;           
    setState(d_field,'');
    let w_field = thisNode+'.w_'+field;           
    if(required) setState(w_field,'can not be empty');
    else setState(w_field,'');

    //component
    let lablePart = {div:{
        class:'inputLabel',
        children:{div:{text:field}}
    }}
    ;

    let inputPart = {div:{
        class:'inputBox',
        contenteditable:'true',

        'data-placeholder': placeholder,
        oninput:(e)=>{
            let input = e.target.innerText.trim();
            let {value,warning} = validator(input);

            if(warning.length > 0){
                setState(w_field,warning);
            } else {
                setState(w_field,'');
                setState(d_field,value);
            }
            
            if(input.length == 0){
                e.target.removeChild(e.target.firstChild)
            }

            console.log('value:',value,'warning:',warning);
            
        },
        onkeydown:(e)=>{
            if(e.key === 'Enter'){
                e.preventDefault();
                e.target.blur();
            }
        }
    }}
    ;

    let warningPart = {div:{
        class:'inputWarning',
        children:{div:{text:()=>getState(w_field)}}
    }}
    ;

    return [lablePart,inputPart,warningPart];
    
}
/**
 * @param {{ns:string}} props 
 * @param {*} ctx 
 * @return {*}
 */
const _timer_Adder=(props, ctx)=>{//TODO CSS timerAdder
    //unpack param
    let {getState,setState} = ctx;
    let {ns} = props;

    //state name
    let thisNode = ns+'._Adder';
    let timerList = '_timer._List';
    // setState('TimerData'); shared with TimerList

    return {
        div:{
            id: 'timerAdder',//id is for css
            children:[
                
                //timerAdderfields
                {div:{
                    class:'timerAdderField',
                    children:[
                        ..._timer_Adder_Field({
                            ns:thisNode,
                            field: 'name',
                            required: 1,
                            validator: (input) => {
                                return {
                                    warning:(input.length>0)?''
                                        :'can not be empty'
                                    ,
                                    value:(input.length>0)?input
                                        :''
                                    ,
                                }
                            }, 
                            placeholder:'enter timer name',   
                        },ctx),

                        ..._timer_Adder_Field({
                            ns:thisNode,
                            field: 'duration',
                            placeholder:'enter timer duration',
                            required: 1,
                            validator: (input) => {
                                
                                if(input.length < 1){
                                    return {
                                        warning:'can not be empty',
                                        value:'',
                                    }
                                } 

                                let raw;
                                if (raw = input.match(/^(\d\d):([012345]\d)$/)) {
                                    let duration = 
                                        Number(raw[1]) * 60000// minute to millis
                                        + Number(raw[2]) * 1000// second to millis
                                    ;
                                    return {
                                        warning:(duration>0)?''
                                            :'must be longer that 0 second',
                                        value:(duration>0)?duration
                                            :'',
                                    }
                                } 
                                 
                                if (raw = input.match(/^\d+$/)) {
                                    let duration = Number(raw[0]) * 1000; // minute to millis
                                    return {
                                        warning:(duration>0)?''
                                            :'must be longer that 0 second',
                                        value:(duration>0)?duration
                                            :'',
                                    } 
                                }

                                return {
                                    warning:'invalid format',
                                    value:'',
                                } 
                                
                            },

                        },ctx),

                        ..._timer_Adder_Field({
                            ns:thisNode,
                            field: 'message',
                            required: 0,
                            placeholder:'(optional) enter completion message',
                            validator: (input) => {
                                return {
                                    warning:'',
                                    value:(input.length>0)?input:"Time's up!",
                                }
                                
                                
                            },
                        },ctx),

                    ]
                    
                }},



                //add button
                {div:{
                    children:[
                        {button:{
                            text:'add',
                            onclick:()=>{
                                
                             
                                if( getState(thisNode+'.w_name').length 
                                    ||getState(thisNode+'.w_duration').length 
                                    ||getState(thisNode+'.w_message').length 
                                ){
                                    console.log(
                                        '\nname:', getState(thisNode+'.w_name'),
                                        '\nduration:', getState(thisNode+'.w_duration'),
                                        '\nmessage:', getState(thisNode+'.w_message')
                                    );
                                } else {
                                    let newTimerData = new TimerData(
                                        getState(thisNode+'.d_name'),
                                        getState(thisNode+'.d_duration'),
                                        getState(thisNode+'.d_message')
                                    );
                                    setState(timerList,newTimerData);//TODO where to save the new TimerData?
                                    console.log('added',newTimerData);
                                }

                                

                                
                            }
                        }},
                    ],
                }},



            ],
        }
    }
}




//TODO implement timerNode 
/**
 * 
 * @param {{ns:string}} props 
 * @param {*} ctx 
 * @returns {*}
 */
const _timer_List_node = (props, ctx)=>{
    //upacking param
    let {getState,setState} = ctx;
    let {ns} = props;
    

    //state variable name
    
    let thisNode = {
        name      : ns+'.name',
        message   : ns+'.message',
        duration  : ns+'.duration',
        id        : ns+'.id',
        states    : ns+'.states',
        remainder : ns+'.remainder',
        end       : ns+'.end',
    };

    

    //peekState alternative. for some devine reason, Juris refuse to implement a way to read a data whilst not subscribe to said data
    let peekState = {
        remainder:0,
        end:0,
    };
    //this is just a weak patch since the synchronization handler below will only take effect synchronously. simply put if a handler modified a state, this data will only be updated once the handler finishes execution.

    


    //logic
    let intervalId;//in hindsight, having a setTimeout that will trigger a handler specifically when the timer ends, should result in a more accurate timer
    return {
        div:{
            class:'timerList_node',
            
            //synchonization 
            sync_LS:()=>{
                //TODO sync with localStorage
            },
            sync_peekState_remainder:()=>{
                peekState.remainder = getState(thisNode.remainder);
            },
            sync_peekState_end:()=>{
                peekState.end = getState(thisNode.end);
            },

            //Timer state system
            phase:()=>{
                switch(getState(thisNode.states)){
                    case TimerData.State.running:
                        peekState.end = Date.now() + peekState.remainder;
                        setState(thisNode.end, 
                            peekState.end
                        );
                        
                        intervalId = setInterval(()=>{
                            let remainder = Math.max(
                                0, peekState.end - Date.now()
                            );
                            setState(thisNode.remainder,remainder);
                            if(remainder <= 0){
                                setState(thisNode.states,TimerData.State.finished);
                                clearInterval(id);
                            }
                        },500);
                    break;

                    case TimerData.State.paused:
                        clearInterval(intervalId);
                    break;

                    case TimerData.State.finished:break;
                }
            },
            children:[
                {div:{text:()=>getState(thisNode.name)}},
                {div:{text:()=>{
                    let millis = getState(thisNode.remainder);
                    let seconds = Math.floor(millis/1000);
                    let minutes = Math.floor(seconds/60);

                    seconds = seconds%60;
                    minutes = minutes%60;

                    seconds = String(seconds).padStart(2,'0');
                    minutes = String(minutes).padStart(2,'0');

                    return `${minutes}:${seconds}`;
                }}},
                {div:{text:()=>{
                    if(getState(thisNode.duration) > 1){
                        return `--[${getState(thisNode.message)}]--`;
                    } else {
                        return `${getState(thisNode.message)}`;

                    }
                }}},
                {button:{
                    text:'start',
                    onclick:()=>{
                        if(getState(thisNode.states) == TimerData.State.paused){
                            setState(thisNode.states,TimerData.State.running);
                        }
                    }
                }},
                {button:{
                    text:'pause',
                    onclick:()=>{
                        if(getState(thisNode.states) == TimerData.State.running){
                            setState(thisNode.states,TimerData.State.paused);
                        }
                        
                    }
                    
                }},
                {button:{
                    text:'reset',
                    onclick:()=>{
                        setState(thisNode.states,TimerData.State.paused);
                        setState(thisNode.remainder,
                            getState(thisNode.duration)
                        );
                    }
                    
                }},
                {button:{
                    text:'delete',
                    onclick:()=>{
                    }
                    
                }},
            ]
        }
    }
};

//TODO implement timerList 
const _timer_List = (props, {getState,setState})=>{


    return {
        div:{
            id:'timerList',
            children:[
                
            ]
        }
    }
};
const testNode = (props, ctx)=>{
    let {getState,setState,peekState} = ctx;
    // setState('mydata',10);
    
    setState('aaa',11)
    let aaa;

    return {
        div:{
            internalSync:()=>{
                aaa = getState('aaa');
                console.log('internal:',aaa);
            },
            children:[
                {button:{ text:'click', onclick:()=>{
                    setState('aaa',getState('aaa')+1);      
                }}}
            ]
        }
        
    }
};



//extracting localstorage

function dumpLS(){
    let result = {};
    for(let i = 0; i< localStorage.length; i++){
        let key = localStorage.key(i);
        let valueRaw = localStorage.getItem(key);
        let value = JSON.parse(valueRaw);

        
        let ptr = result;
        key.split('.').forEach((token,idx,arr)=>{
            if(!(token in ptr)){
                ptr[token] = {}
            }

            if(idx != arr.length-1){
                ptr = ptr[token];
            } else {
                ptr[token] = value;
            }

        })

    }
    return result;
}

let arg = dumpLS();

/*  */let timerData = new TimerData('birthday',10000,"time's up");
// app
const app = new Juris({
    states:{
        [''+timerData.id]:timerData,
    },
    components:{
        _timer_Adder,
        _timer_List,
        _timer_List_node,
        /*  */testNode,
    },
    layout:[
        // {timerAdder:{}},
        // {timerList:{}},
        /*  */{_timer_List_node:{ns:''+timerData.id}},
        /*  */{testNode:{}}
    ],
});
app.render('#app');
