import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import useSWR from 'swr';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA';
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const Id = () => {
    const router = useRouter();
    let { id } = router.query;
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/venues/${id}?apikey=${API_KEY}&countryCode=US`, fetcher)

    if (error) {
        if (error.message.includes('Failed to fetch')) return router.push('/404');
        return <p>Error: {error.message}</p>;
    }

    if (data) { console.log(data);}
    else return <p>Loading...</p>;
    let venue = data;

    return (
        <div className='card-page' key={venue.id || venue.url}>
            <h1 className='card-title'>{venue.name}</h1>
            <NavBar />
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
        </div>
    )
}

export default Id;