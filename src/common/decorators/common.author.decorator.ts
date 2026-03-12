import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type ReqAuthor = {
  id: number;
  email: string;
  
};

export const CurrentAuthor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ReqAuthor | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: ReqAuthor }>();
    return req.user;
  },
);