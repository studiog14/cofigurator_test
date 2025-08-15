@echo off
REM Skrypt do automatycznego commit i push do GitHub dla repo studiog14/Chair_FK_Configurator

REM Przejdź do folderu repozytorium - zmień ścieżkę na faktyczną lokalizację Twojego repo
cd /d E:\FK_Configurator\FK_Configurator

REM Dodaj wszystkie zmienione pliki
git add .

REM Zrób commit z aktualnym timestampem
for /f "tokens=1-4 delims=/:. " %%a in ("%date% %time%") do (
  set datetime=%%d-%%b-%%c_%%a%%e
)
git commit -m "Auto commit: %datetime%"

REM Push na branch main
git push origin main

pause
