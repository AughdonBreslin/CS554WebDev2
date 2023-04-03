
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import SearchBar from './SearchBar';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Attractions() {
    let { page } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [searchData, setSearchData] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(49);
    let card = null;

    // Attractions, no page
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/attractions/?apikey=${API_KEY}&countryCode=US`)
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

    // Attractions, with page
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/attractions?page=${page}&apikey=${API_KEY}&countryCode=US`)
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
                window.location.href = '/attractions/page/1';
            }
            if (page > 49) {
                page = 49;
                console.log(`Page input greater than 49. Defaulting to page ${page}.`);
                window.location.href = '/attractions/page/49';
            } else {
                console.log(`Page ${page}.`);
            }
            fetchData();
        }
    }, []);

    // Attractions, search
    useEffect(() => {
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/attractions?keyword=${searchTerm}&apikey=${API_KEY}&countryCode=US`)
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

    const buildCard = (attraction) => {
        return (
            <div className='card' key={attraction.id || attraction.url}>
                <div className='card-body'>
                    <li key={attraction.id} className="card-title">
                        <a className='card-link' href={`/attractions/${attraction.id}`}>
                            {attraction.name && attraction.name}
                        </a>
                    </li>
                    <li className="card-text">
                        {attraction.url && <a className="card-link" href={attraction.url}>Upcoming Events</a>}
                    </li>
                    <li className="card-text">
                        {attraction.externalLinks && attraction.externalLinks.homepage && attraction.externalLinks.homepage[0].url && 
                        <a className="card-link" href={attraction.externalLinks.homepage[0].url}>Home Page</a>}
                    </li>
                    <li className="card-image">
                        {attraction.images && attraction.images[0].url &&
                        <img src={attraction.images[0].url} alt={attraction.name} width="95%" height="45%"/>}
                    </li>
                </div>
            </div>
        );
    }

    async function handleNextClick() {
        console.log('Clicked Next.')
        page = parseInt(page) + 1;
        async function fetchData() {
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/attractions?page=${page}&apikey=${API_KEY}&countryCode=US`)
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
            const fetchUserData = fetch(`https://app.ticketmaster.com/discovery/v2/attractions?page=${page}&apikey=${API_KEY}&countryCode=US`)
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
        card = searchData && searchData._embedded && searchData._embedded.attractions && searchData._embedded.attractions.map(buildCard);
        console.log(card);
    } else {
        card = data && data._embedded && data._embedded.attractions && data._embedded.attractions.map(buildCard);
    }

    return (
        <div>
            <h1>Attractions</h1>
            <SearchBar searchValue={searchValue} />
            <br />
            <br />
            <div>
                {page > 1 && (
                    <Link to={`/attractions/page/${parseInt(page)-1}`}>
                        <button className="button" onClick={handlePreviousClick}>Previous</button>
                    </Link>
                )}
                {page < 49 && ( // hard stop at 49 even though there are more totalPages
                    <Link to={`/attractions/page/${parseInt(page)+1}`}>
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

export default Attractions;