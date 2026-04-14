import { io } from "socket.io-client"
import {collectMultilineResponse, collectResponse} from "./utils.js"

console.log('starting client')

const URL = "ws://localhost:8080"
const socket = io(URL, {})

socket.onAny((event, ...args) => {
    console.log(`received: ${JSON.stringify(args)}`)
})

async function main(response) {
    if(response) {
        socket.emit('response', await collectMultilineResponse())
    } else {
        console.log('which command do send?:')
        const event = await collectResponse()
        console.log('any additional data to send?:')
        const data = await collectResponse()
        socket.emit(event, data)
    }

    //wait until response is given with a 2 seconds timeout
    let res = await Promise.race([
        new Promise(resolve => socket.onAny((event) => resolve(event))),
        new Promise((resolve, _) => setTimeout(() => resolve('timeout'), 2000))
    ])

    res === 'needs-response' ? main(true) : main(false)
}

await main(false)