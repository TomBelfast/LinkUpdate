# Force PowerShell to use UTF-8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Configuration
$config = @{
    Directories = @(
        @{
            Path = ".\.next"
            Required = "FullControl"
            Description = "Next.js build directory"
            CreateIfMissing = $true
        },
        @{
            Path = ".\.next\trace"
            Required = "FullControl"
            Description = "Next.js trace directory"
            CreateIfMissing = $true
        },
        @{
            Path = ".\node_modules"
            Required = "ReadAndExecute"
            Description = "Node.js modules directory"
            CreateIfMissing = $false
        }
    )
    BackupSuffix = ".bak"
    LogFile = ".\permission-fix.log"
}

# Helper Functions
function Write-Log {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    Write-Host $logMessage
    Add-Content -Path $config.LogFile -Value $logMessage -Encoding UTF8
}

function Backup-Acl {
    param([string]$Path)
    
    try {
        $acl = Get-Acl $Path
        $backupPath = "$Path$($config.BackupSuffix)"
        $acl | Export-Clixml -Path $backupPath -Encoding UTF8
        Write-Log "Utworzono backup ACL dla: $Path" "BACKUP"
        return $true
    }
    catch {
        Write-Log "Nie mozna utworzyc backupu ACL dla: $Path - $_" "ERROR"
        return $false
    }
}

function Test-AdminRights {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Set-DirectoryPermissions {
    param(
        [string]$Path,
        [string]$Required,
        [bool]$CreateIfMissing
    )
    
    try {
        # Create directory if it doesn't exist and is configured to be created
        if (-not (Test-Path $Path)) {
            if ($CreateIfMissing) {
                Write-Log "Tworzenie katalogu: $Path" "ACTION"
                New-Item -Path $Path -ItemType Directory -Force | Out-Null
            }
            else {
                Write-Log "Katalog nie istnieje i nie jest skonfigurowany do utworzenia: $Path" "WARN"
                return $false
            }
        }

        # Backup existing permissions
        Backup-Acl $Path

        # Set new permissions
        $acl = Get-Acl $Path
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        
        # Remove existing user permissions
        $acl.Access | Where-Object { $_.IdentityReference.Value -eq $currentUser } | ForEach-Object {
            $acl.RemoveAccessRule($_) | Out-Null
        }

        # Add new permission
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $currentUser,
            $Required,
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )
        
        $acl.AddAccessRule($rule)
        Set-Acl $Path $acl
        
        Write-Log "Ustawiono uprawnienia ($Required) dla: $Path" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Blad podczas ustawiania uprawnien dla $Path : $_" "ERROR"
        return $false
    }
}

# Main Execution
Write-Log "Start naprawy uprawnien" "START"

if (-not (Test-AdminRights)) {
    Write-Log "Ten skrypt wymaga uprawnien administratora" "ERROR"
    exit 1
}

$success = $true

foreach ($dir in $config.Directories) {
    Write-Log "Przetwarzanie katalogu: $($dir.Path) ($($dir.Description))" "INFO"
    
    if (-not (Set-DirectoryPermissions -Path $dir.Path -Required $dir.Required -CreateIfMissing $dir.CreateIfMissing)) {
        $success = $false
        Write-Log "Nie udalo sie naprawic uprawnien dla: $($dir.Path)" "ERROR"
    }
}

# Verify Node.js process
$nodeProcess = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Log "Znaleziono proces Node.js (PID: $($nodeProcess.Id))" "INFO"
}
else {
    Write-Log "Nie znaleziono procesu Node.js" "WARN"
}

if ($success) {
    Write-Log "Naprawa uprawnien zakonczona sukcesem" "SUCCESS"
    exit 0
}
else {
    Write-Log "Naprawa uprawnien zakonczona z bledami" "ERROR"
    exit 1
} 