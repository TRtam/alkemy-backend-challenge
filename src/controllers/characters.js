// import packages
const {Op} = require("sequelize");

// import models
const models = {
    characters: require("../models/Character.js"),
    movies: require("../models/Movie.js")
};

const getAll = async(req, res) => {
    try {
        const query = req.query;
        
        if(query.name || query.age || query.movieId) {
            const characters = await models.characters.scope("getAll").findAll({
                where: {
                    [Op.or]: [
                        (query.name ? {name: query.name} : undefined),
                        (query.age ? {age: query.age} : undefined),
                        (query.movieId ? {associatedMovies: {[Op.contains]: [parseInt(query.movieId)]}} : undefined),
                    ]
                }
            });

            return res.json(characters);
        }

        const characters = await models.characters.scope("getAll").findAll();

        return res.json(characters);
    } catch(error) {
        console.error("getAll() - ", error);
    }
}

const getById = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    try {
        const character = await models.characters.scope("clear").findOne({where: {id}});

        if(!character)
            return res.json({message: "can't find a character with that id"});

        const movies = await models.movies.findAll();

        character.associatedMovies = character.getDataValue("associatedMovies").map(id => {
            id = parseInt(id);

            const find = movies.find(movie => 
                movie.getDataValue("id") === id
            );

            if(!find)
                return false;

            return find.get();
        });

        return res.json(character);
    } catch(error) {
        console.error("getById() - ", error);
        return res.json({message: "an error has occured"});
    }
};

const create = async(req, res) => {
    const {image, name, age, history, associatedMovies} = req.body;

    if(!image || typeof(image) !== "string")
        return res.json({message: "invalid image, must be a string"});
    else if(!name || typeof(name) !== "string")
        return res.json({message: "invalid name, must be a string"});
    else if(!age || typeof(age) !== "number")
        return res.json({message: "invalid age, must be a number"});
    else if(!history || typeof(history) !== "string")
        return res.json({message: "invalid history, must be a string"});
    else if(!associatedMovies || !Array.isArray(associatedMovies))
        return res.json({message: "invalid associatedMovies, must be an array containing movies id"});

    try {
        const character = await models.characters.create({
            image,
            name,
            age,
            history,
            associatedMovies
        });

        return res.json({
            message: "characters successfully connected",
            character
        });
    } catch(error) {
        console.error("create() - ", error);
        return res.json({message: "an error has occurred"});
    }
};

const update = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    const {image, name, age, history, associatedMovies} = req.body;

    if(image && typeof(image) !== "string")
        return res.json({message: "invalid image, must be a string"});
    else if(name && typeof(name) !== "string")
        return res.json({message: "invalid name, must be a string"});
    else if(age && typeof(age) !== "number")
        return res.json({message: "invalid age, must be a number"});
    else if(history && typeof(history) !== "string")
        return res.json({message: "invalid history, must be a string"});
    else if(associatedMovies && !Array.isArray(associatedMovies))
        return res.json({message: "invalid associatedMovies, must be an array containing movies id"});

    try {
        const character = await models.characters.scope("clear").findOne({where: {id}});

        if(!character)
            return res.json({message: "can't find a character with that id"});

        const payload = {
            image: !image ? character.getDataValue("image") : image,
            name: !name ? character.getDataValue("name") : name,
            age: !age ? character.getDataValue("age") : age,
            history: !history ? character.getDataValue("history") : history,
            associatedMovies: !associatedMovies ? character.getDataValue("associatedMovies") : associatedMovies
        }

        await models.characters.update(payload, {where: {id}});

        return res.json({
            message: "character has been updated successfully",
            character: {
                id: character.getDataValue("id"),
                ...payload
            }
        });
    } catch(error) {
        console.error("update() - ", error);
        return res.json({message: "an error has occurred"});
    }
};

const remove = async(req, res) => {
    const {id} = req.params;

    if(!id)
        return res.json({message: "you must have to provide an id"});

    try {
        const rows = await models.characters.destroy({where: {id}});

        if(rows === 0)
            return res.json({message: "can't find a character with that id"});

        return res.json({message: "the character has been destroyed"});
    } catch(error) {
        console.error("remove() - ", error);
        return res.json({message: "an error has occurred"});
    }
};

module.exports = {getAll, getById, create, update, remove}