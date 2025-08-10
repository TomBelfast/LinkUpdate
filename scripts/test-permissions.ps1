# Force PowerShell to use UTF-8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Test directories
$directories = @(
    @{
        Path = ".\.next"
        Required = "FullControl"
        Description = "Next.js build directory"
    },
    @{
        Path = ".\.next\trace"
        Required = "FullControl"
        Description = "Next.js trace directory"
    },
    @{
        Path = ".\node_modules"
        Required = "ReadAndExecute"
        Description = "Node.js modules directory"
    }
)

# Get current user
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Host "Testowanie uprawnien dla uzytkownika: $currentUser"

foreach ($dir in $directories) {
    Write-Host "`nSprawdzanie katalogu: $($dir.Path) ($($dir.Description))"
    
    # Check if directory exists
    if (-not (Test-Path $dir.Path)) {
        Write-Host "- BLAD: Katalog nie istnieje"
        continue
    }
    
    try {
        $acl = Get-Acl $dir.Path
        Write-Host "- Wlasciciel: $($acl.Owner)"
        
        # Check user permissions
        $userRights = $acl.Access | Where-Object { $_.IdentityReference.Value -eq $currentUser }
        if ($userRights) {
            Write-Host "- Uprawnienia uzytkownika: $($userRights.FileSystemRights)"
            
            # Check if required permissions are present
            $hasRequired = $userRights.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::($dir.Required)
            if ($hasRequired) {
                Write-Host "- OK: Uzytkownik ma wymagane uprawnienia ($($dir.Required))" -ForegroundColor Green
            } else {
                Write-Host "- BLAD: Brak wymaganych uprawnien ($($dir.Required))" -ForegroundColor Red
            }
        } else {
            Write-Host "- BLAD: Uzytkownik nie ma zadnych uprawnien" -ForegroundColor Red
        }
        
        # Test write access
        if ($dir.Required -eq "FullControl") {
            $testFile = Join-Path $dir.Path "test.tmp"
            try {
                [System.IO.File]::WriteAllText($testFile, "test")
                Write-Host "- OK: Mozliwy zapis do katalogu" -ForegroundColor Green
                Remove-Item $testFile -ErrorAction SilentlyContinue
            } catch {
                Write-Host "- BLAD: Brak mozliwosci zapisu do katalogu" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "- BLAD: Nie mozna sprawdzic uprawnien: $_" -ForegroundColor Red
    }
}

# Test Node.js process access
Write-Host "`nSprawdzanie procesu Node.js:"
$nodeProcess = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "- Znaleziono proces Node.js (PID: $($nodeProcess.Id))"
    Write-Host "- Sciezka: $($nodeProcess.Path)"
} else {
    Write-Host "- UWAGA: Nie znaleziono procesu Node.js" -ForegroundColor Yellow
}

# Summary
Write-Host "`nPodsumowanie testow:"
Write-Host "- Uzytkownik: $currentUser"
Write-Host "- Sprawdzone katalogi: $($directories.Count)"
Write-Host "- Proces Node.js: $(if ($nodeProcess) { 'Aktywny' } else { 'Nieaktywny' })" 