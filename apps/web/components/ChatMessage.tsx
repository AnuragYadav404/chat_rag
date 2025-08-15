export default function ChatMessage(props: {messages: any, newMessage: string}) {
    const newMessageLines = props.newMessage.split("\n");
    return (
        <div className="flex flex-1">
            <div>
                {props.messages.map((msg: string, i:number) => {
                    const lines = msg.split("\n");
                    return lines.map((line, ind2) => {
                            return ( 
                                // here we need to parse the messages based on /n/n
                                <p key={i+""+ind2}>{line}</p>
                                
                            )
                    })
                    
                })}
                {newMessageLines.map((ln, i) => {
                    return (
                        <p key={i}>{ln}</p>
                    )
                })}
            </div> 
        </div>
    )
}