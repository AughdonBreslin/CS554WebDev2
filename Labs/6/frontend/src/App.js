import logo from './logo.svg';
import Home from './components/Home';
import MarvelCharacters from './components/MarvelCharacters';
import MarvelCharacter from './components/MarvelCharacter';
import Collectors from './components/Collectors';

import './App.css';
import {NavLink, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {
  return (
    <div>
      <Router>
        <nav>
          <h1>React-Redux Marvel API Lab</h1>
          <NavLink className='navlink' to='/'>
            Home
          </NavLink>
          <NavLink className='navlink' to='/marvel-characters/page/1'>
            Characters
          </NavLink>
          <NavLink className='navlink' to='/collectors'>
            Collectors
          </NavLink>
        </nav>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/marvel-characters/page/:page" element={<MarvelCharacters/>}/>
          <Route exact path="/marvel-characters/:id" element={<MarvelCharacter/>}/>
          <Route exact path="/collectors" element={<Collectors/>}/>
          <Route path="/404" element={<h1>Error 404: Page not found.</h1>}/>
          <Route path="*" element={
            <div>
              <h1 className="info">Error 601: Invalid location specified.</h1>
              <p className="info">Please navigate to '/', '/marvel-characters/page/1', '/marvel-characters/:id', or '/collectors'.</p>
            </div>
          }/>
        </Routes>
      </Router>
    </div>

  );
}

export default App;
