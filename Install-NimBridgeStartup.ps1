$ErrorActionPreference = 'Stop'

$taskName = 'NVIDIA NIM Bridge - Continue'
$taskPath = '\'
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$launcherPath = Join-Path $PSScriptRoot 'Start-NvidiaNimBridge.ps1'
$powershellPath = (Get-Command powershell.exe -ErrorAction Stop).Source
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Minimized -File "{0}"' -f $launcherPath

if (-not (Test-Path -LiteralPath $launcherPath)) {
    throw "Bridge launcher not found: $launcherPath"
}

if (-not (Test-Path -LiteralPath $powershellPath)) {
    throw "Windows PowerShell executable not found: $powershellPath"
}

$existingTask = Get-ScheduledTask -TaskName $taskName -TaskPath $taskPath -ErrorAction SilentlyContinue
if ($existingTask) {
    $actionMatches = @($existingTask.Actions | Where-Object {
        $_.Execute -eq $powershellPath -and $_.Arguments -eq $arguments
    }).Count -gt 0

    if (-not $actionMatches) {
        throw "A different scheduled task named '$taskName' already exists. Inspect it in Task Scheduler before changing it."
    }

    Enable-ScheduledTask -TaskName $taskName -TaskPath $taskPath | Out-Null
    Write-Host "The existing NVIDIA NIM startup task was verified and enabled for $currentUser."
    Write-Host 'It will run at the next Windows sign-in. The bridge already running in this session was not restarted.'
    return
}

$action = New-ScheduledTaskAction `
    -Execute $powershellPath `
    -Argument $arguments `
    -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$principal = New-ScheduledTaskPrincipal `
    -UserId $currentUser `
    -LogonType Interactive `
    -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName $taskName `
    -TaskPath $taskPath `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description 'Starts the user-scoped NVIDIA NIM bridge at sign-in. Reads the API key from Windows Credential Manager.' `
    | Out-Null

Write-Host "NVIDIA NIM bridge will start at the next Windows sign-in for $currentUser."
Write-Host 'The task runs as your user with limited privileges and opens a minimized PowerShell window.'
Write-Host 'The API key remains in Windows Credential Manager; this task does not store the key.'
Write-Host 'The bridge currently running in this session was not restarted.'
