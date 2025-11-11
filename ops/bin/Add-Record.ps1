<#
.SYNOPSIS
  Cria e versiona automaticamente registros Nyvia-v2.
.DESCRIPTION
  Gera arquivos .md dentro de ops/records, adiciona, commita e faz push.
.PARAMETER Name
  Nome do arquivo (sem extensão .md).
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

$RecordDir = "ops\records"
$FilePath  = "$RecordDir\$Name.md"

# Garante que a pasta exista
if (-not (Test-Path $RecordDir)) {
  New-Item -ItemType Directory -Path $RecordDir -Force | Out-Null
}

# Cria e grava o arquivo
Set-Content -Path $FilePath -Value $Content -Encoding UTF8 -Force

# Versiona e envia
git add $FilePath
git commit -m "Registro automático - $Name"
git push origin main

Write-Host "`n✅ Registro criado e enviado com sucesso:`n $FilePath"
