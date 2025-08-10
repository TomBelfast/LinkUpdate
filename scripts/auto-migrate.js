import { spawn } from 'child_process';
import { EOL } from 'os';

const migrate = spawn('npx', ['drizzle-kit', 'push:mysql'], {
  stdio: ['pipe', process.stdout, process.stderr]
});

// Automatycznie wybierz pierwszą opcję po zobaczeniu znaku zapytania
migrate.stdout.on('data', (data) => {
  if (data.toString().includes('?')) {
    migrate.stdin.write('0' + EOL);
  }
});

migrate.on('close', (code) => {
  console.log(`Proces migracji zakończony z kodem: ${code}`);
}); 