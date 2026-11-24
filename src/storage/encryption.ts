export type EncryptedPayload = {
    nonce: Buffer;
    authTag: Buffer;
    cipherText: Buffer;
};
