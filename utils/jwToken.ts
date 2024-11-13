import jwt from 'jsonwebtoken';

const jwToken = (userId: String) => {
    const secretKey= process.env.JWT_SECRET; 

    return jwt.sign({ userId }, secretKey as string, {
        expiresIn: '1h' 
    });
};

export default jwToken;