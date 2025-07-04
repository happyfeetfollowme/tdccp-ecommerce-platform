const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    console.log("Order service authenticateJWT middleware hit");
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log("Token received:", token);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("JWT verification failed:", err);
                return res.sendStatus(403);
            }

            req.userId = user.userId; // Extract userId from JWT payload
            console.log("Authenticated user ID:", req.userId);
            next();
        });
    } else {
        console.log("Authorization header missing");
        res.sendStatus(401);
    }
};

module.exports = { authenticateJWT };
