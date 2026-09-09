param([Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference='Stop'
$connection=New-Object System.Data.SqlClient.SqlConnection 'Server=.\SQLEXPRESS;Database=master;Integrated Security=True;TrustServerCertificate=True;Connection Timeout=10'
try {
    $connection.Open()
    $sql=Get-Content -LiteralPath $File -Raw -Encoding UTF8
    foreach($batch in [regex]::Split($sql,'(?im)^\s*GO\s*\r?$')) {
        if(-not [string]::IsNullOrWhiteSpace($batch)) {
            $command=$connection.CreateCommand()
            $command.CommandText=$batch
            $command.CommandTimeout=60
            $table=New-Object System.Data.DataTable
            $adapter=New-Object System.Data.SqlClient.SqlDataAdapter $command
            [void]$adapter.Fill($table)
            if($table.Rows.Count -gt 0){$table | Format-Table -AutoSize}
        }
    }
    Write-Output 'SQL completed successfully.'
} finally { $connection.Dispose() }
