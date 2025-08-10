# Force PowerShell to use UTF-8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Messages
$Messages = @{
    Starting = "Start zarzadzania uprawnieniami dla katalogu .next..."
    DirectoryNotFound = "Katalog .next nie istnieje"
    DirectoryCreated = "Utworzono katalog .next"
    PermissionsSet = "Ustawiono uprawnienia dla {0}"
    PermissionsError = "Blad podczas ustawiania uprawnien dla {0}: {1}"
    Success = "Pomyslnie zaktualizowano uprawnienia"
    LogFile = "Uprawnienia - {0}: {1}"
}

# Configuration
$Config = @{
    LogPath = "logs/permissions-manager.log"
    Directories = @(
        ".next",
        ".next\cache",
        ".next\server",
        ".next\static",
        ".next\trace",
        ".next\types"
    )
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = $Messages.LogFile -f $Type, $Message
    $logEntry = "$timestamp - $logMessage"
    
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    Add-Content -Path $Config.LogPath -Value $logEntry
    Write-Host $logMessage
}

function Set-NextPermissions {
    Write-Log $Messages.Starting
    
    # Sprawdź czy katalog .next istnieje
    if (-not (Test-Path ".next")) {
        Write-Log $Messages.DirectoryNotFound "WARNING"
        New-Item -ItemType Directory -Path ".next" | Out-Null
        Write-Log $Messages.DirectoryCreated "INFO"
    }
    
    # Utwórz wszystkie wymagane podkatalogi
    foreach ($dir in $Config.Directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        try {
            # Resetuj uprawnienia
            icacls $dir /reset
            
            # Ustaw nowe uprawnienia
            icacls $dir /inheritance:r
            icacls $dir /grant:r "SYSTEM:(OI)(CI)(F)"
            icacls $dir /grant:r "Administratorzy:(OI)(CI)(F)"
            icacls $dir /grant:r "Użytkownicy uwierzytelnieni:(OI)(CI)(M)"
            
            Write-Log ($Messages.PermissionsSet -f $dir) "SUCCESS"
        }
        catch {
            Write-Log ($Messages.PermissionsError -f $dir, $_.Exception.Message) "ERROR"
        }
    }
    
    Write-Log $Messages.Success "SUCCESS"
}

# Main execution
Set-NextPermissions 