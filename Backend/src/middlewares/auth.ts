import { Request, Response, NextFunction } from "express";
import { webhookConfig } from "../config";
import { ApiResponse } from "../types";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const response: ApiResponse = {
      success: false,
      error: "Unauthorized: No token provided or invalid format",
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.split(" ")[1];

  if (token !== webhookConfig.authToken) {
    const response: ApiResponse = {
      success: false,
      error: "Unauthorized: Invalid token",
    };
    res.status(401).json(response);
    return;
  }

  next();
};

