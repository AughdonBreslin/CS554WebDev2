import './App.css'

function Child(props) {
    return (
        <div>
            <p>{props.greeting}</p>
        </div>
    );
}

export default Child;