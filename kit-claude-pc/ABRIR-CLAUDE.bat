@echo off
title Claude - Clientes (Michele Salla)
setlocal
set "PASTA=%USERPROFILE%\CLIENTES"

where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo Falta instalar o Git. Baixe em https://git-scm.com/download/win , instale e abra este arquivo de novo.
  start https://git-scm.com/download/win
  pause
  exit /b
)
where claude >nul 2>nul
if errorlevel 1 (
  echo.
  echo Falta instalar o Claude Code. Vou abrir o PowerShell para instalar. Depois abra este arquivo de novo.
  powershell -NoProfile -Command "irm https://claude.ai/install.ps1 | iex"
  pause
  exit /b
)
where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo Aviso: o Python nao esta instalado. O Claude vai precisar dele para falar com o WordPress.
  echo Instale pela Microsoft Store ^(Python 3.12^) ou em https://www.python.org/downloads/
)

if not exist "%PASTA%\.git" (
  echo Baixando o projeto do GitHub para %PASTA% ...
  git clone https://github.com/patrikgonzaga3-ux/CLIENTES "%PASTA%"
) else (
  echo Atualizando o projeto...
  git -C "%PASTA%" pull --ff-only
)
cd /d "%PASTA%"

if not exist ".env" (
  copy ".env.exemplo" ".env" >nul
  echo.
  echo ===================================================================
  echo  Vai abrir o Bloco de Notas. Troque "cole-aqui-a-senha-de-aplicacao"
  echo  pela senha de aplicacao do WordPress da Michele, salve ^(Ctrl+S^)
  echo  e feche o Bloco de Notas para continuar.
  echo ===================================================================
  notepad ".env"
)

claude "Leia o CLAUDE.md e a skill wordpress-michele. Rode python tools/wp_michele.py teste para conferir o acesso ao WordPress da Michele e me diga, em poucas linhas, o que ja esta pronto e qual o proximo passo."
