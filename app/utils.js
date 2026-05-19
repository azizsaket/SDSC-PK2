import * as jose from "jose"
import * as readline from "node:readline";
import { text } from "node:stream/consumers";

/**
 * Encrypts data using the JSON Web Encryption (JWE) standard with asymmetric encryption.
 *
 * Expected behavior:
 * - Encodes input string to Uint8Array using `TextEncoder`
 * - Encrypts data with `jose.GeneralEncrypt` using A128CBC-HS256 as encoding
 * - Adds recipient's certificate as encryption key
 *
 * @param {string} data - Plaintext string to encrypt.
 * @param {CryptoKey} certificate - Public key used for encryption.
 * @returns {Promise<Object>} The encrypted JWE object.
 */
async function encryptData(data, certificate) {
    /* TASK 2.1 - encrypt */
    /* INSERT CODE HERE */
    const textEncoder = new TextEncoder()
    const encodedData = textEncoder.encode(data)
    const generalEncrypt = new jose.GeneralEncrypt(encodedData)

    generalEncrypt.setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A128CBC-HS256' })
    generalEncrypt.addRecipient(certificate)

    return await generalEncrypt.encrypt()

}

/**
 * Decrypts JWE-encrypted data using the recipient's private key.
 *
 * Expected behavior:
 * - Uses `jose.generalDecrypt` to decrypt the input
 * - Extracts `plaintext` from the result
 * - Decodes the plaintext using `TextDecoder` to get a string
 *
 * @param {Object} data - The JWE-encrypted data.
 * @param {CryptoKey} key - The private key used for decryption.
 * @returns {Promise<string>} The decrypted string.
 */
async function decryptData(data, key) {
    /* TASK 2.2 - decrypt */
    /* INSERT CODE HERE */
    const decryptedData = await jose.generalDecrypt(data, key)
    const plaintext = decryptedData.plaintext
    const textDecoder = new TextDecoder()
    return textDecoder.decode(plaintext)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/**
 * Helper function to asynchronously collect a single line of user input from the console.
 *
 * @returns {Promise<string>} The user's input.
 */
async function collectResponse() {
    return new Promise(resolve => rl.question('', resolve))
}

// Set this constant to true if you want to paste text with line breaks into the terminal.
// This is not needed if you are using GitHub Codespaces.
const ENABLE_MULTILINE_PASTE = false

/**
 * Collects multiline user input from the console until the user types 'done'.
 *
 * @returns {Promise<string>} The user's input.
 */
async function collectMultilineResponse() {
    if(!ENABLE_MULTILINE_PASTE)
        return collectResponse()

    return new Promise((resolve) => {
        let inputData = ''

        console.log("response? (Type 'done' to finish): ")

        rl.on('line', (line) => {
            if (line.toLowerCase() === 'done') {
                resolve(inputData)
            } else {
                inputData += line
            }
        })
    })
}

export {encryptData, decryptData, collectResponse, collectMultilineResponse, rl}