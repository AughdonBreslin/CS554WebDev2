import logo from './logo.svg';
import './App.css';
import PropsExample from './PropsExample';

function App() {
  const greeting = "Hello and welcome to react!";
  const handle_func = () => {
    console.log("Hello from within handle_func in App.js");
  }
  return (
    <div className="App">
      <h1>HELLO!</h1>
      <PropsExample greeting = {greeting}
        user = {{name: 'Aughdon Breslin',
               username: 'PieEater'}}
        handleClick = {handle_func}/>
    </div>
  );
}

export default App;
