
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import SearchBar from './SearchBar';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Events() {
    let { page } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [searchData, setSearchData] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(49);
    let card = null;

    // Events, no page
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/events/?apikey=${API_KEY}&countryCode=US`)
                .then(response => response.json())
                .then(data => {
                    setData(data);
                    setTotalPages(data.page.totalPages);
                    setIsLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    console.log(error);
                });
        }
        if (!page) {
            console.log(`No page; defaulting to page 1.`);
            fetchData();
        }
    }, []);

    // Events, with page
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/events?page=${page}&apikey=${API_KEY}&countryCode=US`)
                .then(response => response.json())
                .then(data => {
                    setData(data);
                    setTotalPages(data.page.totalPages);
                    setIsLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    console.log(error);
                });
        }
        if (page) {
            if (page < 1) {
                page = 1;
                console.log(`Page input less than 1. Defaulting to page ${page}.`)
                window.location.href = '/events/page/1';
            }
            if (page > 49) {
                page = 49;
                console.log(`Page input greater than 49. Defaulting to page ${page}.`);
                window.location.href = '/events/page/49';
            } else {
                console.log(`Page ${page}.`);
            }
            fetchData();
        }
    }, []);

    // Events, search
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/events?keyword=${searchTerm}&apikey=${API_KEY}&countryCode=US`)
                .then(response => response.json())
                .then(data => {
                    setSearchData(data);
                    setTotalPages(data.page.totalPages);
                    setIsLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    console.log(error);
                });
        }
        if (searchTerm) {
            console.log(`Search term: ${searchTerm}.`);
            fetchData();
        }
    }, [searchTerm]);

    const searchValue = async (value) => {
        setSearchTerm(value);
    };

    const buildCard = (event) => {
        return (
            <div className='card' key={event.id || event.url}>
                <div className='card-body'>
                    <li key={event.id} className="card-title">
                        <a className='card-link' href={`/events/${event.id}`}>
                            {event.name && event.name}
                        </a>
                    </li>
                    <li className="card-text">
                        {event.dates.start.localDate && event.dates.start.localDate}
                    </li>
                    <li className="card-text">
                        {event._embedded.venues[0].name && event._embedded.venues[0].name+ ", "}
                        {event._embedded.venues[0].city.name && event._embedded.venues[0].state.name && event._embedded.venues[0].city.name+ ", " +event._embedded.venues[0].state.name}
                    </li>
                    <li className="card-text">
                        {event.priceRanges && event.priceRanges[0].min && event.priceRanges[0].max && "$"+event.priceRanges[0].min + " - $" + event.priceRanges[0].max}
                        {event.ticketLimit && event.ticketLimit.info && " | " + event.ticketLimit.info}
                    </li>
                    {event.images && event.images[0].url &&
                    <li className="card-image">
                        <img src={event.images[0].url} alt={event.name} width="95%" height="45%"/>
                    </li>}
                </div>
            </div>
        );
    }

    async function handleNextClick() {
        console.log('Clicked Next.')
        page = parseInt(page) + 1;
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/events?page=${page}&apikey=${API_KEY}&countryCode=US`)
                .then(response => response.json())
                .then(data => {
                    setData(data);
                    setTotalPages(data.page.totalPages);
                    setIsLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    console.log(error);
                });
        }
        console.log(`Page ${page}.`);
        await fetchData();
    }

    async function handlePreviousClick() {
        console.log('Clicked Previous.')
        page = parseInt(page) - 1;
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/events?page=${page}&apikey=${API_KEY}&countryCode=US`)
                .then(response => response.json())
                .then(data => {
                    setData(data);
                    setTotalPages(data.page.totalPages);
                    setIsLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setIsLoading(false);
                    console.log(error);
                });
        }
        console.log(`Page ${page}.`);
        await fetchData();
    }

    
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

    if (data) console.log(data);

    if (searchTerm) {
        card = searchData && searchData._embedded && searchData._embedded.events && searchData._embedded.events.map(buildCard);
        console.log(card);
    } else {
        card = data && data._embedded && data._embedded.events && data._embedded.events.map(buildCard);
    }

    return (
        <div>
            <h1>Events</h1>
            <SearchBar searchValue={searchValue}/>
            <br />
            <br />
            <div>
                {page > 1 && (
                    <Link to={`/events/page/${parseInt(page)-1}`}>
                        <button className="button" onClick={handlePreviousClick}>Previous</button>
                    </Link>
                )}
                {page < 49 && ( // i tried so many things but i cant get damn page limit and i know its gonna be so simple but i dont know it and maybe that makes me dumb.
                    <Link to={`/events/page/${parseInt(page)+1}`}>
                        <button className="button" onClick={handleNextClick}>Next</button>
                    </Link>
                )}
            </div>
            <ul>
                {card}
            </ul>
        </div>
    );
}

export default Events;
