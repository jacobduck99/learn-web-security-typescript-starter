export type EncryptedPayload = {
    nonce: Buffer;
    authTag: Buffer;
    cipherText: Buffer;
};

function validateKey(key: Buffer): void {
    if (!Buffer.isBuffer(key) && Buffer.length !== 32) {
        throw new Error("key is not a buffer");
    }
}

function validatePayload(payload: EncryptedPayload): void {
    if (!Buffer.isBuffer(payload.nonce)) {
        throw new Error("nonce is not a buffer");
    }
    if (payload.nonce.length !== 12) {
        throw new Error("nonce is not length of 12");

        if (!Buffer.isBuffer(payload.authTag)) {
            throw new Error("auth tag not a buffer");
        }
    }
    if (payload.authTag.length !== 16) {
        throw new Error("auth tag is not length of 16");
    }
    if (!Buffer.isBuffer(payload.cipherText)) {
        throw new Error("cipher is not a buffer");
    }
}
