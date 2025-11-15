import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
}

interface Conversation {
  user_id: number;
  user_name: string;
  last_message: string;
  unread_count: number;
  last_message_time: string;
}

const Messaging: React.FC = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Mock data for demonstration
      const mockConversations: Conversation[] = [
        {
          user_id: 1,
          user_name: 'Admin User',
          last_message: 'How can I help you today?',
          unread_count: 2,
          last_message_time: new Date().toISOString(),
        },
        {
          user_id: 2,
          user_name: 'Staff Member',
          last_message: 'Your order has been processed',
          unread_count: 0,
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setConversations(mockConversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      // Mock data for demonstration
      const mockMessages: Message[] = [
        {
          id: 1,
          sender_id: userId,
          receiver_id: user?.id || 0,
          message: 'Hello! How are you?',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          sender_name: 'Admin User',
        },
        {
          id: 2,
          sender_id: user?.id || 0,
          receiver_id: userId,
          message: 'I\'m good, thanks! I need help with my order.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: 3,
          sender_id: userId,
          receiver_id: user?.id || 0,
          message: 'Sure, I can help with that. What\'s your order number?',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          read: false,
          sender_name: 'Admin User',
        },
      ];
      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);

    try {
      // API call would go here
      const newMsg: Message = {
        id: Date.now(),
        sender_id: user?.id || 0,
        receiver_id: selectedConversation,
        message: newMessage,
        created_at: new Date().toISOString(),
        read: false,
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedConv = conversations.find(c => c.user_id === selectedConversation);

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>💬 Messaging</h1>
          <p className="subtitle">Instant messaging with staff and clients</p>
        </div>

        <div className="messaging-container">
          <div className="conversations-list">
            <h3>Conversations</h3>
            {conversations.length === 0 ? (
              <p className="empty-conversations">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user_id}
                  className={`conversation-item ${selectedConversation === conv.user_id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv.user_id)}
                >
                  <div className="conversation-avatar">
                    {conv.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <strong>{conv.user_name}</strong>
                      {conv.unread_count > 0 && (
                        <span className="unread-badge">{conv.unread_count}</span>
                      )}
                    </div>
                    <p className="last-message">{conv.last_message}</p>
                    <span className="message-time">
                      {new Date(conv.last_message_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="conversation-avatar">
                    {selectedConv?.user_name.charAt(0).toUpperCase()}
                  </div>
                  <h3>{selectedConv?.user_name}</h3>
                </div>

                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-item ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {msg.sender_id !== user?.id && msg.sender_name && (
                          <span className="message-sender">{msg.sender_name}</span>
                        )}
                        <p>{msg.message}</p>
                        <span className="message-timestamp">
                          {new Date(msg.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="message-input-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={loading}
                  />
                  <button type="submit" className="btn-primary" disabled={loading || !newMessage.trim()}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messaging;
