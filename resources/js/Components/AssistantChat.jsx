import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

export default function AssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'assistant', text: 'Hola, soy AVA 👋 ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const tokenMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = tokenMeta ? tokenMeta.getAttribute('content') : '';

            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            const reply = data.reply || 'Entendido.';
            setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: 'assistant', text: 'Lo siento, ocurrió un error al procesar tu consulta.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 md:w-96 flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-extrabold text-sm">Asistente AVAChat</h3>
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                </div>
                                <p className="text-[10px] text-blue-100 font-medium">Activo · Respuestas instantáneas</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none font-medium'
                                            : 'bg-gray-100 text-slate-800 rounded-bl-none border border-gray-200 font-medium'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-slate-500 p-3 rounded-2xl rounded-bl-none border border-gray-200 text-xs italic flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                                    <span>AVA está escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu consulta a AVA..."
                            className="flex-1 rounded-xl border-gray-200 text-xs focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-sm flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Circular Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
                title="Abrir Asistente AVA"
            >
                <MessageCircle className="w-6 h-6 transition-transform group-hover:rotate-12" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </button>
        </div>
    );
}
