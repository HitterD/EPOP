"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("../entities/file.entity");
const file_link_entity_1 = require("../entities/file-link.entity");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const uuid_1 = require("uuid");
let FilesService = class FilesService {
    files;
    links;
    config;
    s3;
    bucket;
    constructor(files, links, config) {
        this.files = files;
        this.links = links;
        this.config = config;
        const endpoint = this.config.get('MINIO_ENDPOINT') || 'localhost';
        const port = this.config.get('MINIO_PORT') || 9000;
        const useSSL = !!this.config.get('MINIO_USE_SSL');
        const accessKeyId = this.config.get('MINIO_ACCESS_KEY') || 'minio';
        const secretAccessKey = this.config.get('MINIO_SECRET_KEY') || 'minio123';
        this.bucket = this.config.get('MINIO_BUCKET') || 'epop';
        this.s3 = new client_s3_1.S3Client({
            region: 'us-east-1',
            endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
            forcePathStyle: true,
            credentials: { accessKeyId, secretAccessKey },
        });
    }
    async presign(ownerId, filename) {
        const key = `${(0, uuid_1.v4)()}-${filename}`;
        const form = await (0, s3_presigned_post_1.createPresignedPost)(this.s3, {
            Bucket: this.bucket,
            Key: key,
            Conditions: [
                ['content-length-range', 1, 50 * 1024 * 1024],
            ],
            Expires: 300,
        });
        const file = await this.files.save(this.files.create({ ownerId: ownerId ?? null, filename, s3Key: key, mime: null, size: null }));
        return { url: form.url, fields: form.fields, fileId: file.id, key };
    }
    async attach(fileId, dto) {
        const file = await this.files.findOne({ where: { id: fileId } });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        if (dto.filename !== undefined)
            file.filename = dto.filename;
        if (dto.mime !== undefined)
            file.mime = dto.mime ?? null;
        if (dto.size !== undefined)
            file.size = String(dto.size);
        await this.files.save(file);
        const link = await this.links.save(this.links.create({ file: { id: fileId }, refTable: dto.refTable, refId: dto.refId }));
        return { success: true, linkId: link.id };
    }
    async get(id) {
        const file = await this.files.findOne({ where: { id } });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        return file;
    }
    async remove(id) {
        const file = await this.files.findOne({ where: { id } });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        await this.files.remove(file);
        return { success: true };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.FileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(file_link_entity_1.FileLink)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map