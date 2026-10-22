$ErrorActionPreference = 'Stop'

$taskName = 'NVIDIA NIM Bridge - Continue'
$taskPath = '\'
$task = Get-ScheduledTask -TaskName $taskName -TaskPath $taskPath -ErrorAction SilentlyContinue

if (-not $task) {
    Write-Host 'The NVIDIA NIM automatic startup task is not installed.'
    return
}

$launcherPath = Join-Path $PSScriptRoot 'Start-NvidiaNimBridge.ps1'
$powershellPath = (Get-Command powershell.exe -ErrorAction Stop).Source
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Minimized -File "{0}"' -f $launcherPath
$actionMatches = @($task.Actions | Where-Object {
    $_.Execute -eq $powershellPath -and $_.Arguments -eq $arguments
}).Count -gt 0

if (-not $actionMatches) {
    throw "The scheduled task '$taskName' does not match this project's launcher. It was not changed."
}

if ($task.State -eq 'Disabled') {
    Write-Host 'The NVIDIA NIM automatic startup task is already disabled.'
    return
}

Disable-ScheduledTask -TaskName $taskName -TaskPath $taskPath | Out-Null
Write-Host 'Automatic startup is disabled for future Windows sign-ins.'
Write-Host 'If the bridge is running now, stop it separately with Ctrl+C in its minimized PowerShell window.'
