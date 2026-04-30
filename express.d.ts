import {JwtPayload} from "./src/shared/util/jwt.js"

declare global {
 namespace Express {
   interface Request {
     user: JwtPayload;
   }
 }
}