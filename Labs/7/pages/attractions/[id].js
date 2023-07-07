import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';
import useSWR from 'swr';

const API_KEY = 'ppEoALWRHbyWq3VytqI6NZMAZEPOXtPA';
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const Id = () => {
    const router = useRouter();
    let { id } = router.query;
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/attractions/${id}?apikey=${API_KEY}&countryCode=US`, fetcher)

    if (error) {
        if (error.message.includes('Failed to fetch')) return router.push('/404');
        return <p>Error: {error.message}</p>;
    }

    if (data) { console.log(data);}
    else return <p>Loading...</p>;
    let attraction = data;

    return (
        <div className='card-page' key={attraction.id || attraction.url}>
            <h1 className='card-title'>{attraction.name}</h1>
            <NavBar />
            <img className='card-image' src={attraction.images[0].url} alt={attraction.name} />
            <p className='card-text'>{attraction.classifications[0].genre.name}, {attraction.classifications[0].segment.name}, {attraction.classifications[0].subGenre.name}</p>
            {attraction.url && <a className="card-link" href={attraction.url}>View Upcoming Events</a>}
            {attraction.externalLinks &&
            <div className='external-links'>
                {attraction.externalLinks.homepage && attraction.externalLinks.homepage[0].url && <a className="card-link" href={attraction.externalLinks.homepage[0].url}>Home Page</a>}
                {attraction.externalLinks.itunes && attraction.externalLinks.itunes[0].url && <a className="card-link" href={attraction.externalLinks.itunes[0].url}>iTunes</a>}
                {attraction.externalLinks.youtube && attraction.externalLinks.youtube[0].url && <a className="card-link" href={attraction.externalLinks.youtube[0].url}>YouTube</a>}
                {attraction.externalLinks.facebook && attraction.externalLinks.facebook[0].url && <a className="card-link" href={attraction.externalLinks.facebook[0].url}>Facebook</a>}
                {attraction.externalLinks.twitter && attraction.externalLinks.twitter[0].url && <a className="card-link" href={attraction.externalLinks.twitter[0].url}>Twitter</a>}
                {attraction.externalLinks.instagram && attraction.externalLinks.instagram[0].url && <a className="card-link" href={attraction.externalLinks.instagram[0].url}>Instagram</a>}
                {attraction.externalLinks.wiki && attraction.externalLinks.wiki[0].url && <a className="card-link" href={attraction.externalLinks.wiki[0].url}>Wikipedia</a>}
            </div>}
        </div>
    )
}

export default Id;