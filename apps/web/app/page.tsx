"use client";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/SocketProviders";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Awesome Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] mb-4" ref={scrollAreaRef}>
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start mb-4">
                <div className="bg-blue-500 rounded-full p-2 mr-2">
                  <User className="text-white" size={20} />
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-gray-800">{msg}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="mr-2" size={18} />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
