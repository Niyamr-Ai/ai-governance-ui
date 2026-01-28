import "../styles/globals.css";
import Chatbot from "@/components/chatbot/Chatbot";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Chatbot />
    </>
  );
}
