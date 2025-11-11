<#
.SYNOPSIS
  Automatiza a criação e versionamento de registros Nyvia-v2.
.DESCRIPTION
  Cria um arquivo .md em ops/records/nyvia-v2, grava o conteúdo, faz commit e push automaticamente.
.PARAMETER Name
  Nome do arquivo de registro, sem extensão (ex: 2025-11-11-validacao-local)
.PARAMETER Content
  Conteúdo completo do registro em Markdown.
.EXAMPLE
  pwsh ops/bin/Add-Record.ps1 -Name "2025-11-11-validacao-local" -Content "# Registro de validação local..."
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$Name,

  [Parameter(Mandatory=$true)]
  [string]$Content
)

$RecordDir = "ops\records\nyvia-v2"
$FilePath  = "$RecordDir\$Name.md"

# Garante que o diretório exista
if (-not (Test-Path $RecordDir)) {
  New-Item -ItemType Directory -Path $RecordDir -Force | Out-Null
}

# Cria o arquivo e grava o conteúdo
Set-Content -Path $FilePath -Value $Content -Encoding UTF8 -Force

# Versiona automaticamente
git add $FilePath
git commit -m "Registro automático - $Name"
git push origin main
Write-Host "`n✅ Registro criado e enviado com sucesso:`n $FilePath"
