import React, {useEffect, useState} from 'react';

const API_KEY = 'eb0b1c8af83f7dae6f8e662459f85a6c';

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <div className="intro">
                <p className='funky'>Welcome to the React-Redux Marvel API Lab!</p>
                <p className='funky'>Here you can view, add, and delete Marvel characters and collectors.</p>
                <p className='funky'>Marvel characters are fetched from the Marvel API and cached in a redis server for added optimization.</p>
                <p className='funky'>Click on the links above to get started.</p>
            </div>
            <footer className='funky'> Aughdon Breslin </footer>
        </div>
    );
}

export default Home;