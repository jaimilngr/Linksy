"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinInput = exports.signupInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupInput = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(8, "Password must be atleast 8 characters"),
    name: zod_1.default.string().min(1),
    contactNo: zod_1.default.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid contact number"),
    type: zod_1.default.string().optional(),
    location: zod_1.default.string()
});
exports.signinInput = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default.string().min(8, "Password must be at least 8 characters long"),
});
