import './App.js';
import Child from './Child'



function PropsExample(props) {
    let h1 = null;
    if (props.greeting) {
        h1 = <h1>{props.greeting}</h1>;
    } else {
        h1 = <h1>Hello There!</h1>;
    }
    return (
        <div>
            {h1}
            <h2>{props.user.name}</h2>
            <button onClick = {props.handleClick}>{props.user.username}</button>
            <Child greeting = {props.greeting}/>
        </div>
    );
}

export default PropsExample;