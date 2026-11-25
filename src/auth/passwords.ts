import { createHash, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";

export const MAX_PASSWORD_LENGTH = 128;
const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const ARGON2ID_PREFIX = "$argon2id$";

export async function hashPassword(password: string): Promise<string> {
    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new RangeError(
            `Password must not exceed ${MAX_PASSWORD_LENGTH} characters`,
        );
    }

    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19 * 1024,
        timeCost: 2,
        parallelism: 1,
    });
}

export async function verifyPassword(
    password: string,
    passwordHash: string,
): Promise<boolean> {
    if (password.length > MAX_PASSWORD_LENGTH) {
        return false;
    }

    if (LEGACY_SHA256_PATTERN.test(passwordHash)) {
        const candidate = createHash("sha256").update(password).digest();
        const stored = Buffer.from(passwordHash, "hex");
        return timingSafeEqual(candidate, stored);
    }

    if (passwordHash.startsWith(ARGON2ID_PREFIX)) {
        try {
            return await argon2.verify(passwordHash, password);
        } catch {
            return false;
        }
    }

    return false;
}

const PASSWORD_HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
} as const;

export function passwordNeedsRehash(passwordHash: string): boolean {
    if (LEGACY_SHA256_PATTERN.test(passwordHash)) {
        return true;
    }
    if (argon2.needsRehash(passwordHash, PASSWORD_HASH_OPTIONS)) {
        return true;
    }
    return false;
}
