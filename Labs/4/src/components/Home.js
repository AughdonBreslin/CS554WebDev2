
import React, { useEffect, useState } from 'react';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`https://app.ticketmaster.com/discovery/v2/events/?apikey=${API_KEY}&countryCode=US`)
        .then(res => res.json())
        .then(
            (result) => {
            setIsLoading(false);
            setData(result);
        },
        (error) => {
            setIsLoading(false);
            setError(error);
        }
        )
    }, []);

    if (isLoading) return 'Loading...';

    // if the error is failed to fetch, redirect to a 404 page
    if (error) {
        if (error.message === 'Failed to fetch') {
            window.location.href = '/404';
            return 'Error 404: Page not found.'
        } else {
            return 'An error has occurred: ' + error.message;
        }
    }

    return (
        <div>
            <h1>Home</h1>
            <div className="intro">
                <p>Welcome to the Ticketmaster API Lab!</p>
                <p>Here you can search for events, venues, and attractions.</p>
                <p>Click on the links above to get started.</p>
            </div>
        </div>
    );
}

export default Home;
