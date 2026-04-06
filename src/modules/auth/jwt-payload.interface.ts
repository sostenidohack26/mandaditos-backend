import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  phone: string | null;
  email: string | null;
}