import {test, describe, it, after} from 'node:test';
import assert from 'node:assert';
import fs from "fs";
import * as jose from "jose";
import {encryptData, decryptData, rl} from "../app/utils.js";

const FH_CERT_PATH = './certs/FH.cer';
const FH_KEY_PATH = './certs/FH.pem';
let fhCert, fhKey;

test('Lab 2', async (t) => {
    await describe('base tests', () => {
        it('/certs should have the FH certificate', async () => {
            let fhCertIn = fs.readFileSync(FH_CERT_PATH, 'utf8')
            fhCert = await jose.importX509(fhCertIn, 'RSA-OAEP-256')
        })

        it('/certs should have the FH private key', async () => {
            let fhKeyIn = fs.readFileSync(FH_KEY_PATH, 'utf8')
            fhKey = await jose.importPKCS8(fhKeyIn, 'RSA-OAEP-256')
        })
    })

    await describe('encryption and decryption', () => {
        it('should encrypt', async () => {
            const data = 'Hello World!';
            const encrypted = await encryptData(data, fhCert);
            const decrypted = await decryptData(encrypted, fhKey);
            assert.strictEqual(decrypted, data, 'Decrypted data should match original data');
        });

        it('should handle empty inputs', async () => {
            const data = '';
            const encrypted = await encryptData(data, fhCert);
            const decrypted = await decryptData(encrypted, fhKey);
            assert.strictEqual(decrypted, data, 'Decrypted empty data should be an empty string');
        });

        it('should handle all UTF-8 characters', async () => {
            const data = '😈 🉑 🀄 𓂀 𐍈 ⸘ ௵ ༃ ፨ ꙮ ᚠ 𐰀 ☭ ⚛ ☢';
            const encrypted = await encryptData(data, fhCert);
            const decrypted = await decryptData(encrypted, fhKey);
            assert.strictEqual(decrypted, data, 'Decrypted data should match original data');
        });

        it('should have randomness', async () => {
            const data = 'Random';
            const encrypted1 = await encryptData(data, fhCert);
            const encrypted2 = await encryptData(data, fhCert);
            assert.notDeepStrictEqual(encrypted1, encrypted2, 'Encrypted outputs should not be the same');
        })

        it('should handle large inputs', async () => {
            const data = 'A'.repeat(100_000);
            const encrypted = await encryptData(data, fhCert);
            const decrypted = await decryptData(encrypted, fhKey);
            assert.strictEqual(decrypted, data, 'Decrypted data should match original data');
        });
    })

    after(() => {
        rl.close()
    });
})