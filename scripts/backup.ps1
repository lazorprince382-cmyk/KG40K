param(
  [string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) "backups"),
  [string]$PgDump = "pg_dump"
)
$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$resolvedOutput = [IO.Path]::GetFullPath($OutputRoot)
if ($resolvedOutput -eq $projectRoot) { throw "Backup output cannot be the project root." }
$envFile = Join-Path $projectRoot ".env"
if (-not $env:DATABASE_URL -and (Test-Path -LiteralPath $envFile)) {
  $line = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
  if ($line) { $env:DATABASE_URL = $line.Substring("DATABASE_URL=".Length) }
}
if (-not $env:DATABASE_URL) { throw "DATABASE_URL is required." }
$env:DATABASE_URL = $env:DATABASE_URL.Trim().Trim('"').Trim("'")
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destination = Join-Path $resolvedOutput $stamp
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$dumpFile = Join-Path $destination "database.dump"
& $PgDump "--format=custom" "--file=$dumpFile" "$env:DATABASE_URL"
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }
$uploads = Join-Path $projectRoot "storage\uploads"
if (Test-Path -LiteralPath $uploads) { Copy-Item -LiteralPath $uploads -Destination (Join-Path $destination "uploads") -Recurse -Force }
$manifest = Get-ChildItem -LiteralPath $destination -File -Recurse | ForEach-Object {
  [pscustomobject]@{ path = $_.FullName.Substring($destination.Length + 1); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash; bytes = $_.Length }
}
$manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $destination "manifest.json") -Encoding utf8
Write-Output "Backup created: $destination"
