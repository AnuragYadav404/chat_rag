"use client"

import axios from "axios";
import { ChangeEvent, useRef } from "react"

// here we create a button for user to uplaod a file on the client
// the file is then sent to the backend via a fetch request
export default function FileUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileUploadButtonClick() {
        console.log("Handles filuploadbutton click")
        fileInputRef.current?.click();
    }

    function handleFileChange(ev:ChangeEvent<HTMLInputElement>) {
        if(!ev.target.files || ev.target.files.length===0) {
            console.log("File upload failed")
            return;
        }
        const file = ev.target.files[0];
        if(file) {
            const formData = new FormData();
            formData.append("file", file);
            axios.post("http://localhost:8000/fileUpload", formData);
            console.log("File uploaded: ", file)
        }
        ev.target.value = "";
       
    }

    return (
        <div className="flex-1 border-r-indigo-100 border-r-2 flex justify-center items-center">
            <div className="border-2 border-amber-100 rounded-2xl p-2">
                <button onClick={handleFileUploadButtonClick}>Select File</button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>
            
        </div>
    )
}