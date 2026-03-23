import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig:NextAuthOptions = {
    providers:[
        Google({
            clientId:process.env.GOOGLE_CLIENT_ID!,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET!
        })
    ]
}