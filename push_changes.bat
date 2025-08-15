@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Skrypt: automatyczny add/commit/push do repo GitHub
REM Repo docelowe: https://github.com/studiog14/cofigurator_test.git

REM 1) Przejdź do katalogu, w którym znajduje się ten skrypt (root repo)
cd /d "%~dp0"

REM 2) Sprawdź czy to repo git
git rev-parse --is-inside-work-tree >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Ten folder nie jest repozytorium Git.
  pause
  exit /b 1
)

REM 3) Ustaw/zweryfikuj remote 'origin' na nowe repo
set "REMOTE_URL=https://github.com/studiog14/cofigurator_test.git"
set "HAS_ORIGIN="
for /f "delims=" %%r in ('git remote 2^>NUL') do (
  if /I "%%r"=="origin" set HAS_ORIGIN=1
)
if not defined HAS_ORIGIN (
  echo [INFO] Dodaję remote origin: %REMOTE_URL%
  git remote add origin "%REMOTE_URL%"
) else (
  for /f "delims=" %%u in ('git remote get-url origin 2^>NUL') do set CUR_URL=%%u
  echo [INFO] Obecny origin: !CUR_URL!
  if /I not "!CUR_URL!"=="%REMOTE_URL%" (
    echo [INFO] Ustawiam origin na: %REMOTE_URL%
    git remote set-url origin "%REMOTE_URL%"
  )
)

REM 4) Upewnij się, że jesteśmy na branchu 'main'
for /f %%b in ('git rev-parse --abbrev-ref HEAD') do set BR=%%b
if /I not "!BR!"=="main" (
  echo [INFO] Aktualna gałąź to '!BR!'. Przełączam/zmieniam nazwę na 'main'...
  git branch -M main
)

REM 5) Dodaj wszystkie zmiany
echo [INFO] Stage'uję zmiany...
git add -A

REM 6) Commit tylko jeśli są zmiany w indeksie
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd_HHmmss')"`) do set TS=%%t

git diff --cached --quiet
if errorlevel 1 (
  echo [INFO] Tworzę commit...
  git commit -m "Auto commit: %TS%"
) else (
  echo [INFO] Brak zmian do commita.
)

REM 7) Push: jeśli brak upstream -> ustaw, inaczej zwykły push
git rev-parse --abbrev-ref --symbolic-full-name @{u} >NUL 2>&1
if errorlevel 1 (
  echo [INFO] Push + ustawienie upstream (origin/main)...
  git push -u origin main
) else (
  echo [INFO] Push do zdefiniowanego upstream...
  git push
)

if errorlevel 1 (
  echo [ERROR] Push nie powiódł się. Dokończ logowanie do GitHub (okno przeglądarki), a potem uruchom skrypt ponownie.
  pause
  exit /b 1
) else (
  echo [SUCCESS] Push zakończony powodzeniem.
)

pause
endlocal
