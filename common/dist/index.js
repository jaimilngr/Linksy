"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinInput = exports.signupInput = void 0;
const zod_1 = __importDefault(require("zod"));
const ServiceProviderModeEnum = zod_1.default.enum(['offline', 'online']);
exports.signupInput = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be atleast 6 characters"),
    name: zod_1.default.string().min(1),
    role: zod_1.default.string(),
    contactNo: zod_1.default.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid contact number"),
    mode: ServiceProviderModeEnum.optional(),
});
exports.signinInput = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters long"),
});
