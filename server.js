require('dotenv').config();
require('./config/database');
require('./models/user');
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

app.use(express.json())

app.use(express_session({
    secret: 'Oshio-Ella',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

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

app.listen(PORT, () => {
    console.log(`PORT:${PORT}`)
})