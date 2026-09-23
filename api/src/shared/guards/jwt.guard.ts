import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { GqlExecutionContext } from '@nestjs/graphql';

export class JwtGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }

    getRequest(context: ExecutionContext) {
        if (context.getType() === 'http') {
            return context.switchToHttp().getRequest();
        }
        return GqlExecutionContext.create(context).getContext().req;
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status: any) {
        if (info instanceof TokenExpiredError) {
            throw new UnauthorizedException({
                message: 'Token expired',
                code: 'token_expired',
            });
        }

        if (info instanceof JsonWebTokenError) {
            throw new UnauthorizedException({
                message: 'Invalid token',
                code: 'invalid_token',
            });
        }

        if (err || !user) {
            throw new UnauthorizedException({
                message: 'Authentication required',
                code: 'authentication_required',
            });
        }

        if (context.getType() !== 'http') {
            GqlExecutionContext.create(context).getContext().user = user;
        }

        return super.handleRequest(err, user, info, context, status);
    }
}
