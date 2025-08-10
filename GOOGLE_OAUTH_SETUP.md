# Konfiguracja Google OAuth

Aby włączyć logowanie przez Google, wykonaj następujące kroki:

## 1. Utwórz projekt w Google Cloud Console

1. Idź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google+ API (lub Google Identity API)

## 2. Skonfiguruj OAuth 2.0

1. Idź do **APIs & Services** → **Credentials**
2. Kliknij **Create Credentials** → **OAuth 2.0 Client IDs**
3. Wybierz **Web application**
4. Dodaj **Authorized redirect URIs**:
   - `http://localhost:9999/api/auth/callback/google`
   - `http://172.24.108.30:9999/api/auth/callback/google`
   - `http://0.0.0.0:9999/api/auth/callback/google`

## 3. Skopiuj dane do .env.local

Po utworzeniu OAuth client, skopiuj:
- **Client ID** → `GOOGLE_ID`
- **Client Secret** → `GOOGLE_SECRET`

```bash
# W pliku .env.local
GOOGLE_ID=twoj-prawdziwy-google-client-id
GOOGLE_SECRET=twoj-prawdziwy-google-client-secret
```

## 4. Restart serwera

Po dodaniu danych, zrestartuj serwer Next.js:

```bash
npm run dev
```

## Tymczasowe rozwiązanie

Jeśli nie chcesz teraz konfigurować Google OAuth, możesz tymczasowo wyłączyć przycisk Google w `app/auth/signin/page.tsx` zakomentowując sekcję z przyciskiem Google.