import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  phone: string;
  email: string | null;
}