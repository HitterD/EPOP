import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(req: any): Promise<import("../entities/user.entity").User>;
    updateMe(req: any, dto: UpdateMeDto): Promise<import("../entities/user.entity").User>;
    presence(req: any, presence: 'available' | 'busy' | 'away' | 'offline'): Promise<import("../entities/user.entity").User>;
}
