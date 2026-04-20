$body = @{
    sql = @"
CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    desactivada_por TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL
);
"@
} | ConvertTo-Json

$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$web = New-Object System.Net.WebClient
$web.Headers['Content-Type'] = 'application/json'
$web.Headers['apikey'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZ3b29qY3F6Y3Z3andjZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODgwMDEsImV4cCI6MjA5MjI2NDAwMX0.54gwvzl8JEOsjDHLmnnKAKPCbj2XjJ3t3obwFyOIYEw'
$web.Headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZ3b29qY3F6Y3Z3andjZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODgwMDEsImV4cCI6MjA5MjI2NDAwMX0.54gwvzl8JEOsjDHLmnnKAKPCbj2XjJ3t3obwFyOIYEw'

try {
    $response = $web.UploadData('https://wuvvwoojcqzcvwjwcgce.supabase.co/rest/v1/rpc/exec_sql', 'POST', $bytes)
    [System.Text.Encoding]::UTF8.GetString($response)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
