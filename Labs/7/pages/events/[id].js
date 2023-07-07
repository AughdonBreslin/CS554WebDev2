import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import useSWR from 'swr';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA';
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const Id = () => {
    const router = useRouter();
    let { id } = router.query;
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=${API_KEY}&countryCode=US`, fetcher)

    if (error) {
        if (error.message.includes('Failed to fetch')) return router.push('/404');
        return <p>Error: {error.message}</p>;
    }

    if (data) { console.log(data);}
    else return <p>Loading...</p>;
    let event = data;

    return (
        <div className='card-page' key={event.id || event.url}>
            <h1 className='card-title'>{event.name}</h1>
            <NavBar />
            <img className='card-image' src={event.images[0].url} alt={event.name} />
            <p className='card-text'>{event.dates.start.localDate}, {event.dates.start.localTime}</p>
            <p className='card-text'>{event.classifications[0].genre.name}, {event.classifications[0].segment.name}, {event.classifications[0].subGenre.name}</p>
            <p className='card-text'>{event._embedded.venues[0].name}, {event._embedded.venues[0].city.name}, {event._embedded.venues[0].state.name}</p>
            <p className='card-text'>{event.info}</p>
            <p className='card-text'>${event.priceRanges[0].min}-{event.priceRanges[0].max}</p>
            <p className='card-text'>{event.ticketLimit.info}</p>
        </div>
    )
}

export default Id;