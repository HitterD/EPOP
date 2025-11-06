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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLink = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileLink = class FileLink {
    id;
    file;
    refTable;
    refId;
};
exports.FileLink = FileLink;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], FileLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.FileEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.FileEntity)
], FileLink.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ref_table', type: 'text' }),
    __metadata("design:type", String)
], FileLink.prototype, "refTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ref_id', type: 'bigint' }),
    __metadata("design:type", String)
], FileLink.prototype, "refId", void 0);
exports.FileLink = FileLink = __decorate([
    (0, typeorm_1.Entity)({ name: 'file_links' })
], FileLink);
//# sourceMappingURL=file-link.entity.js.map