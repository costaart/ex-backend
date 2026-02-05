import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

type AuthenticatedUser = {
  userId: string;
  role: 'ADMIN' | 'USUARIO';
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //pega os roles setados
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }

    const userHasPermission = requiredRoles.includes(user.role);

    if (!userHasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
