import { hash, timingSafeEqual } from "node:crypto";
import * as argon2 from "argon2";

export const MAX_PASSWORD_LENGTH = 128;
const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;

export async function hashPassword(password: string): Promise<string> {
    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new RangeError(
            `Password must not exceed ${MAX_PASSWORD_LENGTH} characters`,
        );
    }

    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19 * 1024,
        timeCost: 2,
        parallelism: 1,
    });
    return hash;
}

export function verifyPassword(
    password: string,
    passwordHash: string,
): boolean {
    if (password.length > MAX_PASSWORD_LENGTH) {
        return false;
    }

    if (!LEGACY_SHA256_PATTERN.test(passwordHash)) {
        return false;
    }

    const candidateHash = Buffer.from(hashPassword(password), "hex");
    const storedHash = Buffer.from(passwordHash, "hex");
    return timingSafeEqual(candidateHash, storedHash);
}
