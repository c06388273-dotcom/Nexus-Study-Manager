import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ChatMessage } from '../types';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

export default function ChatPage({ user }: { user: User }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I am your AI Study Helper. I can help solve homework, generate notes, or summarize PDFs. What do you want to learn today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          systemInstruction: "You are a friendly, highly intelligent AI Study Helper and Daily Life Manager. You help students understand concepts, plan their day, and stay motivated. Use markdown formatting when helpful."
        })
      });

      if (!response.body) throw new Error('No body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiContent = "";
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                aiContent += data.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = aiContent;
                  return newMsgs;
                });
              }
            } catch (e) {
              // Ignore partial JSON chunks usually
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "**Error:** I am having trouble connecting to the network right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pt-0 md:pt-4">
      <header className="mb-4 md:mb-8 shrink-0">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight md:leading-none mb-2 uppercase break-words">Smart <span className="text-primary">AI</span></h1>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Ask questions, generate flashcards, or simplify complex topics.</p>
      </header>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[24px] md:rounded-[40px] flex flex-col overflow-hidden relative min-h-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-[12px] bg-primary flex items-center justify-center flex-shrink-0 border border-primary mt-1">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
              )}
              <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-6 rounded-[20px] md:rounded-[24px] ${
                msg.role === 'user' 
                ? 'bg-black border border-zinc-800 text-white rounded-tr-none' 
                : 'bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap text-[13px] md:text-[15px] font-medium leading-relaxed break-words">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-[12px] bg-black flex items-center justify-center flex-shrink-0 border border-zinc-800 mt-1">
                  <UserIcon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3 md:gap-4 justify-start">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-[12px] bg-primary flex items-center justify-center flex-shrink-0 border border-primary mt-1">
                 <Bot className="w-5 h-5 md:w-6 md:h-6 text-black" />
               </div>
               <div className="p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-zinc-950 border border-zinc-800 rounded-tl-none flex items-center gap-3">
                 <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-primary animate-spin" />
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">Thinking...</span>
               </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 md:p-6 bg-black border-t border-zinc-800 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ASK ABOUT QUANTUM PHYSICS..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[16px] md:rounded-[20px] pl-4 md:pl-6 pr-14 py-4 md:py-5 text-xs md:text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-zinc-600 transition-all text-white"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="absolute right-2 md:right-3 p-2 md:p-3 bg-primary text-black rounded-[10px] md:rounded-xl hover:bg-white disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
