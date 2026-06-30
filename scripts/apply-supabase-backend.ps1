param(
  [switch]$Local,
  [switch]$GenerateTypes,
  [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"

$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCommand) {
  throw "Supabase CLI tidak ditemukan. Install Supabase CLI lalu jalankan ulang script ini."
}

if ($Local) {
  Write-Host "Applying local Supabase migrations with db reset..."
  & supabase db reset
} else {
  Write-Host "Applying linked Supabase migrations with db push..."
  & supabase db push
}

if ($GenerateTypes) {
  $scriptPath = Join-Path $PSScriptRoot "generate-supabase-types.ps1"
  if ($Local) {
    & $scriptPath -Local
  } else {
    & $scriptPath -ProjectId $ProjectId
  }
}

Write-Host "Supabase backend migration complete."

