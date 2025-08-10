import subprocess
import sys
import time

process = subprocess.Popen(['npx', 'drizzle-kit', 'push:mysql'],
                         stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE,
                         text=True)

# Czekaj na pojawienie się znaku zapytania
time.sleep(2)  # Daj czas na uruchomienie
process.stdin.write('0\n')
process.stdin.flush()

# Wyświetl output
for line in process.stdout:
    print(line, end='')

process.wait()
sys.exit(process.returncode) 