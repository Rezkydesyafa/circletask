param(
  [string]$Repo = "Rezkydesyafa/circletask",

  [string]$ProjectOwner = "",

  [int]$ProjectNumber = 0,

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "create-github-mvp-issues.ps1"

if (-not (Test-Path $scriptPath)) {
  throw "Script utama tidak ditemukan: $scriptPath"
}

$arguments = @{
  Repo = $Repo
}

if ($ProjectOwner -ne "") {
  $arguments.ProjectOwner = $ProjectOwner
}

if ($ProjectNumber -gt 0) {
  $arguments.ProjectNumber = $ProjectNumber
}

if ($DryRun) {
  $arguments.DryRun = $true
}

& $scriptPath @arguments
