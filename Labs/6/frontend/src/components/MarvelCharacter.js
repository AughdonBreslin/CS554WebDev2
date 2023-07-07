import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import actions from '../actions';
import { useDispatch, useSelector } from 'react-redux';


function MarvelCharacter() {
    const {id} = useParams();
    console.log(id)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        async function fetchData() {
            const {data} = await axios.get(`http://localhost:3001/character/${id}`);
            setData(data);
            setIsLoading(false);
        }
        console.log(`Getting character with id ${id}.`);
        fetchData()
        .catch(error => {
            setError(error);
            setIsLoading(false);
            console.log(error);
        });
    }, []);

    const dispatch = useDispatch();

    // get all collectors
    const collectors = useSelector(state => state.collectors);

    let selectedCollector = null;
    for (let i = 0; i < collectors.length; i++) {
        if (collectors[i].selected) {
            selectedCollector = collectors[i];
        }
    }

    const addCharacter = () => {
        dispatch(actions.addCharacter(selectedCollector.id, data));
    }

    const removeCharacter = () => {
        dispatch(actions.removeCharacter(selectedCollector.id, data));
    }
    
    if (isLoading) return 'Loading...';

    if (error) {
        if(error.message.includes('404')) window.location.href = '/404';
        return `Error: ${error.message}`;
    }

    if (data) {console.log(data);}

    return (
        <div className='card-page'>
            <h1 className='card-title'>{data.name}</h1>
            <img className='card-image' src={data.thumbnail.path + '.' + data.thumbnail.extension} alt={data.name} />
            <p>{data.description || 'No description.'}</p>
            <button className='card-button' onClick={addCharacter}>Add to collection</button>
            <button className='card-button' onClick={removeCharacter}>Remove from collection</button>
            <h2 className='card-text'>Comics</h2>
            <ul className='card-list'>{data.comics.items.map((item) => <li key={item.resourceURI}>{item.name}</li>)}</ul>
            <h2 className='card-text'>Events</h2>
            <ul className='card-list'>{data.events.items.map((item) => <li key={item.resourceURI}>{item.name}</li>)}</ul>
            <h2 className='card-text'>Series</h2>
            <ul className='card-list'>{data.series.items.map((item) => <li key={item.resourceURI}>{item.name}</li>)}</ul>
            <h2 className='card-text'>Stories</h2>
            <ul className='card-list'>{data.stories.items.map((item) => <li key={item.resourceURI}>{item.name}</li>)}</ul>
        </div>
    );
}

export default MarvelCharacter;