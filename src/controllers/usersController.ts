import { BadRequestError, NotFoundError } from "../errors/CustomError.js";
import { ApiResponse } from "../models/index.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../services/usersService.js";
import { NextFunction, Request, Response } from "express";

// 모든 사용자 조회
export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const users = getAllUsers();
    const response: ApiResponse = {
      success: true,
      data: {
        users,
        count: users.length,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// 특정 사용자 조회
export const getUserByIdHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new BadRequestError("유효하지 않은 사용자 ID입니다");
    }

    const user = getUserById(id);

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다");
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// 사용자 생성
export const createUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new BadRequestError("이름과 이메일은 필수입니다");
    }

    // 이메일 형식 검증 (간단한 검증)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("유효하지 않은 이메일 형식입니다");
    }

    const newUser = createUser({ name, email });
    const response: ApiResponse = {
      success: true,
      data: newUser,
      message: "사용자가 생성되었습니다",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// 사용자 수정
export const updateUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new BadRequestError("유효하지 않은 사용자 ID입니다");
    }

    const { name, email } = req.body;

    // 최소 하나의 필드는 수정되어야 함
    if (!name && !email) {
      throw new BadRequestError("수정할 정보를 입력해주세요");
    }

    // 이메일 형식 검증 (이메일이 제공된 경우)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError("유효하지 않은 이메일 형식입니다");
      }
    }

    const updatedUser = updateUser(id, { name, email });
    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: "사용자 정보가 수정되었습니다",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// 사용자 삭제
export const deleteUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new BadRequestError("유효하지 않은 사용자 ID입니다");
    }

    deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
