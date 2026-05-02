const userInfo = require('../models/userInfoModel');
const RefreshToken = require('../models/refreshTokenModel')
const { generateHash, passwordCheck } = require('../utils/passwordProcess');
const { generateToken } = require('../utils/generateToken');
const crypto = require('crypto');
const userService = require('./userService');
const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const signUp = async({username, email, password}) =>{

    if (!username || !email || !password){
        throw new AppError("All fields required", 400);
    }

    const clean = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
    };

    if (!EMAIL_REGEX.test(clean.email)) throw new AppError("Invalid email format", 400)
    if (!USERNAME_REGEX.test(clean.username)) throw new AppError("Invalid username", 400)
    if (!PASSWORD_REGEX.test(password))  throw new AppError("Password too weak", 400)

    const [existingUser, existingEmail] = await Promise.all([
        userService.findUser({username:clean.username}),
        userService.findUser({email:clean.email})
    ]);

    if (existingUser) throw new AppError("Username already taken", 409);
    if (existingEmail) throw new AppError("Email already registered", 409);
        
    const hashedPassword = await generateHash(password);
    const user = await userInfo.create({
        ...clean,
        password: hashedPassword
    });
    const { token, refreshToken, hashedToken } = generateToken(user._id);
    await RefreshToken.create({
        userId: user._id,
        refreshToken: hashedToken
    });

    return { token, refreshToken }
}

const login = async({identifier, password}) =>{
    if (!identifier || !password)
        throw new AppError("All fields required", 400);

    if (typeof identifier !== 'string' || typeof password !== 'string')
        throw new AppError("Invalid input", 400);

    const sanitizedIdentifier = identifier.trim();

    const user = await userService.findUser({$or: [{username: sanitizedIdentifier}, {email: sanitizedIdentifier}]})
        
    if(!user) throw new AppError("Invalid credentials", 401);

    const isMatched = await passwordCheck(password, user.password);

    if(!isMatched) throw new AppError("Invalid credentials", 401);
    
    await RefreshToken.deleteMany({userId:user._id});
    
    const {token, refreshToken, hashedToken} = generateToken(user._id);
    
    await RefreshToken.create({
        userId: user._id,
        refreshToken: hashedToken,
    });

    return {token, refreshToken}
}

const refresh = async({refreshTokenFromCookies}) => {
    if (!refreshTokenFromCookies)
        throw new AppError("No token provided", 401)

    const hashedToken = crypto
        .createHash('sha256')
        .update(refreshTokenFromCookies)
        .digest('hex');

    const storedToken = await RefreshToken.findOne({
        refreshToken:hashedToken
    });

    if(!storedToken)
        throw new AppError("Invalid token", 403)

        await RefreshToken.deleteMany({ userId: storedToken.userId });

        const {token, refreshToken, hashedToken: newHash} = generateToken(storedToken.userId);

        await RefreshToken.create({
            userId: storedToken.userId,
            refreshToken: newHash
        });

        return {token, refreshToken}
}

module.exports = {signUp, login, refresh}