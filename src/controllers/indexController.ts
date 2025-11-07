import { Request, Response } from "express";
import { ApiResponse } from "../models/index.js";

export const getHome = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Welcome to Express API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};


