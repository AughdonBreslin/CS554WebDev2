import { useRouter } from 'next/router';
import NavBar from '../../../components/NavBar';
import Link from 'next/link';
import useSWR from 'swr';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA';
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const Page = () => {
    const router = useRouter();
    let { page } = router.query;
    if (!page) page = 1;
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/events/?page=${page}&apikey=${API_KEY}&countryCode=US`, fetcher)

    // if the page is less than 1 or greater than 49, reroute to /404 page
    if (page < 1 || page > 49) {
        router.push('/404');
    }

    if (error) {
        if (error.message.includes('Failed to fetch')) {
            router.push('/404');
        }
        return <p>Error: {error.message}</p>;
    }

    if (data) {
        console.log(data);
    } else return <p>Loading...</p>;

    async function handleNextClick() {
        console.log(`Clicked next page.`);
        router.push(`/events/page/${parseInt(page) + 1}`);
    }

    async function handlePrevClick() {
        console.log(`Clicked previous page.`);
        router.push(`/events/page/${parseInt(page) - 1}`);
    }

    const buildCard = (event) => {
        return (
            <li className='card' key={event.id || event.url}>
                <Link className='card-title' href={`/events/${event.id}`}>{event.name}</Link>
                <p className='card-text'>{event.dates.start.localDate}, {event.dates.start.localTime}</p>
                <p className='card-text'>{event.classifications[0].genre.name}, {event.classifications[0].segment.name}, {event.classifications[0].subGenre.name}</p>
                <p className='card-text'>{event._embedded.venues[0].name}, {event._embedded.venues[0].city.name}, {event._embedded.venues[0].state.name}</p>
                <p className='card-text'>{event.priceRanges && event.priceRanges[0].min && event.priceRanges[0].max && "$"+event.priceRanges[0].min + " - $" + event.priceRanges[0].max}</p>
                <p className='card-text'>{event.ticketLimit && event.ticketLimit.info && " | " + event.ticketLimit.info}</p>
                {event.url && <a className="card-link" href={event.url}>View Tickets</a>}
                {event.images && event.images[0].url &&
                <img className="card-image" src={event.images[0].url} alt={event.name} width="95%" height="45%"/>}
            </li>
        )
    };

    return (
        <div>
            <h1>Events</h1>
            <NavBar />
            <button className='page-button' onClick={handlePrevClick} disabled={page <= 1}>Previous Page</button>
            <button className='page-button' onClick={handleNextClick} disabled={page >= 49}>Next Page</button>
            <ul className='card-container'>
                {data._embedded.events.map((event) => buildCard(event))}
            </ul>
        </div>
    );
};

export default Page;