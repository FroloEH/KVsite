$url = "http://localhost:4321/api/tally/"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Load field data from JSON file with explicit UTF-8 encoding to avoid
# PowerShell 5.x reading the source file as Windows-1252
$data = Get-Content "$PSScriptRoot/test-fields-data.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$titleField = $data.titleField
$testFields = $data.testFields

function Send-Test($fields) {
    $body = @{
        eventId   = [guid]::NewGuid().ToString()
        eventType = "FORM_RESPONSE"
        createdAt = (Get-Date -Format "o")
        data      = @{
            responseId   = "TEST"
            submissionId = "TEST"
            respondentId = "TEST"
            formId       = "TEST"
            formName     = "TEST"
            createdAt    = (Get-Date -Format "o")
            fields       = $fields
        }
    } | ConvertTo-Json -Depth 10

    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $response = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json;charset=UTF-8" -Body $bodyBytes -UseBasicParsing
        Write-Host "  OK ($($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "  FAIL (HTTP $status)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Testing each field individually alongside Title..."
Write-Host ""

$failed = @()

foreach ($field in $testFields) {
    $label = $field.label
    Write-Host "Testing: $label" -NoNewline
    $ok = Send-Test @($titleField, $field)
    if (-not $ok) {
        $failed += $label
    }
}

Write-Host ""
if ($failed.Count -eq 0) {
    Write-Host "All individual fields passed. Issue may be with field combination." -ForegroundColor Yellow
} else {
    Write-Host "Failed fields:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
