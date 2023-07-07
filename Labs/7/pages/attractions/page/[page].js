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
    const { data, error } = useSWR(`https://app.ticketmaster.com/discovery/v2/attractions/?page=${page}&apikey=${API_KEY}&countryCode=US`, fetcher)

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
        router.push(`/attractions/page/${parseInt(page) + 1}`);
    }

    async function handlePrevClick() {
        console.log(`Clicked previous page.`);
        router.push(`/attractions/page/${parseInt(page) - 1}`);
    }

    const buildCard = (attraction) => {
        return (
            <li className='card' key={attraction.id || attraction.url}>
                <Link className='card-title' href={`/attractions/${attraction.id}`}>{attraction.name}</Link>
                <p className='card-text'>{attraction.classifications[0].genre.name}, {attraction.classifications[0].segment.name}, {attraction.classifications[0].subGenre.name}</p>
                {attraction.url && <a className="card-link" href={attraction.url}>View Upcoming Events</a>}
                {attraction.images && attraction.images[0].url &&
                <img className="card-image" src={attraction.images[0].url} alt={attraction.name} width="95%" height="45%"/>}
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
            </li>
        )
    };

    return (
        <div>
            <h1>Attractions</h1>
            <NavBar />
            <button className='page-button' onClick={handlePrevClick} disabled={page <= 1}>Previous Page</button>
            <button className='page-button' onClick={handleNextClick} disabled={page >= 49}>Next Page</button>
            <ul className='card-container'>
                {data._embedded.attractions.map((attraction) => buildCard(attraction))}
            </ul>
        </div>
    );
};

export default Page;