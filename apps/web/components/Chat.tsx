"use client"

import ChatMessage from "./ChatMessage"
import QueryInput from "./QueryInput"

export default function Chat() {
    return (
        <div className="flex-1/3 flex flex-col">
            <ChatMessage />
            <QueryInput />
        </div>
    )
}