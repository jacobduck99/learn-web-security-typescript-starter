export type EncryptedPayload = {
    nonce: Buffer;
    authTag: Buffer;
    cipherText: Buffer;
};

function validateKey(key: Buffer): void {
    if (!Buffer.isBuffer(key) && Buffer.length === 32) {
        throw new Error("key is not a buffer");
    }
}
