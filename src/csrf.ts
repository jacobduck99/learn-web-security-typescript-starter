import type { RequestHandler } from "express";
import { sendErrorPage } from "./errors.ts";
import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";

export function validateRequestOrigin(appOrigin: string): RequestHandler {
    return (req, res, next) => {
        if (req.method !== "POST") {
            next();
            return;
        }

        const origin = req.get("Origin");
        if (origin) {
            if (origin !== appOrigin) {
                sendErrorPage(
                    res,
                    403,
                    "Forbidden",
                    "Request did not come from the app.",
                );
                return;
            }
            next();
            return;
        }

        try {
            const referer = req.get("Referer");
            if (!referer || new URL(referer).origin !== appOrigin) {
                sendErrorPage(
                    res,
                    403,
                    "Forbidden",
                    "Request did not come from the app.",
                );
                return;
            }
            next();
        } catch {
            sendErrorPage(
                res,
                403,
                "Forbidden",
                "Request did not come from the app.",
            );
        }
    };
}

export function csrfTokensMatch(expected: string, actual: unknown): boolean {
    if (typeof actual !== "string") {
        return false;
    }
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    let res = timingSafeEqual(expectedBuffer, actualBuffer);
    return res;
}
