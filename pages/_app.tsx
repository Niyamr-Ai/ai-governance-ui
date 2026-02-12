import "../styles/globals.css";
import Chatbot from "@/components/chatbot/Chatbot";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Chatbot />
      <Toaster theme="light" position="top-right" />
    </>
  );
}
