// reference : how to connect swagger with express
// https://any-ting.tistory.com/105
// https://gngsn.tistory.com/69

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "gong-around",
      description:
        "The project for those who want to make their time more useful around the airport.",
    },
    host: `localhost:${process.env.PORT}`,
    basePath: "/",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // reference : why swagger shows only "No operations defined in spec!"
  // https://velog.io/@fkstndnjs/Node.js-No-operations-defined-in-spec-%EC%97%90%EB%9F%AC
  apis: ["routes/*.ts"], // Swagger 파일 연동
};

const spec = swaggerJsdoc(options);

export { swaggerUi, spec };
