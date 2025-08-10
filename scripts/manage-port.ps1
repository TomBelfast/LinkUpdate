# Force PowerShell to use UTF-8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Messages
$Messages = @{
    Starting = "Start zarzadzania portem 9999..."
    PortBusy = "Port 9999 jest zajety (EADDRINUSE)"
    PortAvailable = "Port 9999 jest dostepny"
    CheckingProcesses = "Sprawdzam procesy na porcie 9999..."
    ProcessFound = "Znaleziono proces: PID={0}, Nazwa={1}, Sciezka={2}"
    ProcessStopped = "Proces zostal zatrzymany"
    ProcessStopError = "Nie udalo sie zatrzymac procesu: {0}"
    PortFreed = "Port zostal pomyslnie zwolniony"
    PortFreeError = "Nie udalo sie zwolnic portu"
    RetryAttempt = "Proba {0} z {1}..."
    MaxRetriesExceeded = "Przekroczono maksymalna liczbe prob"
    LogFile = "Port 9999 - {0}: {1}"
}

# Configuration
$Config = @{
    MaxRetries = 3
    RetryDelay = 2
    LogPath = "logs/port-manager.log"
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

function Test-Port {
    param([int]$Port = 9999)
    
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

function Get-ProcessOnPort {
    param([int]$Port = 9999)
    
    $netstat = netstat -ano | Select-String ":$Port\s"
    if ($netstat) {
        $pid = $netstat.Line.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)[-1]
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            return $process
        }
    }
    return $null
}

function Stop-ProcessOnPort {
    param([int]$Port = 9999)
    
    $process = Get-ProcessOnPort -Port $Port
    if ($process) {
        $processPath = $process.Path
        Write-Log ($Messages.ProcessFound -f $process.Id, $process.ProcessName, $processPath)
        
        try {
            Stop-Process -Id $process.Id -Force
            Write-Log $Messages.ProcessStopped
            return $true
        }
        catch {
            Write-Log ($Messages.ProcessStopError -f $_.Exception.Message) "ERROR"
            return $false
        }
    }
    return $true
}

function Manage-Port {
    param([int]$Port = 9999)
    
    Write-Log $Messages.Starting
    
    for ($i = 1; $i -le $Config.MaxRetries; $i++) {
        Write-Log ($Messages.RetryAttempt -f $i, $Config.MaxRetries)
        
        if (Test-Port -Port $Port) {
            Write-Log $Messages.PortAvailable "SUCCESS"
            return $true
        }
        
        Write-Log $Messages.PortBusy "WARNING"
        Write-Log $Messages.CheckingProcesses
        
        if (Stop-ProcessOnPort -Port $Port) {
            Start-Sleep -Seconds $Config.RetryDelay
            if (Test-Port -Port $Port) {
                Write-Log $Messages.PortFreed "SUCCESS"
                return $true
            }
        }
        
        if ($i -lt $Config.MaxRetries) {
            Start-Sleep -Seconds $Config.RetryDelay
        }
    }
    
    Write-Log $Messages.MaxRetriesExceeded "ERROR"
    Write-Log $Messages.PortFreeError "ERROR"
    return $false
}

# Main execution
$result = Manage-Port
if (-not $result) {
    exit 1
}
exit 0 