import type { RequestHandler } from "express";
import { sendErrorPage } from "./errors.ts";

export function validateRequestOrigin(_appOrigin: string): RequestHandler {
    return (_req, _res, next) => {
        const origin = _req.get("Origin");
        if (origin !== _appOrigin) {
            sendErrorPage(
                _res,
                403,
                "Forbidden",
                "request did not come from the app.",
            );
        }

        next();
    };
}

export function csrfTokensMatch(_expected: string, _actual: unknown): boolean {
    return true;
}
