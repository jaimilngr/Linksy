import z from "zod";

const ServiceProviderModeEnum = z.enum(['offline', 'online']);

export const signupInput = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6,"Password must be atleast 6 characters"),
    name: z.string().min(1),
    role: z.string(),
    contactNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid contact number"),
    mode: ServiceProviderModeEnum.optional(),
});

export type SignupType = z.infer<typeof signupInput>;

export const signinInput = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
});

export type SigninType = z.infer<typeof signinInput>;

