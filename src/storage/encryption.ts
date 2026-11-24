import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type EncryptedPayload = {
    nonce: Buffer;
    authTag: Buffer;
    ciphertext: Buffer;
};

function validateKey(key: Buffer): void {
    if (!Buffer.isBuffer(key) || key.length !== 32) {
        throw new Error("Key must be a 32-byte Buffer");
    }
}

function validatePayload(payload: EncryptedPayload): void {
    if (!payload || typeof payload !== "object") {
        throw new Error("Payload must be an object");
    }
    if (!Buffer.isBuffer(payload.nonce) || payload.nonce.length !== 12) {
        throw new Error("Nonce must be a 12-byte Buffer");
    }
    if (!Buffer.isBuffer(payload.authTag) || payload.authTag.length !== 16) {
        throw new Error("Auth tag must be a 16-byte Buffer");
    }
    if (!Buffer.isBuffer(payload.ciphertext)) {
        throw new Error("Ciphertext must be a Buffer");
    }
}

export function encrypt(plainText: Buffer, key: Buffer): EncryptedPayload {
    validateKey(key);
    if (!Buffer.isBuffer(plainText)) {
        throw new Error("Plain text must be a Buffer");
    }

    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, nonce, {
        authTagLength: 16,
    });

    const ciphertext = Buffer.concat([
        cipher.update(plainText),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
        nonce,
        authTag,
        ciphertext,
    };
}

export function decrypt(payload: EncryptedPayload, key: Buffer): Buffer {
    validateKey(key);
    validatePayload(payload);

    const decipher = createDecipheriv("aes-256-gcm", key, payload.nonce, {
        authTagLength: 16,
    });
    decipher.setAuthTag(payload.authTag);

    return Buffer.concat([
        decipher.update(payload.ciphertext),
        decipher.final(),
    ]);
}
