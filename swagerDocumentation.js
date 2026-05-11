const swagger = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Splita API Documentation',
            version: '1.0.0',
            description: ' Swagger Documenting'
        },
        servers: [
            {
                url: "https://splita-7jyt.onrender.com",
                description: 'Hosted server'
            },
            {
                url: "http://localhost:3000",
                description: 'development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: [
        "./docs/user.yaml",
        "./docs/group.yaml"
    ]
}

module.exports = swagger(options)