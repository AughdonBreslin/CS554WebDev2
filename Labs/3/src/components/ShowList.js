import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useParams} from 'react-router-dom';

import SearchShows from './SearchShows';
import noImage from '../img/download.jpeg';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';

import '../App.css';

// i found a bug where spam clicks break the buttons, since they dont have enough time to remove themmselves.

const ShowList = (props) => {
  const regex = /(<([^>]+)>)/gi;
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [showsData, setShowsData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  let {pagenum} = useParams();
  let card = null;


  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await axios.get('http://api.tvmaze.com/shows');
        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if(!pagenum) {
      console.log("No page; default.");
      fetchData();
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const {data} = await axios.get(`http://api.tvmaze.com/shows?page=${pagenum}`);
        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if(pagenum) {
      console.log(`Page ${pagenum}.`);
      fetchData();
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const {data} = await axios.get(
          'http://api.tvmaze.com/search/shows?q=' + searchTerm
        );
        setSearchData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log(`Searchterm: ${searchTerm}`);
      fetchData();
    }
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  // scary dont touch
  const buildCard = (show) => {
    return (
      <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={show.id}>
        <Card
          variant='outlined'
          sx={{
            maxWidth: 250,
            height: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 5,
            border: '1px solid #1e8678',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
          }}
        >
          <CardActionArea>
            <Link to={`/shows/${show.id}`}>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%'
                }}
                component='img'
                image={
                  show.image && show.image.original
                    ? show.image.original
                    : noImage
                }
                title='show image'
              />

              <CardContent>
                <Typography
                  sx={{
                    borderBottom: '1px solid #1e8678',
                    fontWeight: 'bold'
                  }}
                  gutterBottom
                  variant='h6'
                  component='h3'
                >
                  {show.name}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  {show.summary
                    ? show.summary.replace(regex, '').substring(0, 139) + '...'
                    : 'No Summary'}
                  <span>More Info</span>
                </Typography>
              </CardContent>
            </Link>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  // map words into scary nice looking card
  if (searchTerm) {
    card =
      searchData &&
      searchData.map((shows) => {
        let {show} = shows;
        return buildCard(show);
      });
  } else {
    card =
      showsData &&
      showsData.map((show) => {
        return buildCard(show);
      });
  }

  function PaginatedShows({showsPerPage}) {
    async function handleNextClick() {
      console.log('Clicked Next.')
      pagenum = pagenum + 1;
      async function fetchData() {
        try {
          const {data} = await axios.get(`http://api.tvmaze.com/shows?page=${pagenum}`);
          setShowsData(data);
          console.log(data);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      }
      console.log(`Page ${pagenum}.`);
      fetchData();
    }
  
    async function handlePreviousClick() {
      console.log('Clicked Previous.')
      pagenum = pagenum - 1;
      async function fetchData() {
        try {
          const {data} = await axios.get(`http://api.tvmaze.com/shows?page=${pagenum}`);
          setShowsData(data);
          console.log(data);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      }
      console.log(`Page ${pagenum}.`);
      fetchData();
    }
    return (
      <>
        <div>
          {pagenum > 0 && (
            <Link to={`/shows/page/${parseInt(pagenum)-1}`}>
              <button onClick={handlePreviousClick}>Previous</button>
            </Link>
          )}
          {pagenum < 269 && ( // i tried so many things but i cant get damn page limit and i know its gonna be so simple but i dont know it and maybe that makes me dumb.
            <Link to={`/shows/page/${parseInt(pagenum)+1}`}>
              <button onClick={handleNextClick}>Next</button>
            </Link>
          )}
        </div>
        <br />
        <br />
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            flexDirection: 'row'
          }}
        >
          {card}
        </Grid>
    </>
    )
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div>
        <SearchShows searchValue={searchValue} />
        <br />
        <br />
        <PaginatedShows showsPerPage={250}/>
      </div>
    );
  }
};

export default ShowList;