@echo off
echo ================================
echo  ENVIANDO PROJETO PARA O GITHUB
echo ================================

REM Etapa 1: adicionar alterações
git add .

REM Etapa 2: pedir mensagem do commit
set /p msg=Digite a mensagem do commit: 

REM Etapa 3: salvar alterações localmente
git commit -m "%msg%"

REM Etapa 4: atualizar com repositório remoto
git pull origin main --rebase

REM Etapa 5: enviar para o GitHub
git push

echo.
echo ✅ Projeto enviado com sucesso para o GitHub!
pause
