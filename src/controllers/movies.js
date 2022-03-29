// import packages
const {Op} = require("sequelize");

// import models
const models = {
    characters: require("../models/Character.js"),
    movies: require("../models/Movie.js"),
    genres: require("../models/Genre.js")
};

const getAll = async(req, res) => {
    try {
        const query = req.query;

        if(query.title || query.genreId || query.sort) {
            const movies = await models.movies.scope("getAll").findAll({
                where: {
                    [Op.or]: [
                        (query.title ? {title: query.title} : undefined),
                        (query.genreId ? {associatedGenres: {[Op.contains]: [parseInt(query.genreId)]}} : undefined),
                    ]
                },
                order: [
                    ["title", query.sort || "ASC"]
                ]
            });

            return res.json(movies);
        }

        const movies = await models.movies.scope("getAll").findAll();

        return res.json(movies);
    } catch(error) {
        console.error("getAll() - ", error);
    }
}

const getById = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    try {
        const movie = await models.movies.scope("clear").findOne({where: {id}});

        if(!movie)
            return res.json({message: "can't find a movie with that id"});

        const characters = await models.characters.findAll();

        movie.associatedCharacters = movie.getDataValue("associatedCharacters").map(id => {
            id = parseInt(id);

            const find = characters.find(character => 
                character.getDataValue("id") === id
            );

            if(!find)
                return false;

            return find.get();
        });

        // const genres = await models.genres.findAll();

        // movie.associatedGenres = movie.getDataValue("associatedGenres").map(id => {
        //     id = parseInt(id);

        //     const find = genres.find(genre => 
        //         genre.getDataValue("id") === id
        //     );

        //     if(!find)
        //         return false;

        //     return find.get();
        // });

        return res.json(movie);
    } catch(error) {
        console.error("getById() - ", error);
        return res.json({message: "an error has occured"});
    }
}

const create = async(req, res) => {
    const {image, title, createdDate, rate, associatedGenres, associatedCharacters} = req.body;

    if(!image || typeof(image) !== "string")
        return res.json({message: "invalid image, must be a string"});
    else if(!title || typeof(title) !== "string")
        return res.json({message: "invalid title, must be a string"});
    else if(!createdDate || typeof(createdDate) !== "number")
        return res.json({message: "invalid createdDate, must be a number"});
    else if(!rate || typeof(rate) !== "string")
        return res.json({message: "invalid rate, must be a string"});
    else if(!associatedGenres || !Array.isArray(associatedGenres))
        return res.json({message: "invalid associatedGenres, must be an array containing movies id"});
    else if(!associatedCharacters || !Array.isArray(associatedCharacters))
        return res.json({message: "invalid associatedCharacters, must be an array containing movies id"});

    try {
        const date = new Date(createdDate);

        const movie = await models.movies.create({
            image,
            title,
            createdDate: date,
            rate,
            associatedGenres,
            associatedCharacters,
        });

        return res.json({
            message: "movie successfully connected",
            movie
        });
    } catch(error) {
        console.error("create() - ", error);
        return res.json({message: "an error has occurred"});
    }
}

const update = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    const {image, title, createdDate, rate, associatedGenres, associatedCharacters} = req.body;

    if(image && typeof(image) !== "string")
        return res.json({message: "invalid image, must be a string"});
    else if(title && typeof(title) !== "string")
        return res.json({message: "invalid title, must be a string"});
    else if(createdDate && typeof(createdDate) !== "number")
        return res.json({message: "invalid createdDate, must be a number"});
    else if(rate && typeof(rate) !== "string")
        return res.json({message: "invalid rate, must be a string"});
    else if(associatedGenres && !Array.isArray(associatedGenres))
        return res.json({message: "invalid associatedGenres, must be an array containing movies id"});
    else if(associatedCharacters && !Array.isArray(associatedCharacters))
        return res.json({message: "invalid associatedCharacters, must be an array containing movies id"});

    try {
        const movie = await models.movies.scope("clear").findOne({where: {id}});

        if(!movie)
            return res.json({message: "can't find a movie with that id"});

        const payload = {
            image: !image ? movie.getDataValue("image") : image,
            title: !title ? movie.getDataValue("title") : title,
            createdDate: !createdDate ? movie.getDataValue("createdDate") : createdDate,
            rate: !rate ? movie.getDataValue("rate") : rate,
            associatedGenres: !associatedGenres ? movie.getDataValue("associatedGenres") : associatedGenres,
            associatedCharacters: !associatedCharacters ? movie.getDataValue("associatedCharacters") : associatedCharacters
        }

        await models.movies.update(payload, {where: {id}});

        return res.json({
            message: "movie has been updated successfully",
            movie: {
                id: movie.getDataValue("id"),
                ...payload
            }
        });
    } catch(error) {
        console.error("update() - ", error);
        return res.json({message: "an error has occurred"});
    }
}

const remove = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    try {
        const rows = await models.movies.destroy({where: {id}});

        if(rows === 0)
            return res.json({message: "can't find a movie with that id"});

        return res.json({message: "the movie has been destroyed"});
    } catch(error) {
        console.error("remove() - ", error);
        return res.json({message: "an error has occurred"});
    }
}

module.exports = {getAll, getById, create, update, remove};