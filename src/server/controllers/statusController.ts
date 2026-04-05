import { Request, Response } from "express";
import { statusDrodpown } from "../models/statusModel";

export const getStatusDropdown = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const status = statusDrodpown();
    res.status(200).json(status);
  } catch (error) {
    console.error("Error fetching status dropdown:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
