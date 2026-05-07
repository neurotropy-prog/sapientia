'use client'

/**
 * MessageThread.tsx — Vista de hilo de mensajes
 *
 * Muestra todos los mensajes (de Javier + respuestas del usuario) en orden
 * cronológico. Incluye botón "Contestar" con opciones: Comentario, Vídeo, Email.
 */

import { useState, useRef, useEffect } from 'react'

interface Message {
  type: string
  content: string
  created_at: string
  from_user?: boolean
  notify_lead?: boolean
  dismissed?: boolean
  saved?: boolean
}

interface MessageThreadProps {
  messages: Message[]
  mapHash: string
  onClose: () => void
  onMessageSent: (reply: Message) => void
  onDeleteMessage?: (index: number) => void
  onEditMessage?: (index: number, newContent: string) => void
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hace 1 día'
  if (days < 30) return `hace ${days} días`
  const months = Math.floor(days / 30)
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
}

function MessageBubble({ msg, onDelete, onEdit }: { msg: Message; onDelete?: () => void; onEdit?: (newContent: string) => void }) {
  const isUser = msg.from_user
  const isVideo = msg.type === 'video'
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(msg.content)
  const canEdit = onEdit && !isVideo

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 'var(--space-4)',
      }}
    >
      {/* Sender label + actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-1)',
      }}>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isUser ? 'var(--color-text-tertiary)' : '#CD796C',
            margin: 0,
          }}
        >
          {isUser ? 'Tú' : 'Javier A. Martín Ramos'}
        </p>
        {canEdit && !editing && (
          <button
            onClick={() => { setEditText(msg.content); setEditing(true) }}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Editar
          </button>
        )}
        {onDelete && !editing && (
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-error, #C44040)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '85%',
          padding: 'var(--space-4)',
          borderRadius: isUser
            ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
            : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
          background: isUser ? 'rgba(205, 121, 108, 0.08)' : 'var(--color-bg-secondary)',
          border: isUser
            ? '1px solid rgba(205, 121, 108, 0.15)'
            : '1px solid var(--color-surface-subtle)',
        }}
      >
        {editing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 60,
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-surface-subtle)',
                background: 'var(--color-bg-primary)',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--lh-body)',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button
                onClick={() => {
                  if (editText.trim() && editText.trim() !== msg.content) {
                    onEdit!(editText.trim())
                  }
                  setEditing(false)
                }}
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: '#CD796C',
                  color: '#fff',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-surface-subtle)',
                  background: 'none',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : isVideo ? (
          <video
            src={`${msg.content}#t=0.5`}
            controls
            preload="metadata"
            playsInline
            style={{
              width: '100%',
              borderRadius: 'var(--radius-md)',
              display: 'block',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              background: '#212426',
            }}
          />
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--color-text-primary)',
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {msg.content}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          marginTop: '4px',
        }}
      >
        {relativeTime(msg.created_at)}
      </p>
    </div>
  )
}

type ReplyMode = null | 'comment' | 'video' | 'email'

export default function MessageThread({
  messages,
  mapHash,
  onClose,
  onMessageSent,
  onDeleteMessage,
  onEditMessage,
}: MessageThreadProps) {
  const [replyMode, setReplyMode] = useState<ReplyMode>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on mount and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  // Focus textarea when reply mode opens
  useEffect(() => {
    if (replyMode && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyMode])

  const visibleMessages = messages
    .map((m, i) => ({ ...m, _origIndex: i }))
    .filter((m) => m.type !== 'early_unlock' && m.type !== 'express_session' && !m.dismissed)

  async function handleSend() {
    if (replyMode === 'video') {
      await handleVideoUpload()
      return
    }
    if (!replyText.trim() || !replyMode) return
    setSending(true)
    setError('')

    try {
      const res = await fetch(`/api/mapa/${mapHash}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: replyMode, content: replyText.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al enviar')
      }

      const data = await res.json()
      onMessageSent(data.reply)
      setReplyText('')
      setReplyMode(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setSending(false)
    }
  }

  async function handleVideoUpload() {
    if (!videoFile) return
    setSending(true)
    setError('')
    setUploadProgress('Subiendo vídeo...')

    try {
      const formData = new FormData()
      formData.append('file', videoFile)

      const res = await fetch(`/api/mapa/${mapHash}/upload-video`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al subir vídeo')
      }

      const data = await res.json()
      onMessageSent(data.reply)
      setVideoFile(null)
      setReplyMode(null)
      setUploadProgress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir vídeo')
      setUploadProgress('')
    } finally {
      setSending(false)
    }
  }

  const replyLabels: Record<string, string> = {
    comment: 'Comentario',
    video: 'Subir vídeo',
    email: 'Mensaje',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-surface-subtle)',
          background: 'var(--color-bg-primary)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          ← Volver
        </button>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Mensajes ({visibleMessages.length})
        </p>
        <div style={{ width: 60 }} /> {/* Spacer for centering */}
      </div>

      {/* ── Messages scroll area ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-5)',
        }}
      >
        {visibleMessages.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-tertiary)',
              textAlign: 'center',
              marginTop: 'var(--space-10)',
            }}
          >
            No hay mensajes todavía.
          </p>
        ) : (
          visibleMessages.map((msg, i) => (
            <MessageBubble
              key={`${msg.created_at}-${i}`}
              msg={msg}
              onDelete={onDeleteMessage ? () => onDeleteMessage(msg._origIndex) : undefined}
              onEdit={onEditMessage ? (newContent: string) => onEditMessage(msg._origIndex, newContent) : undefined}
            />
          ))
        )}
      </div>

      {/* ── Reply area ── */}
      <div
        style={{
          borderTop: '1px solid var(--color-surface-subtle)',
          padding: 'var(--space-4) var(--space-5)',
          background: 'var(--color-bg-primary)',
          flexShrink: 0,
        }}
      >
        {replyMode === null ? (
          /* ── Reply options ── */
          <div>
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Responder con:
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(['comment', 'video', 'email'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setReplyMode(mode)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-surface-subtle)',
                    background: 'var(--color-bg-secondary)',
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    fontWeight: 600,
                    color: '#CD796C',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {mode === 'comment' ? '💬 Comentario' : mode === 'video' ? '🎥 Vídeo' : '✉️ Email'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Compose area ── */
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  color: '#CD796C',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {replyLabels[replyMode]}
              </p>
              <button
                onClick={() => { setReplyMode(null); setReplyText(''); setVideoFile(null); setError(''); setUploadProgress('') }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>

            {replyMode === 'video' ? (
              /* ── Video upload UI ── */
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setVideoFile(f)
                      setError('')
                    }
                  }}
                />

                {!videoFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      minHeight: 100,
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '2px dashed var(--color-surface-subtle)',
                      background: 'var(--color-bg-secondary)',
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🎥</span>
                    <span>Pulsa para seleccionar un vídeo</span>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)' }}>
                      MP4, MOV o WebM · Máx. 50 MB
                    </span>
                  </button>
                ) : (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-surface-subtle)',
                      background: 'var(--color-bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>🎥</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {videoFile.name}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-caption)',
                        color: 'var(--color-text-tertiary)',
                        margin: 0,
                        marginTop: '2px',
                      }}>
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => { setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        color: 'var(--color-text-tertiary)',
                        padding: '4px',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {uploadProgress && (
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: '#CD796C',
                    marginTop: 'var(--space-2)',
                    textAlign: 'center',
                  }}>
                    {uploadProgress}
                  </p>
                )}
              </div>
            ) : (
              /* ── Text compose (comment / email) ── */
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  replyMode === 'comment'
                    ? 'Escribe tu comentario...'
                    : 'Escribe tu mensaje...'
                }
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-surface-subtle)',
                  background: 'var(--color-bg-secondary)',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--lh-body)',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-error)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={replyMode === 'video' ? (!videoFile || sending) : (!replyText.trim() || sending)}
              style={{
                marginTop: 'var(--space-3)',
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: '9999px',
                border: 'none',
                background: (replyMode === 'video' ? videoFile : replyText.trim()) && !sending ? '#CD796C' : 'rgba(205,121,108,0.3)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: (replyMode === 'video' ? videoFile : replyText.trim()) && !sending ? 'pointer' : 'default',
                transition: 'all 150ms ease',
              }}
            >
              {sending ? (replyMode === 'video' ? 'Subiendo...' : 'Enviando...') : (replyMode === 'video' ? 'Subir vídeo' : 'Enviar')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
