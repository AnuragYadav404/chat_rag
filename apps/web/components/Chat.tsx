"use client"

import { useState } from "react"
import ChatMessage from "./ChatMessage"
import QueryInput from "./QueryInput"

export default function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    return (
        <div className="flex-1/3 flex flex-col">
            <ChatMessage messages={messages} newMessage={newMessage}/>
            <QueryInput setMessages={setMessages} setNewMessage={setNewMessage}/>
        </div>
    )
} 