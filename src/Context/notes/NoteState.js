import React, { useState } from "react";
import NoteContext from "./NoteContext";

const NoteState= (props)=>{
    var s1={
        "name": "Harry",
        "class":"5b"
    };
    const [state,setState] = useState(s1);
    const update = ()=>{
        setTimeout(()=>{
            setState({
                "name":"Larry",
                "class":"10b"
            })
        },1000);
    }
    return(
        <NoteContext.Provider value={{state, update}}>
            {props.children}
        </NoteContext.Provider>
    )

}

export default NoteState;