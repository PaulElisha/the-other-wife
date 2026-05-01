import {JwtPayload} from "./shared/util/jwt.js"

declare global {
 namespace Express {
   interface Request {
     user: JwtPayload;
   }
 }
}