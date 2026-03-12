import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';


type JwtPayload = {
    sub: number;
    email: string;
}

export class JwtStratege extends PassportStrategy(Strategy) {
    constructor(cfg: ConfigService) {
        const JwtFromRequest: JwtFromRequestFunction = ExtractJwt.fromAuthHeaderAsBearerToken()

        const secret = cfg.get<string>("JWT_ACCESS_SECRET")
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET not found")
        }
        super({
            JwtFromRequest,
            ignoreExpiration: false,
            secretOrKey: secret
        })

    }
    validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            email: payload.email,

        };
    }
}