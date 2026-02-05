import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN' | 'USUARIO'>) =>
  SetMetadata(ROLES_KEY, roles);
