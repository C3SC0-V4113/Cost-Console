Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$inputText = [Console]::In.ReadToEnd()
$projectRoot = $env:CLAUDE_PROJECT_DIR
if ([string]::IsNullOrWhiteSpace($projectRoot)) {
  $projectRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')
}

Set-Location -LiteralPath $projectRoot

function Should-Scan {
  param([string] $HookInput)

  if ([string]::IsNullOrWhiteSpace($HookInput)) {
    return $true
  }

  try {
    $payload = $HookInput | ConvertFrom-Json
  } catch {
    return $true
  }

  $editTools = @('Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'ApplyPatch')
  $eventName = $payload.hook_event_name
  if (-not $eventName) {
    $eventName = $payload.eventName
  }
  if (-not $eventName) {
    $eventName = $payload.event_name
  }

  if ($eventName -eq 'PostToolBatch') {
    $toolCalls = @($payload.tool_calls)
    foreach ($toolCall in $toolCalls) {
      if ($editTools -contains $toolCall.tool_name) {
        return $true
      }
    }
    return $false
  }

  $toolName = $payload.tool_name
  if (-not $toolName) {
    $toolName = $payload.toolName
  }
  if (-not $toolName) {
    $toolName = $payload.tool
  }

  return (-not $toolName) -or ($editTools -contains $toolName)
}

if (-not (Should-Scan -HookInput $inputText)) {
  exit 0
}

$reactDoctor = Join-Path $projectRoot 'node_modules\.bin\react-doctor.cmd'
$output = ''
$exitCode = 0

if (Test-Path -LiteralPath $reactDoctor) {
  $output = & cmd /c "`"$reactDoctor`" --verbose --diff --fail-on warning --no-score" 2>&1 | Out-String
  $exitCode = $LASTEXITCODE
} else {
  $output = & cmd /c 'npx --yes react-doctor@latest --verbose --diff --fail-on warning --no-score' 2>&1 | Out-String
  $exitCode = $LASTEXITCODE
}

if ($exitCode -eq 0) {
  exit 0
}

$message = "React Doctor found issues in the changed files. Review this output and fix the regressions before finishing.`n`n$output"
try {
  $payload = $inputText | ConvertFrom-Json
  if ($payload.hook_event_name -eq 'PostToolBatch') {
    @{ hookSpecificOutput = @{ hookEventName = 'PostToolBatch'; additionalContext = $message } } | ConvertTo-Json -Compress
  } else {
    @{ additional_context = $message } | ConvertTo-Json -Compress
  }
} catch {
  $message
}

exit 1
