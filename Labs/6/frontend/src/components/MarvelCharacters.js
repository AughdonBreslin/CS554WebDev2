
import React, { useEffect, useState } from 'react';
import { persistState } from 'redux-persist';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import actions from '../actions';
import { useDispatch, useSelector } from 'react-redux';
import MarvelCharacter from './MarvelCharacter';
import SearchBar from './SearchBar';

function MarvelCharacters() {
    let { page } = useParams() || 1;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [searchData, setSearchData] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const totalPages = 79;
    let card = null;

    // MarvelCharacters, no page
    useEffect(() => {
        setIsLoading(true);
        async function fetchData() {
            page = 1;
            const {data} = await axios.get(`http://localhost:3001/marvel-characters/page/${page}`);
            setData(data);
            setIsLoading(false);
        }
        if (!page) {
            console.log(`No page; defaulting to page 1.`);
            fetchData()
            .catch(error => {
                setError(error);
                setIsLoading(false);
                console.log(error);
            });
        }
    }, []);

    // MarvelCharacters, with page
    useEffect(() => {
        setIsLoading(true);
        async function fetchData() {
            const {data} = await axios.get(`http://localhost:3001/marvel-characters/page/${page}`);
            setData(data);
            setIsLoading(false);
        }
        if (page) {
            if (page < 1) {
                console.log(`Page input less than 1. Resorting to 404.`);
                window.location.href = '/404'
            } else if (page > totalPages) {
                console.log(`Page input greater than total pages. Resorting to 404.`);
                window.location.href = '/404'
            }
            console.log(`Page input: ${page}.`);
            fetchData()
            .catch(error => {
                setError(error);
                setIsLoading(false);
                console.log(error);
            });
        }
    }, []);

    // MarvelCharacters, with search
    useEffect(() => {
        async function fetchData() {
            const {data} = await axios.get(`http://localhost:3001/marvel-characters/search/${searchTerm}`);
            setSearchData(data);
            setIsLoading(false);
        }
        if (searchTerm) {
            console.log(`Search term: ${searchTerm}.`);
            fetchData()
            .catch(error => {
                setError(error);
                setIsLoading(false);
                console.log(error);
            });
        }
    }, [searchTerm]);

    const searchValue = async (value) => {
        setSearchTerm(value);
    };

    const dispatch = useDispatch();

    // get all collectors
    const collectors = useSelector(state => state.collectors);
    console.log(collectors);
    let selectedCollector = null;
    for (let i = 0; i < collectors.length; i++) {
        if (collectors[i].selected) {
            selectedCollector = collectors[i];
        }
    }

    const addCharacter = (character) => {
        dispatch(actions.addCharacter(selectedCollector.id, character));
    }

    const removeCharacter = (character) => {
        dispatch(actions.removeCharacter(selectedCollector.id, character));
    }

    const buildCard = (character) => {
        return (
            <div className="card" key={character.id}>
                <div>
                    <Link className='card-title' to={`/marvel-characters/${character.id}`}>{character.name}</Link>
                    <button className='card-button' onClick={() => {addCharacter(character)}}> Add Character </button>
                    <button className='card-button'onClick={() => {removeCharacter(character)}}> Remove Character </button>
                </div>
                <img className='card-image' src={character.thumbnail.path+'.'+character.thumbnail.extension} alt={character.name} />
            </div>
        );
    }

    async function handleNextClick() {
        console.log(`Next page.`);
        page = parseInt(page) + 1;
        setIsLoading(true);
        async function fetchData() {
            const {data} = await axios.get(`http://localhost:3001/marvel-characters/page/${page}`);
            setData(data);
            setIsLoading(false);
        }

        console.log(`Page: ${page}.`);
        fetchData()
        .catch(error => {
            setError(error);
            setIsLoading(false);
            console.log(error);
        });
    }

    async function handlePrevClick() {
        console.log(`Previous page.`);
        page = parseInt(page) - 1;
        setIsLoading(true);
        async function fetchData() {
            const {data} = await axios.get(`http://localhost:3001/marvel-characters/page/${page}`);
            setData(data);
            setIsLoading(false);
        }

        console.log(`Page: ${page}.`);
        fetchData()
        .catch(error => {
            setError(error);
            setIsLoading(false);
            console.log(error);
        });
    }

    if (isLoading) return 'Loading...';

    if (error) {
        if(error.message.includes('404')) window.location.href = '/404';
        return `Error: ${error.message}`;
    }

    if (data) console.log(data);
    
    if (searchTerm) {
        if (searchData) {
            console.log(searchData);
            card = searchData.map(buildCard);
        } else {
            console.log(`No search results.`);
            card = <div>No search results.</div>
        }
    } else {
        console.log(data);
        card = data.map(buildCard);
    }

    return (
        <div>
            <h1>Marvel Characters</h1>
            <SearchBar className='search-bar'searchValue={searchValue}/>
            <div className='page-buttons'>
                {page > 1 && <Link className='page-button' to={`/marvel-characters/page/${parseInt(page) - 1}`} onClick={handlePrevClick}>Previous Page</Link>}
                {page < totalPages && <Link className='page-button' to={`/marvel-characters/page/${parseInt(page) + 1}`} onClick={handleNextClick}>Next Page</Link>}
            </div>
            <div className='card-container'>
                {card}
            </div>
        </div>
    );
}

export default MarvelCharacters;