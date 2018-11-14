const express = require('express');
const request = require('request');
const hbs = require('hbs');
const fs = require('fs');

const port = process.env.PORT || 8080;

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

var weather = '';

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
})

hbs.registerHelper('message', (text) => {
    return text.toUpperCase();
})

app.use((request, respons, next) => {
    var time = new Date().toString();
    // console.log(`${time}: ${request.method} ${request.url}`);
    var log = `${time}: ${request.method} ${request.url}`
    fs.appendFile('server.log', log + '\n', (error) => {
        if (error) {
            console.log('Unable to log message');
        }
    });
    next();
});

app.get('/', (request, response) => {
    // response.send('<h1>Hello Express!</h1>');
    response.send({
        name: 'Your Name',
        school: [
            'BCIT',
            'SFU',
            'UBC'
        ]
    })
});

app.get('/info', (request, response) => {
    response.render('about.hbs', {
        title: 'About page',
        year: new Date().getFullYear(),
        welcome: 'Hello!'
    });
});

app.get('/weather', (request, response) => {
    response.send(weather);
});

app.listen(port, () => {
    console.log('Server is up on the port ${port}');
    request({
        url: 'http://maps.googleapis.com/maps/api/geocode/json' +
            '?address=Leszczynowka',
        json: true
    }, (error, response, body) => {
        if (error) {
           console.log('Cannot connect to Google Maps');
        } else if (body.status === 'ZERO_RESULTS') {
            console.log('Cannot find requested address');
        } else if (body.status === 'OK') {
            var latitude = body.results[0].geometry.location.lat;
            var longitude = body.results[0].geometry.location.lng;
            request({
                url: `https://api.darksky.net/forecast/a05801ddfd47bee6dbc2b05a8877b901/${latitude},${longitude}`,
                json: true
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    weather = `The temperature in Folwark Leszczynowka is ${body.currently.temperature} and is ${ body.currently.summary}`;
                } else {
                    console.log(body.error);
                };
            });
        }
    });
});