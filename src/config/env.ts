import { validateEnv } from "./envValidation.js";
import dotenv from "dotenv";

dotenv.config();

// 환경 변수 검증 및 설정
export const config = validateEnv();
