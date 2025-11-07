import { ConflictError, NotFoundError } from "../errors/CustomError.js";
import { CreateUserInput, UpdateUserInput, User } from "../models/User.js";

// 임시 데이터 저장소 (나중에 데이터베이스로 교체)
const users: User[] = [];
let nextId = 1;

// 모든 사용자 조회
export const getAllUsers = (): User[] => {
  return users;
};

// ID로 사용자 조회
export const getUserById = (id: number): User | undefined => {
  return users.find((user) => user.id === id);
};

// 사용자 생성
export const createUser = (input: CreateUserInput): User => {
  // 이메일 중복 검사
  const existingUser = users.find((user) => user.email === input.email);
  if (existingUser) {
    throw new ConflictError("이미 존재하는 이메일입니다");
  }

  const newUser: User = {
    id: nextId++,
    name: input.name,
    email: input.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  return newUser;
};

// 사용자 수정
export const updateUser = (id: number, input: UpdateUserInput): User => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    throw new NotFoundError("사용자를 찾을 수 없습니다");
  }

  // 이메일 변경 시 중복 검사
  if (input.email && input.email !== users[userIndex].email) {
    const existingUser = users.find((user) => user.email === input.email);
    if (existingUser) {
      throw new ConflictError("이미 존재하는 이메일입니다");
    }
  }

  const updatedUser: User = {
    ...users[userIndex],
    ...input,
    updatedAt: new Date(),
  };

  users[userIndex] = updatedUser;
  return updatedUser;
};

// 사용자 삭제
export const deleteUser = (id: number): boolean => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    throw new NotFoundError("사용자를 찾을 수 없습니다");
  }

  users.splice(userIndex, 1);
  return true;
};
