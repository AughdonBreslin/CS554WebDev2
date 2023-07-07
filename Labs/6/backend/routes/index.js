const axios = require('axios');
const md5 = require('blueimp-md5');
const publicKey = 'eb0b1c8af83f7dae6f8e662459f85a6c';
const privateKey = '9324e69d981877e4fb1d2d7bade7c3569eb015ce';
const ts = new Date().getTime();
const stringToHash = ts + privateKey + publicKey;
const hash = md5(stringToHash);
const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
const url = baseUrl + '?ts=' + ts + '&apikey=' + publicKey + '&hash=' + hash;
const Math = require('mathjs');
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});


const constructorMethod = (app) => {
    app.get('/marvel-characters/page/:pagenum', async (req, res) => {
        const pagenum = parseInt(req.params.pagenum);
        let redisData;
        try {
            //check if redis has the data stored already
            redisData = await client.get(`${pagenum}`);
            if (redisData) {
                console.log(`Page ${pagenum} data found in redis`);
                res.status(200).json(JSON.parse(redisData));
                return;
            }
        } catch (e) {
            console.log(e);
        }

        // always seems to return status 200, just empty result
        const {data} = await axios.get(url+'&limit=20'+'&offset='+((pagenum-1)*20));
        const info = data.data

        console.log(`Number of results on page ${pagenum}: ${info.count}`);
        if (info.count == 0) {
            res.status(404).json({ error: 'Page not found' });
        } else {
            //store data in redis
            if(!redisData) {
                client.set(`${pagenum}`, JSON.stringify(info.results));
            }
            res.status(200).json(info.results);
        }
    });

    app.get('/marvel-characters/search/:name', async (req, res) => {
        const name = req.params.name;

        //check if redis already has the data
        let redisData;
        try {
            redisData = await client.get(name);
            if (redisData) {
                console.log(`Search term ${name} data found in redis`);
                res.status(200).json(JSON.parse(redisData));
                return;
            }
        } catch (e) {
            console.log(e);
        }

        const {data} = await axios.get(url+'&nameStartsWith='+name);
        const info = data.data

        //store data in redis
        if (!redisData){
            client.set(name, JSON.stringify(info.results));
        }


        console.log(`Number of results for ${name}: ${info.count}`);
        res.status(200).json(info.results);

    });

    app.get('/character/:id', async (req, res) => {
        const id = req.params.id;
        try {
            //check redis
            const redisData = await client.get(id);
            if (redisData) {
                console.log(`Character ${id} data found in redis`);
                res.status(200).json(JSON.parse(redisData));
                return;
            }

            // returns 404 if character not found
            const {data} = await axios.get(`${baseUrl}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`);

            //store data in redis
            if (!redisData) {
                client.set(id, JSON.stringify(data.data.results[0]));
            }
            const info = data.data

            res.status(200).json(info.results[0]);
        } catch (e) {
            res.status(404).json({ error: 'Page not found' });
        }
    });

    // app.use('*', (req, res) => {
    //     res.status(404).json({ error: 'Not found' });
    // });
};

module.exports = constructorMethod;