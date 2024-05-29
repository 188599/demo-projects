import { ILoginRequest } from "./login-request.interface";

export interface ISignupRequest extends ILoginRequest {

    email: string;

}