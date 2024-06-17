import { User } from "../models/user";

export interface IAuthResponse {

    token: string;

    user: User;

}