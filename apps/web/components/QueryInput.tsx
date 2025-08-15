import axios from "axios";
import { useState } from "react"

export default function QueryInput() {

    const [query, setQuery] = useState("");

    async function handleQuerySubmit() {
        if(query) {
            const response = await axios.post("http://localhost:8000/query", {
                query: query
            })
            console.log("response from server: ", response);
        }
    }

    return (
        <div className="flex p-2">
            <div className="bg-amber-100 flex-1">
                <input type="text" placeholder="Enter your query" className="bg-amber-200 rounded-2xl p-2 flex-1 w-full" onChange={(e) => setQuery(e.target.value)} value={query}/>
            </div>
            <div className="bg-zinc-100 ml-2">
                <button className="bg-zinc-300 rounded-2xl p-2" onClick={handleQuerySubmit}>Send</button>
            </div>
        </div>
    )
}