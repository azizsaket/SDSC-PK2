import {collectMultilineResponse, collectResponse, decryptData, encryptData} from "./utils.js"
import * as jose from 'jose'
import fs from "fs"

console.log('starting helper')

async function main() {
    let choice

    /* TASK 1 - Setup */
   //task 1 - Setup
   const fhCertIn= fs.readFileSync('./certs/FH.cer', 'utf-8')
   const fhCert= await jose.importX509(fhCertIn, 'RSA-OAEP-256')
   const fhKeyIn= fs.readFileSync('./certs/FH.pem', 'utf-8')
   const fhKey= await jose.importPKCS8(fhKeyIn, 'RSA-OAEP-256')
   
   console.log(fhCert)
   console.log(fhKey)

    do {
        let encryptedResponse, base64EncryptedResponse, result, psk, sum, response, hexEncryptedResponse,
            decryptedRawChallenge, numbersArray, first, second

        choice = await getChoice()

        switch (choice) {
            case 1: // Encrypt a message
                console.log('Please enter the message to encrypt: ')
                encryptedResponse = await encryptData(await collectResponse(), cert)
                base64EncryptedResponse = Buffer.from(JSON.stringify(encryptedResponse)).toString('base64')
                console.log("Encrypted response (Base64): " + base64EncryptedResponse)
                console.log()
                break

            case 2: // Encrypt a message with PSK
                console.log('Please enter the result: ')
                result = BigInt(await collectResponse())
                console.log('Please enter the psk of the challenge:')
                psk = BigInt(await collectResponse())
                sum = result - psk
                response = sum.toString()
                encryptedResponse = await encryptData(response, fhCert)
                hexEncryptedResponse = Buffer.from(JSON.stringify(encryptedResponse)).toString('hex')
                console.log("Encrypted response (hex): " + hexEncryptedResponse)
                console.log()
                break

            case 3: // Decode a hex-encoded message
                console.log('Please enter the hex-encoded message: ')
                response = Buffer.from(await collectMultilineResponse(), 'hex').toString('utf8')
                decryptedRawChallenge = await decryptData(JSON.parse(response), fhKey)
                console.log("Decrypted challenge: " + decryptedRawChallenge)
                console.log()
                break

            case 4: // Add two comma-separated numbers
                console.log('Please enter two comma-separated numbers:')
                numbersArray = (await collectResponse()).split(',')
                first = BigInt(numbersArray[0])
                second = BigInt(numbersArray[1])
                console.log("Sum: " + (first + second))
                console.log()
                break

            default:
                console.log('Invalid choice')
                break
        }
    } while (choice !== 0)
}

async function getChoice() {
    console.log(`
        How can I help?
        ---------------
        0) Exit program
        1) Encrypt a message
        2) Encrypt a message with PSK
        3) Decode a hex-encoded message
        4) Add two comma-separated numbers
        `)
    return Number(await collectResponse())
}

await main()