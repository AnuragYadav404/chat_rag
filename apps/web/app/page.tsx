import Chat from "../components/Chat";
import FileUpload from "../components/FileUpload";

export default function Page() {
  return (
    // this will render two components
    // File upload and chat component
    // 1. File upload component needs to be implemented
    // 2. Next we implement the chat component
    // Both components will be client components
    <div className="flex h-screen w-screen flex-1"> 
        <FileUpload/>
        <Chat />
      </div>
  );
}
