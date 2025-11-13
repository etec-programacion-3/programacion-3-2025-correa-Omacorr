import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Cookies from 'js-cookie';

// Tipos locales
interface Conversation {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  fecha_creacion: string;
  ultimo_mensaje?: string;
  mensajes_no_leidos: number;
  otro_usuario: string;
}

const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        
        const token = Cookies.get('access_token');
        console.log('Token en cookies:', token ? 'SÍ EXISTE' : 'NO EXISTE');
        console.log('Token completo:', token);

        const data = await api.conversations.getAll();
        console.log('Conversaciones recibidas:', data); // ← AGREGAR DEBUGGING
        setConversations(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Error completo:', err.response?.data || err); // ← AGREGAR DEBUGGING
        setError(err.message || 'Error al cargar conversaciones');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mensajes</h1>
          <p className="text-gray-600">Tus conversaciones con otros usuarios</p>
        </div>

        {error && (
          <div className="card mb-6" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
            <p style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#f9fafb' }}>
              <div style={{ 
                width: '4rem', 
                height: '4rem', 
                backgroundColor: '#dbeafe', 
                borderRadius: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem' 
              }}>
                <span style={{ fontSize: '2rem' }}>💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes conversaciones</h3>
              <p className="text-gray-600 mb-6">Contacta a un vendedor para comenzar una conversación</p>
              <Link to="/products" className="btn-primary">
                Ver Productos
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/conversations/${conversation.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card-hover" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <h3 className="font-semibold text-gray-900" style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {/* ← MEJORADO: Mostrar nombre real o fallback */}
                          💬 Conversación con {conversation.otro_usuario || `Usuario ${conversation.usuario1_id !== 1 ? conversation.usuario1_id : conversation.usuario2_id}`}
                        </h3>
                        <span className="text-sm text-gray-500" style={{ display: 'flex', alignItems: 'center' }}>
                          🕒 {new Date(conversation.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm" style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {conversation.ultimo_mensaje || 'Sin mensajes aún - ¡Inicia la conversación!'}
                      </p>
                      
                      {/* ← AGREGAR INFO EXTRA */}
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                        ID Conversación: {conversation.id} | Usuarios: {conversation.usuario1_id} ↔ {conversation.usuario2_id}
                      </p>
                    </div>
                    
                    {conversation.mensajes_no_leidos > 0 && (
                      <div style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '50%',
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {conversation.mensajes_no_leidos}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;