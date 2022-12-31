const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id }).populate('user').populate('campsites') 
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(!favorite.campsites.includes(req.body._id)) {
            favorite.campsites.push(req.body._id);
            next(); 
        }
    })
    Favorite.create(req.body)
    .then(favorite => {
        console.log('Favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.fineOneAndDelete()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.favoriteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            next(); 
        }
        if(favorite.campsites.includes(req.params.campsiteId)) {
            res.end('That campsite is already in the list of favorites!');
            next();
        }
    })
    Favorite.create(favorite.campsites.push(req.params.campsiteId))
    .then(favorite => {
        console.log('Favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite.campsites.includes(req.params.campsiteId)) {
            let campsite = favorite.campsites.indexOf(req.params.campsiteId);
            favorite.campsites.splice(campsite, 1); 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite); 
        }
        if(!favorite.campsites.includes(req.params.campsiteId)) {
            res.setHeader('Content-Type', 'text/plain');
            res.end("There are not favorites to delete");
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;