"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT') ?? 4000;
    const corsOrigin = (config.get('CORS_ORIGIN') ?? '').split(',').map(s => s.trim()).filter(Boolean);
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: corsOrigin.length > 0 ? corsOrigin : true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
        validationError: { target: false, value: false },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('EPOP API')
        .setDescription('REST API documentation for EPOP backend')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, { useGlobalPrefix: false });
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map