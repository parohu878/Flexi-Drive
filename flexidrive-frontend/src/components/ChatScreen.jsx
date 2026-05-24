import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import './ChatScreen.css';

// Helper to load chats from localStorage (no demo pre‑population)
const loadChats = () => {
  try {
    const existing = localStorage.getItem('fd_chats');
    if (existing) return JSON.parse(existing);
    return []; // start empty
  } catch {
    return [];
  }
};

const saveChats = (chats) => {
  localStorage.setItem('fd_chats', JSON.stringify(chats));
};

export default function ChatScreen({ navigate }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesContainerRef = useRef(null);

  // Load chats on mount
  useEffect(() => {
    const stored = loadChats();
    setChats(stored);
    const requestedChatId = localStorage.getItem('fd_active_chat_id');
    if (requestedChatId && stored.find(c => c.id === requestedChatId)) {
      setActiveChatId(requestedChatId);
      localStorage.removeItem('fd_active_chat_id');
    } else if (stored.length) {
      setActiveChatId(stored[0].id);
    }
  }, []);

  // Scroll to bottom of the chat container ONLY (avoids window page jumps)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeChatId, chats]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || !activeChat) return;

    // Add user message to active chat
    const updated = chats.map(c => {
      if (c.id !== activeChatId) return c;
      const updatedMessages = [...c.messages, { sender: 'me', text, ts: Date.now() }];
      return { ...c, messages: updatedMessages };
    });
    setChats(updated);
    saveChats(updated);
    setNewMessage('');

    // Contextual and intelligent automated responses from the seller
    setTimeout(() => {
      let replyText = '';
      const t = text.toLowerCase();

      if (t.includes('preu') || t.includes('quant') || t.includes('val') || t.includes('cost')) {
        replyText = "El preu de lloguer és exactament el indicat a la fitxa de reserva, incloent l'assegurança a tot risc i taxes de servei. Sense sorpreses! 🚗";
      } else if (t.includes('disponible') || t.includes('llogar') || t.includes('dia') || t.includes('dates') || t.includes('quan')) {
        replyText = "Sí, les dates indicades al calendari estan completament lliures per a tu! Pots prémer el botó 'Reservar ara' per assegurar el vehicle. 😉";
      } else if (t.includes('hola') || t.includes('bon dia') || t.includes('bona tarda') || t.includes('salut')) {
        replyText = `Hola! Molt de gust. Com et puc ajudar avui respecte al lloguer del vehicle? 😊`;
      } else if (t.includes('gràcies') || t.includes('merci') || t.includes('perfecte') || t.includes('ok') || t.includes('d\'acord')) {
        replyText = "De res! Si vols concretar algun detall de la recollida o la devolució, només m'has de dir. Que tinguis un gran dia! 👍";
      } else if (t.includes('elèctric') || t.includes('bateria') || t.includes('tesla') || t.includes('carregador')) {
        replyText = "El cotxe es lliura totalment carregat, té molt bona autonomia i t'explicaré com funciona la càrrega en dos minuts. És súper fàcil! ⚡";
      } else if (t.includes('on') || t.includes('lloc') || t.includes('barcelona') || t.includes('recollida') || t.includes('adreça')) {
        replyText = "El vehicle es troba a la zona de Barcelona descrita a la seva fitxa. Podem trobar-nos allà mateix per fer el lliurament de claus. 📍";
      } else {
        replyText = "Entès! Ho consulto de seguida i et responc amb el que necessitis. Si tens més dubtes, escriu-me! o pots reservar directament. 🙌";
      }

      const reply = { sender: 'them', text: replyText, ts: Date.now() };
      setChats(prevChats => {
        const withReply = prevChats.map(c => {
          if (c.id !== activeChatId) return c;
          return { ...c, messages: [...c.messages, reply] };
        });
        saveChats(withReply);
        return withReply;
      });
    }, 1000);
  };

  const createNewChat = () => {
    const name = prompt('Nom de la conversa:');
    if (!name) return;
    const newChat = { id: 'chat_' + Date.now().toString(), name, messages: [] };
    const updated = [...chats, newChat];
    setChats(updated);
    saveChats(updated);
    setActiveChatId(newChat.id);
  };

  return (
    <div className="chat-screen fade-in">
      <div className="chat-sider">
        <div className="chat-header">
          <h3>Converses</h3>
          <button className="btn-ghost-sm" onClick={createNewChat}>+ Nou</button>
        </div>
        <ul className="chat-list">
          {chats.map(c => (
            <li key={c.id} className={c.id === activeChatId ? 'active' : ''} onClick={() => setActiveChatId(c.id)}>
              <Icon name="message" size={14} /> {c.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-messages" ref={messagesContainerRef}>
              {activeChat.messages.map((m, i) => (
                <div key={i} className={`msg ${m.sender}`}>
                  <span className="msg-text">{m.text}</span>
                  <span className="msg-ts">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-wrap">
              <input
                type="text"
                placeholder="Escriu un missatge…"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="btn-primary" onClick={handleSend}>Enviar</button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <p>Selecciona o crea una conversa per començar a xatejar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
