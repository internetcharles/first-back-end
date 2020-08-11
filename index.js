require('dotenv').config();
const express = require('express');
const cors = require('cors');
const request = require('superagent')
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.use(cors());

app.use(express.static('public'));

async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`)

    const weatherData = response.body.data;

    const forecastArray = weatherData.map((weatherItem => {    
        return {
        forecast: weatherItem.weather.description,
        time: new Date(weatherItem.ts * 1000),
    };
}))

    return forecastArray;
}

async function getHikes(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${process.env.HIKING_API_KEY}`)

    const trailData = response.body.trails;



    const trailArray = trailData.map((trail => {
        
        return {
            name: trail.name,
            stars: trail.stars,
            location: trail.location,
            length: trail.length,
            star_votes: trail.starVotes,
            summary: trail.summary,
            trail_url: trail.url,
            condition: trail.conditionStatus,
            condition_date: trail.conditionDate.split(' ')[0],
            condition_time: trail.conditionDate.split(' ')[1]
        }
    }))
    
    return trailArray;

}

async function getReview(lat, lon) {
    const response = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`)
    .set('Authorization', 'Bearer 2Nu7g-AYANIpmT-HcwoeZz7oW89a_bHZRy9FnxlcqWaJ_NRFWiC3lw18EPlK-LeiWYQ5jH2MfNFVRDlGD6mIDR58WCC0REz5Ta_TiLu0UfTwm92YG9Z5ddhEIMEyX3Yx');

    const reviewData = response.body.businesses;

    const forecastArray = reviewData.map((review => {    
        return {
            name: review.name,
            image_url: review.image_url,
            price: review.price,
            rating: review.rating,
            url: review.url
    };
}))

    return forecastArray;
}


async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${cityName}&format=json`)

    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon
    }
}

app.get('/location', async(req, res) => {
    userInput = req.query.search;

    const mungedData = await getLatLong(userInput);

    res.json(mungedData);
  });

  app.get('/weather', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getWeather(userLat, userLon);

        res.json(mungedData);
    }
    catch (e) {
        res.status(500).json({ error: e.message })
    }
    });

    app.get('/trails', async(req, res) => {
        try {
            const userLat = req.query.latitude;
            const userLon = req.query.longitude;
    
            const mungedData = await getHikes(userLat, userLon);
    
            res.json(mungedData);
        }
        catch (e) {
            res.status(500).json({ error: e.message })
        }
        });

    app.get('/reviews', async(req, res) => {
        try {
            const userLat = req.query.latitude;
            const userLon = req.query.longitude;
        
            const mungedData = await getReview(userLat, userLon);
        
            res.json(mungedData);
        }
        catch (e) {
            res.status(500).json({ error: e.message })
        }
        })        
        


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});