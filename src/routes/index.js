// import packages
const {Router} = require("express");

// import needed controllers
const controllers = {
    auth: require("../controllers/auth.js"),
    characters: require("../controllers/characters.js"),
    movies: require("../controllers/movies.js")
};

// create a new router
const router = Router();

// create our index route
router.get("/", (req, res) => res.json({message: "alkemy challenge backend"}));

// create our auth route
router.get("/auth/activation/:activate_token", controllers.auth.activate);
router.post("/auth/login", controllers.auth.login);
router.post("/auth/register", controllers.auth.register);

// create our characters route
router.get("/characters/", controllers.auth.isAuthenticated, controllers.characters.getAll);
router.get("/characters/:id", controllers.auth.isAuthenticated, controllers.characters.getById);
router.post("/characters/create/", controllers.auth.isAuthenticated, controllers.characters.create);
router.put("/characters/update/:id", controllers.auth.isAuthenticated, controllers.characters.update);
router.delete("/characters/delete/:id", controllers.auth.isAuthenticated, controllers.characters.remove);

// create our movies route
router.get("/movies/", controllers.auth.isAuthenticated, controllers.movies.getAll);
router.get("/movies/:id", controllers.auth.isAuthenticated, controllers.movies.getById);
router.post("/movies/create/", controllers.auth.isAuthenticated, controllers.movies.create);
router.put("/movies/update/:id", controllers.auth.isAuthenticated, controllers.movies.update);
router.delete("/movies/delete/:id", controllers.auth.isAuthenticated, controllers.movies.remove);

module.exports = router;