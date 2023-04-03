
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Event() {
    const { id } = useParams();
    const config = {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    const {isLoading, error, data} = useQuery(['event', id], () => axios.get(`https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=${API_KEY}&countryCode=US`, config));
    
    if (isLoading) return 'Loading...';

    // if the error is failed to fetch, redirect to a 404 page
    if (error) {
        if (error.message === 'Failed to fetch' || error.message === 'Request failed with status code 404') {
            window.location.href = '/404';
            return 'Error 404: Page not found.'
        } else {
            window.location.href = `/500/${error.message}`;
            return 'An error has occurred: ' + error.message;
        }
    }

    if (data.data) console.log(data.data);
    let event = data.data;

    return (
        <ul>
            <div className='card' key={event.id || event.url}>
                <div className='card-body'>
                    <li key={event.id} className="card-title">
                        {event.name && event.name}
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
                    <li className="card-text">
                        {event.url && <a className="card-link" href={event.url}>View Tickets</a>}
                    </li>
                    {event.images && event.images[0].url &&
                    <li className="card-image">
                        <img src={event.images[0].url} alt={event.name} width="95%" height="45%"/>
                    </li>}
                </div>
            </div>
        </ul>

    );
}

export default Event;
