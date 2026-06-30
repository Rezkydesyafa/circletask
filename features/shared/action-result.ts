import type { z } from "zod";

export type ActionFieldErrors = Record<string, string[]>;

export type ActionResult<T = undefined> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: ActionFieldErrors;
    };

export function getZodFieldErrors(error: z.ZodError): ActionFieldErrors {
  return error.flatten().fieldErrors as ActionFieldErrors;
}

