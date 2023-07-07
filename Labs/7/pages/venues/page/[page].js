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
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/venues/?page=${page}&apikey=${API_KEY}&countryCode=US`, fetcher)

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
        router.push(`/venues/page/${parseInt(page) + 1}`);
    }

    async function handlePrevClick() {
        console.log(`Clicked previous page.`);
        router.push(`/venues/page/${parseInt(page) - 1}`);
    }

    const buildCard = (venue) => {
        return (
            <li className='card' key={venue.id || venue.url}>
                <Link className='card-title' href={`/venues/${venue.id}`}>{venue.name}</Link>
                <p className='card-text'>{venue.address.line1}, {venue.city.name}, {venue.state.name}</p>
                {venue.boxOfficeInfo && venue.boxOfficeInfo.phoneNumberDetail && venue.boxOfficeInfo.openHoursDetail &&
                <p className='card-text'>{venue.boxOfficeInfo.phoneNumberDetail}, {venue.boxOfficeInfo.openHoursDetail}</p>}
                {venue.images && venue.images[0].url &&
                <img className="card-image" src={venue.images[0].url} alt={venue.name} width="95%" height="45%"/>}
                {venue.social && venue.social.twitter &&
                <p className='card-text'>Twitter: {venue.social.twitter.handle}</p>}
                {venue.social && venue.social.facebook &&
                <p className='card-text'>Facebook: {venue.social.facebook.handle}</p>}
                {venue.social && venue.social.instagram &&
                <p className='card-text'>Instagram: {venue.social.instagram.handle}</p>}
                {venue.social && venue.social.youtube &&
                <p className='card-text'>YouTube: {venue.social.youtube.handle}</p>}
                {venue.generalInfo && venue.generalInfo.generalRule &&
                <p className='card-text'>General Rule: {venue.generalInfo.generalRule}</p>}
            </li>
        )
    };

    return (
        <div>
            <h1>Venues</h1>
            <NavBar />
            <button className='page-button' onClick={handlePrevClick} disabled={page <= 1}>Previous Page</button>
            <button className='page-button' onClick={handleNextClick} disabled={page >= 49}>Next Page</button>
            <ul className='card-container'>
                {data._embedded.venues.map((venue) => buildCard(venue))}
            </ul>
        </div>
    );
};

export default Page;