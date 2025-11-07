import { Request, Response } from "express";
import { ApiResponse } from "../models/index.js";

export const getUsers = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Users endpoint",
      users: [],
      count: 0,
    },
  };

  res.json(response);
};


