param(
  [switch]$Local,
  [string]$ProjectId = "",
  [string]$Output = "types/supabase.ts"
)

$ErrorActionPreference = "Stop"

$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCommand) {
  throw "Supabase CLI tidak ditemukan. Install Supabase CLI lalu jalankan ulang script ini."
}

$outputPath = Join-Path (Get-Location) $Output
$outputDirectory = Split-Path $outputPath -Parent
if (-not (Test-Path $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

if ($Local -or $ProjectId -eq "") {
  & supabase gen types typescript --local | Set-Content -LiteralPath $outputPath -Encoding UTF8
} else {
  & supabase gen types typescript --project-id $ProjectId | Set-Content -LiteralPath $outputPath -Encoding UTF8
}

Write-Host "Generated Supabase types: $Output"

