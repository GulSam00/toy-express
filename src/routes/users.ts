import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsers,
  updateUserHandler,
} from "../controllers/usersController.js";
import { Router } from "express";

const router = Router();

// GET /api/users - 모든 사용자 조회
router.get("/", getUsers);

// GET /api/users/:id - 특정 사용자 조회
router.get("/:id", getUserByIdHandler);

// POST /api/users - 사용자 생성
router.post("/", createUserHandler);

// PUT /api/users/:id - 사용자 수정
router.put("/:id", updateUserHandler);

// DELETE /api/users/:id - 사용자 삭제
router.delete("/:id", deleteUserHandler);

export default router;
