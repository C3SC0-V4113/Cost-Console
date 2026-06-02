Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = $env:CLAUDE_PROJECT_DIR
if ([string]::IsNullOrWhiteSpace($projectRoot)) {
  $projectRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')
}

Set-Location -LiteralPath $projectRoot

try {
  $status = git status --porcelain
} catch {
  Write-Output 'project-min-evaluation: git not found; skipping close-task evaluation.'
  exit 0
}

if ([string]::IsNullOrWhiteSpace(($status | Out-String))) {
  exit 0
}

Write-Output 'project-min-evaluation: working tree has changes; running minimum checks before completion.'

$scripts = @('lint', 'typecheck', 'format:check', 'test', 'doctor', 'check')
foreach ($scriptName in $scripts) {
  Write-Output ""
  Write-Output "project-min-evaluation: cmd /c npm run $scriptName"
  & cmd /c "npm run $scriptName"
  if ($LASTEXITCODE -ne 0) {
    Write-Output ""
    Write-Output "project-min-evaluation: npm run $scriptName failed. Fix the issue before reporting completion."
    exit $LASTEXITCODE
  }
}

Write-Output ""
Write-Output 'project-min-evaluation: all minimum checks passed.'
