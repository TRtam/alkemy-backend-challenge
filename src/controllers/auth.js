// import packages
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// import config
const config = require("../config/index.js");

// import helpers
const helpers = {
    regexp: require("../helpers/regexp.js")
};

// import models
const models = {
    account: require("../models/Account.js")
};

// import services
const services = {
    sg: require("../services/sg.js")
};

const isAuthenticated = async(req, res, next) => {
    const {authorization} = req.headers;

    if(!authorization || typeof(authorization) !== "string" || !authorization.startsWith("Bearer "))
        return res.json({message: "You need to be authenticated"});

    const authorizationSplitted = authorization.split(" ");

    try {
        const token = jwt.verify(authorizationSplitted[1].trim(), config.jwt.secret);

        const user = await models.account.findOne({
            where: {
                id: token.id
            }
        });

        if(!user)
            return res.json({message: "Your authorization is not valid"});

        req.user = user.get();

        return next();
    } catch(error) {
        console.error("isAuthenticated() - ", error);
        return res.json({message: "You need to be authenticated"});
    }
};

const login = async(req, res) => {
    const {identifier, password} = req.body;

    if(!identifier || typeof(identifier) !== "string")
        return res.json({message: "identifier is missing"});
    else if(!password || typeof(password) !== "string")
        return res.json({message: "password is missing"});

    const indentifier_lowered = identifier.toLowerCase();

    try {
        const user = await models.account.findOne({
            where: {
                [Op.or]: [
                    {email: indentifier_lowered},
                    {username_lowered: indentifier_lowered}
                ]
            }
        });

        if(!user)
            return res.json({message: "an Account with that identifier doesn't exists"});

        if(!(await bcrypt.compare(password, user.getDataValue("password"))))
            return res.json({message: "invalid password"});

        if(!user.getDataValue("activated"))
            return res.json({message: "activate your account first, check your email's spam folder"});

        const userInstance = user.get();
        delete userInstance.username_lowered;
        delete userInstance.password;
        delete userInstance.createdAt;
        delete userInstance.updatedAt;
        delete userInstance.activated;
        delete userInstance.activate_token;

        const token = jwt.sign(
            {
                id: userInstance.id
            },
            config.jwt.secret,
            {
                expiresIn: 86400000
            }
        );

        return res.json({
            message: "You successfully logged in",
            token,
            data: userInstance
        });
    } catch(error) {
        console.error("login() - ", error);
        return res.json({message: "something went wrong while trying to log in"});
    }
};

const register = async(req, res) => {
    const {username, email, password, re_password} = req.body;

    if(!username || typeof(username) !== "string")
        return res.json({message: "invalid username"});
    else if(!email || typeof(email) !== "string" || !helpers.regexp.email.test(email))
        return res.json({message: "invalid email"});
    else if(!password || typeof(password) !== "string")
        return res.json({message: "invalid password"});
    else if(!re_password || typeof(re_password) !== "string" || re_password !== password)
        return res.json({message: "invalid re_password"});

    const email_lowered = email.toLowerCase();
    const username_lowered = username.toLowerCase();

    try {
        const user = await models.account.findOne({
            where: {
                [Op.or]: [
                    {email: email_lowered},
                    {username_lowered: username_lowered}
                ]
            }
        });

        if(user){
            return res.json({message: `${user.getDataValue("username_lowered") === username_lowered ? "username" : "email"} is already taken`});
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const activate_token = jwt.sign(
            {
                username
            },
            config.jwt.secret,
            {
                expiresIn: 86400
            }
        )

        const registeredUser = await models.account.create({
            email: email_lowered,
            username,
            username_lowered: username_lowered,
            password: hashedPassword,
            activated: false,
            activate_token
        });

        const registeredUserInstance = registeredUser.get();
        delete registeredUserInstance.username_lowered;
        delete registeredUserInstance.password;
        delete registeredUserInstance.createdAt;
        delete registeredUserInstance.updatedAt;
        delete registeredUserInstance.activated;
        delete registeredUserInstance.activate_token;

        const token = jwt.sign(
            {
                id: registeredUserInstance.id
            },
            config.jwt.secret,
            {
                expiresIn: 86400
            }
        );

        await services.sg.send({
            to: registeredUserInstance.email,
            from: 'diego.mta13@gmail.com',
            subject: 'Alkemy Challenge Backend',
            text: `
                Hello, ${registeredUserInstance.username}
                This is an automated mail for Account activation, please click (localhost:${config.app.port}/auth/activation/${registeredUserInstance.id})here to activate your account
                You can ignore this mail if you din't create any account on our site.
            `,
            html: `
                <div>
                    <h3>Hello, ${registeredUserInstance.username}</h3>
                    <p>
                        <strong>This is an automated mail for Account activation, please click</strong>
                        <a href="http://localhost:${config.app.port}/auth/activation/${activate_token}" target="_blank">here</a>
                        <strong>to active your account</strong>
                    </p>
                    <p>You can ignore this mail if you didn't create any account on our site.</p>
                </div>
            `,
        });

        return res.json({
            message: "You successfully registered, a mail has been sent to your email please check it to active your account",
            token,
            data: registeredUserInstance
        });
    } catch(error) {
        console.error("register() - ", error);
        return res.json({message: "something went wrong while trying to log in"});
    }
};

const activate = async(req, res) => {
    const {activate_token} = req.params;

    if(!activate_token || typeof(activate_token) !== "string")
        return res.json({message: "activate_token is not valid"});
    
    try {
        jwt.verify(activate_token, config.jwt.secret);

        const user = await models.account.findOne({where: {activate_token}});

        if(!user)
            return res.json({message: "can't find the account"});

        await models.account.update({activated: true}, {where: {id: user.getDataValue("id")}});

        return res.json({message: "your account has been succesfully activated"});
    } catch(error) {
        console.error("activate() - ", error);
    }
}

module.exports = {isAuthenticated, login, register, activate};