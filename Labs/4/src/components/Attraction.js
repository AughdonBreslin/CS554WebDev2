
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Attraction() {
    const { id } = useParams();
    const config = {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    const {isLoading, error, data} = useQuery(['attraction', id], () => axios.get(`https://app.ticketmaster.com/discovery/v2/attractions/${id}?apikey=${API_KEY}&countryCode=US`, config));

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

    if (data.data) console.log(data.data);
    let attraction = data.data;

    return (
        <ul>
            <div className='card' key={attraction.id || attraction.url}>
                <div className='card-body'>
                    <li key={attraction.id} className="card-title">
                        {attraction.name && attraction.name}
                    </li>
                    <li className="card-text">
                        {attraction.url && 
                        <a className="card-link" href={attraction.url}>Upcoming Events</a>}
                    </li>
                    {attraction.externalLinks &&
                    <li className="card-text">
                        {attraction.externalLinks.homepage && attraction.externalLinks.homepage[0].url && <a className="card-link" href={attraction.externalLinks.homepage[0].url}>Home Page</a>}
                        {attraction.externalLinks.itunes && attraction.externalLinks.itunes[0].url && <a className="card-link" href={attraction.externalLinks.itunes[0].url}>iTunes</a>}
                        {attraction.externalLinks.youtube && attraction.externalLinks.youtube[0].url && <a className="card-link" href={attraction.externalLinks.youtube[0].url}>YouTube</a>}
                        {attraction.externalLinks.facebook && attraction.externalLinks.facebook[0].url && <a className="card-link" href={attraction.externalLinks.facebook[0].url}>Facebook</a>}
                        {attraction.externalLinks.twitter && attraction.externalLinks.twitter[0].url && <a className="card-link" href={attraction.externalLinks.twitter[0].url}>Twitter</a>}
                        {attraction.externalLinks.instagram && attraction.externalLinks.instagram[0].url && <a className="card-link" href={attraction.externalLinks.instagram[0].url}>Instagram</a>}
                        {attraction.externalLinks.wiki && attraction.externalLinks.wiki[0].url && <a className="card-link" href={attraction.externalLinks.wiki[0].url}>Wikipedia</a>}
                    </li>}
                    <li className="card-image">
                        {attraction.images && attraction.images[0].url &&
                        <img src={attraction.images[0].url} alt={attraction.name} width="95%" height="45%"/>}
                    </li>
                </div>
            </div>
        </ul>

    );
}

export default Attraction;