import {Server} from "socket.io"
import crypto from "crypto"
import fs from "fs"
import {decryptData, encryptData} from "./utils.js"

console.log('starting server')

/* TASK 1 - Setup */
/* INSERT CODE HERE */

//Import the jose library

//Read the certificate

//Import the certificate with jose

//Read the private key

//Import the private key with jose

//Verify that everything was successful

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
    /* INSERT CODE HERE */
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