# PENDIENTES — Estado del proyecto L.A.R.S.

**Última actualización:** 22 marzo 2026
**Estado:** Gateway + Mapa vivo + Evoluciones + Stripe (test) + Página de éxito + Sistema de reservas implementados

---

## PARA JAVIER (antes de la próxima sesión)

### 1. Activar emails (URGENTE)
Los emails no se envían porque falta verificar el dominio en Resend.
- Ve a **resend.com** → verifica el dominio `institutoepigenetico.com`
- La API key ya está configurada en `.env.local`
- En **Vercel** → Settings → Environment Variables → añade `RESEND_API_KEY`

### 2. Configurar Google Calendar (NUEVO)
El sistema de reservas está implementado pero necesita las credenciales de Google:
1. Ir a **Google Cloud Console** → crear proyecto → habilitar **Calendar API**
2. Crear una **cuenta de servicio** → descargar el JSON
3. En tu **Google Calendar** → Configuración del calendario → Compartir con el email de la cuenta de servicio (dar permisos de "Hacer cambios en eventos")
4. En **Vercel** → Environment Variables → añadir:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` → pegar todo el JSON de la cuenta de servicio
   - `GOOGLE_CALENDAR_ID` → tu email de Google Calendar
5. Ir a `/admin/disponibilidad` → configurar tu horario semanal

### 3. Stripe: pasar a LIVE (cuando estés listo para cobrar)
Ahora está en modo TEST (no cobra dinero real).
Para activar pagos reales:
- En **Stripe Dashboard** → desactiva "Test mode"
- Copia las claves LIVE (empiezan por `sk_live_` y `pk_live_`)
- En **Vercel** → Environment Variables → actualiza:
  - `STRIPE_SECRET_KEY` → la nueva `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID` → crear el producto de 97€ en modo LIVE y copiar el `price_...`
- Crea un nuevo webhook en modo LIVE:
  - URL: `https://lars.institutoepigenetico.com/api/stripe/webhook`
  - Evento: `checkout.session.completed`
  - Copia el nuevo `whsec_...` y actualiza `STRIPE_WEBHOOK_SECRET` en Vercel

### 4. Meta Business / WhatsApp (futuro)
Para las notificaciones por WhatsApp necesito:
- Acceso a la **Meta Business Suite** del Instituto Epigenético
- El **número de teléfono dedicado** (que NO esté ya en WhatsApp personal)
- Verificar el negocio en Meta si no está verificado

---

## PARA LA PRÓXIMA SESIÓN DE CLAUDE CODE

### Prioridad 1: WhatsApp (Meta Cloud API)
- Integrar Meta Cloud API (free tier: 1.000 conversaciones/mes)
- Opt-in después del arquetipo en el mapa
- Plantillas de mensajes para aprobación de Meta

### Prioridad 2: Pulido visual
- Revisar animaciones contra `docs/ANIMATIONS.md`
- Mejorar jerarquía visual de las secciones de evolución

### Prioridad 3: Stripe LIVE
- Cambiar a modo producción cuando Javier esté listo
- Probar flujo completo: gateway → mapa → pago → éxito → email

---

## ARQUITECTURA ACTUAL (referencia rápida)

```
/                          → Landing + Gateway (10 preguntas)
/mapa/[hash]               → Mapa vivo personal (evoluciona día 3-90)
/pago/exito                → Página de éxito post-pago
/admin/fast-forward        → Herramienta de testing (simular paso del tiempo)
/admin/disponibilidad      → Panel admin de disponibilidad (NEW)

/api/diagnostico           → POST: crea diagnóstico + scores + email día 0
/api/checkout              → POST: Stripe Checkout Session
/api/stripe/webhook        → POST: confirma pago + email post-pago
/api/mapa/[hash]/visita    → PATCH: registra visita + marca viewed
/api/mapa/[hash]/subdimensions → POST: guarda subdimensiones
/api/mapa/[hash]/reevaluacion  → POST: reevaluación 30/90 días
/api/booking/slots         → GET: slots disponibles (NEW)
/api/booking/create        → POST: crear reserva + GCal + emails (NEW)
/api/booking/cancel        → POST: cancelar reserva (NEW)
/api/admin/disponibilidad  → GET/POST/DELETE: CRUD disponibilidad (NEW)
/api/admin/fast-forward    → POST: simula paso del tiempo (dev)
/api/cron/evoluciones      → GET: cron diario emails evolución
/api/cron/booking-reminders → GET: cron horario recordatorios (NEW)
```

**Variables de entorno necesarias en Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL` → `https://lars.institutoepigenetico.com`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `RESEND_API_KEY`
- `CRON_SECRET` ← generar uno aleatorio para proteger los crons
- `ADMIN_SECRET` ← contraseña para el panel admin
- `GOOGLE_SERVICE_ACCOUNT_KEY` ← JSON de la cuenta de servicio (NEW)
- `GOOGLE_CALENDAR_ID` ← email del calendario de Javier (NEW)

**Tablas en Supabase:**
- `diagnosticos` — datos de diagnóstico y funnel
- `bookings` — reservas de sesiones (NEW)
- `availability_config` — configuración de disponibilidad (NEW)
