import { Dispatch, SetStateAction, useState } from "react"

export default function QueryInput(props: {setMessages: Dispatch<SetStateAction<string[]>>, setNewMessage: Dispatch<SetStateAction<string>>}) {

    const [query, setQuery] = useState("");

    async function handleQuerySubmit() {
        if(query) {
            const response = await fetch("http://localhost:8000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query })
            })
            const reader = response.body?.getReader();
            let fullResponse = ""
            if (!reader) throw new Error("No body returned from server");

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const text = decoder.decode(value);
                
                fullResponse += text;
                props.setNewMessage(fullResponse);
                

            }
            console.log("Setting messages");
            props.setNewMessage("")
            props.setMessages(msg => [...msg, fullResponse])
            console.log("done setting messages");

        }
    }

    return (
        <div className="flex p-2">
            <div className=" flex-1">
                <input type="text" placeholder="Enter your query" className=" rounded-2xl p-2 flex-1 w-full" onChange={(e) => setQuery(e.target.value)} value={query}/>
            </div>
            <div className="bg-zinc-100 ml-2">
                <button className="bg-zinc-300 rounded-2xl p-2" onClick={handleQuerySubmit}>Send</button>
            </div>
        </div>
    )
}