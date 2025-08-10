#!/usr/bin/env bash
set -euo pipefail

cd /root/link

# Ensure test user has bcrypt password compatible with NextAuth
node -e 'const mysql=require("mysql2/promise"); const bcrypt=require("bcrypt"); (async()=>{try{const conn=await mysql.createConnection({host:"192.168.0.250",user:"testToDo",password:"testToDo",database:"ToDo_Test",port:3306}); const hash=await bcrypt.hash("Swiat1976@#$",12); await conn.execute("UPDATE users SET password=? WHERE email=?", [hash, "tomaszpasiekauk@gmail.com"]); console.log("✅ Updated test user password to bcrypt"); await conn.end();}catch(e){console.error("❌ Failed to update password:",e.message); process.exit(1)}})()'

# Start Next.js dev server
chmod +x node_modules/next/dist/bin/next || true
node node_modules/next/dist/bin/next dev -p 8888 -H 0.0.0.0 > dev-server.log 2>&1 &
SVPID=$!
echo "Started Next.js PID=$SVPID"

# Wait for readiness
for i in {1..90}; do
  if curl -sS http://localhost:8888/api/auth/providers >/dev/null; then
    echo "Dev server ready"
    break
  fi
  sleep 1
done

# Cookie jar
CK="$(mktemp)"

# Get CSRF token
CSRF=$(curl -sS -c "$CK" -b "$CK" http://localhost:8888/api/auth/csrf | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).csrfToken||"")}catch(e){}})')
echo "CSRF:$CSRF"

# Sign in with credentials
LOGIN_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -c "$CK" -b "$CK" -X POST -H "Content-Type: application/x-www-form-urlencoded" --data "csrfToken=$CSRF&email=tomaszpasiekauk@gmail.com&password=Swiat1976@#$&json=true&redirect=false" http://localhost:8888/api/auth/callback/credentials)
echo "LOGIN_STATUS:$LOGIN_CODE"

# Create link
CREATE_JSON=$(curl -sS -c "$CK" -b "$CK" -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com","title":"E2E Test Link","description":"created via e2e"}' http://localhost:8888/api/links)
echo "CREATE:$CREATE_JSON"
LINK_ID=$(printf "%s" "$CREATE_JSON" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);process.stdout.write(String(o.id||o.data?.id||""))}catch(e){}})')
echo "ID:$LINK_ID"

# Update link
UPDATE_JSON=$(curl -sS -c "$CK" -b "$CK" -X PUT -H "Content-Type: application/json" -d '{"title":"E2E Updated Title"}' http://localhost:8888/api/links/$LINK_ID)
echo "UPDATE:$UPDATE_JSON"

# Delete link
DELETE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -c "$CK" -b "$CK" -X DELETE http://localhost:8888/api/links/$LINK_ID)
echo "DELETE_STATUS:$DELETE_CODE"

# Cleanup
kill $SVPID || true
rm -f "$CK"

exit 0


