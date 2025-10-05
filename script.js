

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


/**
 * private state: timerAdder.d_field, timerAdder.w_field
 * @param {{field:string, validator:(input:string)=>{warning:string,value:any}, required:boolean, placeholder:string}} props 
 * @param {*} ctx 
 * @returns 
 */
const timerAdder_Field = (props, ctx)=>{
    //unpack props 
    let {field,validator,required,placeholder} = props;
    let {getState,setState} = ctx;
    
    //private state
    let d_field = 'timerAdder.d_'+field;           
    setState(d_field,'');
    let w_field = 'timerAdder.w_'+field;           
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
const timerAdder=(props, ctx)=>{//TODO CSS timerAdder
    //unpack param
    let {getState,setState} = ctx;

    // setState('TimerData'); shared with TimerList

    return {
        div:{
            id: 'timerAdder',//id is for css
            children:[
                
                //timerAdderfields
                {div:{
                    class:'timerAdderField',
                    children:[
                        ...timerAdder_Field({
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

                        ...timerAdder_Field({
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

                        ...timerAdder_Field({
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
                                
                             
                                if( getState('timerAdder.w_name').length 
                                    ||getState('timerAdder.w_duration').length 
                                    ||getState('timerAdder.w_message').length 
                                ){
                                    console.log(
                                        '\nname:', getState('timerAdder.w_name'),
                                        '\nduration:', getState('timerAdder.w_duration'),
                                        '\nmessage:', getState('timerAdder.w_message')
                                    );
                                } else {
                                    let newTimerData = new TimerData(
                                        getState('timerAdder.d_name'),
                                        getState('timerAdder.d_duration'),
                                        getState('timerAdder.d_message')
                                    );
                                    setState('TimerData'+'',newTimerData);//TODO where to save the new TimerData?
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
const timerList_node = (props, {getState,setState})=>{
    return {
        div:{
            id:'timerList_node',
            children:[
                {div:{text:'[name]'}},
                {div:{text:'[time]'}},
                {div:{text:'[message]'}},
                {button:{text:'start'}},
                {button:{text:'pause'}},
                {button:{text:'reset'}},
                {button:{text:'delete'}},
            ]
        }
    }
};

//TODO implement timerList 
const timerList = (props, {getState,setState})=>{

    return {
        div:{
            id:'timerList',
            children:[
                
            ]
        }
    }
};
const testNode = (props, {getState,setState})=>{
    setState('mydata',{a:10});
    
    

    return {
        div:{
            children:[
                {div:{
                    text:()=>JSON.stringify(getState('mydata')),
                    
                }},
                {button:{
                    text:'click',
                    onclick:()=>{
                        // setState('mydata.b',12);
                        let mydata = getState('mydata');
                        Object.defineProperty(mydata,'b',{
                            value:12,
                        })
                        setState('mydata',mydata);
                        console.log(getState('mydata'));
                        
                    }
                }}
            ]
        }
    }
};


//app
const app = new Juris({
    states:{
        TimerData:{},
    },
    components:{
        timerAdder,
        timerList,
        timerList_node,
        /*  */testNode,
    },
    layout:[
        // {timerAdder:{}},
        {timerList:{}},
        {testNode:{}}
    ],
});
app.render('#app');
