import z from "zod";
export declare const signupInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    contactNo: z.ZodString;
    mode: z.ZodOptional<z.ZodEnum<["offline", "online"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: string;
    contactNo: string;
    mode?: "offline" | "online" | undefined;
}, {
    email: string;
    password: string;
    name: string;
    role: string;
    contactNo: string;
    mode?: "offline" | "online" | undefined;
}>;
export type SignupType = z.infer<typeof signupInput>;
export declare const signinInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type SigninType = z.infer<typeof signinInput>;
