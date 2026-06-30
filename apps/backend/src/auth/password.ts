import bcrypt from "bcryptjs";
import { config } from "../config/env";

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, config.auth.bcryptRounds);

export const verifyPassword = (
  plain: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(plain, hash);
