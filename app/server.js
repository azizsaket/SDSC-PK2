import {Server} from "socket.io"
import crypto from "crypto"
import fs from "fs"
import {decryptData, encryptData} from "./utils.js"

console.log('starting server')

//task 1 - Setup
import * as jose from 'jose'
import { log } from "console"
const fhCertIn= fs.readFileSync('./certs/FH.cer', 'utf-8')
const fhCert= await jose.importX509(fhCertIn, 'RSA-OAEP-256')
const fhKeyIn= fs.readFileSync('./certs/FH.pem', 'utf-8')
const fhKey= await jose.importPKCS8(fhKeyIn, 'RSA-OAEP-256')

console.log(fhCert)
console.log(fhKey)


const server = new Server(8080)

server.on("connection", (socket) => {
    socket.onAny((event, ...args) => {
        console.log(`received: ${JSON.stringify(args)}`)
    })

    socket.on('echo', (data) => {
        socket.send(data)
    })

    socket.on('helloworld', () => {
        socket.send('Hello World!')
    })

    socket.on('exit', () => {
        socket.close()
    })

    socket.on('help', () => {
        socket.send('available commands: [echo, helloworld, exit, help, unsafe-ch-resp, safe-ch-resp]')
    })

    socket.on('unsafe-ch-resp', () => {
        let challenge = generateChallenge()

        socket.emit('needs-response', `challenge: '${challenge.first},${challenge.second}', please send me an unencrypted response`)

        socket.once('response', async (response) => {
            response === String(challenge.sum)
                ? socket.send('success')
                : socket.send('failure')
        })
    })

    /* TASK 4 - Implementing a safe challenge-response procedure with a pre-shared key */
    socket.on('safe-ch-resp', () => {
        socket.emit('needs-response', 'challenge: please send me PSK') //ask for PSK first
        socket.once('response', async (response) => { 
            const psk= BigInt(response)  //convert PSK to BigInt
            const challenge = generateChallenge() //generate challenge
            const secondModified= challenge.second + psk //modify second number with PSK
            const challengeString= `${challenge.first},${secondModified}` //create challenge string with modified second number
            const encryptedChallenge= await encryptData(challengeString, fhCert) //encrypt challenge with FH's certificate
            const hexEncryptedChallenge= Buffer.from(JSON.stringify(encryptedChallenge)).toString('hex')//convert to hex
            socket.emit('needs-response', hexEncryptedChallenge)  //send encrypted challenge
            
            socket.once('response', async (encryptedResponse) => { 
                const parsedresponse= Buffer.from(encryptedResponse, 'hex').toString('utf8')//convert from hex to utf8
                const decryptedResponse= await decryptData(JSON.parse(parsedresponse), fhKey) //decrypt response with FH's private key
                const expectedResponse= String(challenge.first + challenge.second) //expected response is the sum of the original first and second numbers (without PSK modification)
                decryptedResponse === expectedResponse
                    ? socket.send('success')
                    : socket.send('failure')
            })
        })
    })




})  
        
/**
 * Generates a challenge consisting of two random numbers and their sum.
 *
 * @returns {{first: BigInt, second: BigInt, sum: BigInt}} The two random numbers and their sum.
 */
function generateChallenge() {
    const firstRandomNumber = BigInt(Math.abs(crypto.randomInt(0, 2 ** 31)))
    const secondRandomNumber = BigInt(Math.abs(crypto.randomInt(0, 2 ** 31)))
    const sum = firstRandomNumber + secondRandomNumber

    return {first: firstRandomNumber, second: secondRandomNumber, sum: sum}
}