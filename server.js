require('dotenv').config();
require('./models/user');
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = require('./swagerDocumentation');
const express_session = require('express-session');
const {passport} = require('./middlewares/passport');
const userRouter = require('./router/user');
const groupRouter = require('./router/group');
const requestRouter = require('./router/request');
const paymentRouter = require('./router/payment');

const  rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 15 minutes
	max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests from this IP, please try again after 5 minutes',
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

app.use(express.json())

app.use(express_session({
    secret: 'Oshio-Ella',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
// app.use('/api/v1/user/login',limiter) // Apply the rate limiting middleware to the login route
app.use('/api/v1/user/reset-password',limiter) // Apply the rate limiting middleware to the reset password route

app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/user',userRouter)
app.use('/api/v1/group',groupRouter)
app.use('/api/v1',requestRouter)
app.use('/api/v1',paymentRouter)


app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    })
})

app.use((err, req, res, next) => {
    console.log(err.message)
    res.status(500).json({
        message: err.message
    })
})

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to Database');
    app.listen(PORT, () => {
    console.log(`PORT:${PORT}`)
})
})
.catch((error) => {
    console.log('Error connecting to database', error.message);
})
