import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Tipos locales
interface Message {
  id: number;
  contenido: string;
  created_at: string;
  leido: boolean;
  remitente_id: number;
  conversacion_id: number;
  remitente_username: string;
}

const ConversationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
  const loadMessages = async () => {
    if (!id) return;
    
    try {
      const data = await api.conversations.getMessages(parseInt(id));
      console.log('Datos de mensajes recibidos:', data);
      setMessages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar mensajes:', err);
      setError(err.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes inicialmente
  setLoading(true);
  loadMessages();

  // POLLING CADA 5 SEGUNDOS
  const pollInterval = setInterval(() => {
    loadMessages();
  }, 5000);

  // Cleanup cuando se desmonte el componente
  return () => {
    clearInterval(pollInterval);
  };
}, [id]); // Solo depende de 'id', no de 'user'

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || sending) return;

    console.log('Intentando enviar mensaje:', newMessage.trim(), 'a conversación:', id);

    try {
      setSending(true);
      setNewMessage('');
      
      // Enviar al backend
      await api.conversations.sendMessage(parseInt(id), newMessage.trim());
      
      // Recargar mensajes
      const data = await api.conversations.getMessages(parseInt(id));
      setMessages(Array.isArray(data) ? data : []);
      
    } catch (err: any) {
      setError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div className="card mb-6" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/conversations" style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ← Volver a conversaciones
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Conversación</h1>
          </div>
        </div>

        {error && (
          <div className="card mb-6" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
            <p style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="card mb-6" style={{ minHeight: '400px', maxHeight: '500px', overflow: 'auto' }}>
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No hay mensajes en esta conversación</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((message) => {
                const isMyMessage = user && message.remitente_id === user.id;
                
                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMyMessage ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      backgroundColor: isMyMessage ? '#2563eb' : '#f3f4f6',
                      color: isMyMessage ? 'white' : '#111827'
                    }}>
                      <p style={{ margin: 0 }}>{message.contenido}</p>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        marginTop: '0.25rem',
                        opacity: 0.7,
                        textAlign: 'right'
                      }}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Send Message Form */}
        <form onSubmit={handleSendMessage} className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              disabled={sending}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={sending || !newMessage.trim()}
              style={{
                opacity: sending || !newMessage.trim() ? 0.5 : 1,
                cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationDetailPage;