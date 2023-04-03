
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import Venues from './Venues';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA'

function Venue() {
    const { id } = useParams();
    const config = {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    const {isLoading, error, data} = useQuery(['venue', id], () => axios.get(`https://app.ticketmaster.com/discovery/v2/venues/${id}?apikey=${API_KEY}&countryCode=US`, config));

    if (isLoading) return 'Loading...';

    // if the error is failed to fetch, redirect to a 404 page
    if (error) {
        window.location.href = '/404';
        return 'Error 404: Page not found.'
    }

    if (data.data) console.log(data.data);
    let venue = data.data;

    return (
        <ul>
            <div className='card' key={venue.id || venue.url}>
                <div className='card-body'>
                    <li key={venue.id} className="card-title">
                        {venue.name && venue.name}
                    </li>
                    <li className="card-text">
                        {venue.url && 
                        <a className="card-link" href={venue.url}>Upcoming Events</a>}
                    </li>
                    <li className="card-text">
                        {venue.address && venue.address.line1 && venue.address.line1}
                        {venue.city && venue.city.name && ', ' + venue.city.name}
                        {venue.state && venue.state.name && ', ' + venue.state.name}
                    </li>
                    <li className="card-image">
                        {venue.images && venue.images[0].url &&
                        <img src={venue.images[0].url} alt={venue.name} width="95%" height="45%"/>}
                    </li>
                    <li className="card-text">
                        {venue.accessibleSeatingDetail && venue.accessibleSeatingDetail}
                    </li>
                    <li className="card-text">
                        {venue.generalInfo && venue.generalInfo.generalRule && venue.generalInfo.generalRule}
                    </li>
                    <li className="card-text">
                        {venue.generalInfo && venue.generalInfo.childRule && venue.generalInfo.childRule}
                    </li>
                </div>
            </div>
        </ul>
    );
}

export default Venue;
