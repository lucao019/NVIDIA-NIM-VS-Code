$ErrorActionPreference = 'Stop'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js is required to run the local NVIDIA NIM bridge.'
}

if (-not ('NvidiaNimCredentialReader' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class NvidiaNimCredentialReader {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public UInt32 Flags;
        public UInt32 Type;
        public IntPtr TargetName;
        public IntPtr Comment;
        public Int64 LastWritten;
        public UInt32 CredentialBlobSize;
        public IntPtr CredentialBlob;
        public UInt32 Persist;
        public UInt32 AttributeCount;
        public IntPtr Attributes;
        public IntPtr TargetAlias;
        public IntPtr UserName;
    }

    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, UInt32 type, UInt32 flags, out IntPtr credential);

    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr buffer);

    public static string[] Read(string target) {
        IntPtr pointer;
        if (!CredRead(target, 1, 0, out pointer)) {
            return null;
        }

        try {
            CREDENTIAL credential = (CREDENTIAL)Marshal.PtrToStructure(pointer, typeof(CREDENTIAL));
            byte[] bytes = new byte[(int)credential.CredentialBlobSize];
            if (bytes.Length > 0) {
                Marshal.Copy(credential.CredentialBlob, bytes, 0, bytes.Length);
            }

            return new string[] {
                Marshal.PtrToStringUni(credential.UserName),
                Encoding.Unicode.GetString(bytes).TrimEnd('\0')
            };
        } finally {
            CredFree(pointer);
        }
    }
}
'@
}

$storedCredential = [NvidiaNimCredentialReader]::Read('NVIDIA-NIM')
if ($null -eq $storedCredential -or [string]::IsNullOrWhiteSpace($storedCredential[1])) {
    throw 'Credential not found. Add the NVIDIA-NIM generic credential to Windows Credential Manager first.'
}

if ($storedCredential[0] -ne 'NVIDIA_API_KEY') {
    throw 'The NVIDIA-NIM credential has an unexpected username. Expected NVIDIA_API_KEY.'
}

$bridgePath = Join-Path $PSScriptRoot 'NvidiaNimBridge.js'
if (-not (Test-Path -LiteralPath $bridgePath)) {
    throw "Bridge file not found: $bridgePath"
}

$env:NVIDIA_NIM_UPSTREAM_KEY = $storedCredential[1]
$storedCredential = $null

try {
    Write-Host 'Starting the local NVIDIA NIM bridge on 127.0.0.1:8765.'
    Write-Host 'Keep this terminal open while using the coding agent. Press Ctrl+C to stop.'
    & node $bridgePath
    if ($LASTEXITCODE -ne 0) {
        throw "The local bridge exited with code $LASTEXITCODE."
    }
} finally {
    Remove-Item Env:NVIDIA_NIM_UPSTREAM_KEY -ErrorAction SilentlyContinue
}
