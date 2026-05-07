/**
 * email-defaults.ts — Registro de contenido por defecto de cada email.
 *
 * Se usa para:
 * 1. Fallback cuando no hay override en Supabase (email_templates)
 * 2. Mostrar los valores originales en la UI de edición
 * 3. Comparar con overrides para saber si algo ha sido personalizado
 */

export interface EmailTemplateDefaults {
  subject: string
  bodyContent: string
  ctaText: string
  isDynamic?: boolean
  dynamicNote?: string
}

export const EMAIL_DEFAULTS: Record<string, EmailTemplateDefaults> = {
  d0: {
    subject: 'Tu mapa de neuroregulación',
    bodyContent: '',
    ctaText: 'Ver mi mapa completo',
    isDynamic: true,
    dynamicNote:
      'El cuerpo de este email incluye scores y dimensiones calculados automáticamente. Solo el asunto y el texto del botón son editables.',
  },
  d1: {
    subject: 'Hay algo nuevo en tu mapa',
    bodyContent:
      'Tus miedos principales, tus tres capas de necesidad y tus patrones de burnout ya están disponibles. Es la pieza que completa tu mecanismo de defensa adaptativo.',
    ctaText: 'Ver mi mapa',
  },
  d3: {
    subject: 'Profundizamos en tu prioridad nº1',
    bodyContent:
      'Nuevo análisis en profundidad sobre tu dimensión más comprometida. Un nivel de detalle que no existía cuando hiciste tu evaluación.',
    ctaText: 'Ver mi mapa',
  },
  d6: {
    subject: 'Un capítulo escrito para tu situación',
    bodyContent:
      'Basado en tu dimensión más comprometida. Del libro "Burnout Ejecutivo: El Renacimiento del Líder Fénix."',
    ctaText: 'Ver mi mapa',
  },
  d10: {
    subject: 'Tu Evolución está lista',
    bodyContent:
      'Actualiza tu mapa en 30 segundos. Tus scores anteriores se guardan para que veas la evolución real.',
    ctaText: 'Actualizar mi mapa',
  },
  d30: {
    subject: 'Un mes desde tu análisis. ¿Ha cambiado algo?',
    bodyContent:
      'Actualiza tu mapa en 30 segundos. Tus scores anteriores se guardan para que veas la evolución.',
    ctaText: 'Actualizar mi mapa',
  },
  d90: {
    subject: '3 meses desde tu mapa. Una pregunta.',
    bodyContent: '¿Ha cambiado algo?\n\nTu mapa sigue aquí. Actualízalo en 30 segundos y compara.',
    ctaText: 'Actualizar mi mapa',
  },
  goodbye: {
    subject: 'Tu mapa sigue aquí',
    bodyContent:
      'Tu mapa de neuroregulación sigue evolucionando.\n\nNo necesitas abrir estos emails para que eso ocurra. Tu análisis trabaja por ti en segundo plano. Lo que revele estará ahí cuando lo necesites.\n\nVamos a dejar de enviarte actualizaciones para no añadir ruido a tu bandeja. Pero hay algo que no cambia:',
    ctaText: 'Seguir recibiendo actualizaciones',
    isDynamic: true,
    dynamicNote:
      'Este email tiene elementos estructurales fijos (cita destacada, firma, enlace de reactivación). Solo el texto narrativo principal, el asunto y el botón son editables.',
  },
  /* AMPLIFY hidden — reactivar cuando se necesite */
  // amplify_comparison_ready: {
  //   subject: 'Tu comparación de mapas está lista',
  //   bodyContent:
  //     'ha completado su diagnóstico.\n\nAhora podéis ver cómo se comparan vuestras dimensiones. Las brechas compartidas revelan lo que ningún mapa individual puede mostrar.',
  //   ctaText: 'Ver comparación',
  //   isDynamic: true,
  //   dynamicNote:
  //     'El cuerpo incluye las iniciales del invitado dinámicamente. Solo el asunto y el texto del botón son editables.',
  // },
  post_pago: {
    subject: 'Tu Semana 1 empieza ahora — aquí tienes todo',
    bodyContent: 'Has dado el paso que el 97% no da. Lo que sigue es que tu cuerpo note la diferencia.',
    ctaText: 'Agendar mi sesión',
    isDynamic: true,
    dynamicNote:
      'Este email tiene secciones estructurales fijas (protocolo, sesión, MNN©, garantía). Solo el párrafo de bienvenida, el asunto y el botón principal son editables.',
  },
}

/** Sanitiza texto para insertar en HTML (previene XSS) */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Convierte saltos de línea en texto plano a párrafos HTML */
export function textToHtmlParagraphs(text: string, style: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${style}">${escapeHtml(p)}</p>`)
    .join('\n')
}

/** Lista de keys válidos para validar en la API */
export const VALID_EMAIL_KEYS = Object.keys(EMAIL_DEFAULTS)
