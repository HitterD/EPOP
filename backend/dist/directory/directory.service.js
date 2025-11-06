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
exports.DirectoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const org_unit_entity_1 = require("../entities/org-unit.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let DirectoryService = class DirectoryService {
    orgs;
    users;
    constructor(orgs, users) {
        this.orgs = orgs;
        this.users = users;
    }
    async tree() {
        const rows = await this.orgs.query(`
      WITH RECURSIVE tree AS (
        SELECT id, parent_id, name, 0 AS depth, ARRAY[id] AS path
        FROM org_units WHERE parent_id IS NULL
        UNION ALL
        SELECT o.id, o.parent_id, o.name, t.depth+1, t.path||o.id
        FROM org_units o JOIN tree t ON o.parent_id = t.id
      )
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id, 'name', name,
          'children', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object('id', c.id, 'name', c.name)
            ), '[]'::jsonb)
            FROM org_units c WHERE c.parent_id = tree.id
          )
        ) ORDER BY path
      ) AS org_tree
      FROM tree WHERE depth = 0;
    `);
        const orgTree = rows?.[0]?.org_tree ?? [];
        return { orgTree };
    }
    async create(dto) {
        const entity = this.orgs.create({ name: dto.name, code: dto.code ?? null });
        if (dto.parentId) {
            const parent = await this.orgs.findOne({ where: { id: dto.parentId } });
            if (!parent)
                throw new common_1.NotFoundException('Parent not found');
            entity.parent = parent;
        }
        return this.orgs.save(entity);
    }
    async update(id, dto) {
        const org = await this.orgs.findOne({ where: { id } });
        if (!org)
            throw new common_1.NotFoundException('Org unit not found');
        if (dto.name !== undefined)
            org.name = dto.name;
        if (dto.code !== undefined)
            org.code = dto.code;
        return this.orgs.save(org);
    }
    async remove(id) {
        const org = await this.orgs.findOne({ where: { id } });
        if (!org)
            throw new common_1.NotFoundException('Org unit not found');
        return this.orgs.remove(org);
    }
    async move(id, newParentId) {
        if (id === newParentId)
            throw new common_1.BadRequestException('Cannot move into itself');
        const org = await this.orgs.findOne({ where: { id }, relations: { parent: true } });
        if (!org)
            throw new common_1.NotFoundException('Org unit not found');
        if (newParentId) {
            const parent = await this.orgs.findOne({ where: { id: newParentId } });
            if (!parent)
                throw new common_1.NotFoundException('Parent not found');
            org.parent = parent;
        }
        else {
            org.parent = null;
        }
        return this.orgs.save(org);
    }
    async usersInOrg(orgId) {
        return this.users.query(`SELECT u.id, u.display_name, u.email, u.phone_ext, u.presence
       FROM users u
       JOIN org_units o ON o.id = u.org_unit_id
       WHERE o.id = $1
       ORDER BY u.display_name;`, [orgId]);
    }
    async moveUserToOrg(userId, orgId) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const org = await this.orgs.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Org unit not found');
        user.orgUnit = org;
        return this.users.save(user);
    }
};
exports.DirectoryService = DirectoryService;
exports.DirectoryService = DirectoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(org_unit_entity_1.OrgUnit)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DirectoryService);
//# sourceMappingURL=directory.service.js.map