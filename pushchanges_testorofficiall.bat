@echo off
REM Skrypt do commit i push z pomiarem rozmiaru projektu i .git

REM === MENU WYBORU ===
echo.
echo 🔄 Wybierz repozytorium docelowe:
echo [1] Oficjalne (https://github.com/studiog14/configurator_fk.git)
echo [2] Testowe   (https://github.com/studiog14/configurator_test.git)
set /p choice=Twój wybór (1/2):

REM === USTAWIENIE URL NA PODSTAWIE WYBORU ===
if "%choice%"=="1" (
    set repoURL=https://github.com/studiog14/configurator_fk.git
) else if "%choice%"=="2" (
    set repoURL=https://github.com/studiog14/configurator_test.git
) else (
    echo ❌ Nieprawidłowy wybór. Wpisz 1 lub 2.
    pause
    exit /b
)

REM === OBLICZANIE ROZMIARU FOLDERU PROJEKTU ===
echo.
echo 📂 Obliczam rozmiar folderu projektu...
for /f %%a in ('powershell -command "(Get-ChildItem 'E:\configurator_fk' -Recurse -File | Measure-Object -Property Length -Sum).Sum"') do set folderSize=%%a
set /a folderMB=%folderSize% / 1048576

REM === OBLICZANIE ROZMIARU FOLDERU .git ===
echo.
echo 🧠 Obliczam rozmiar folderu .git...
for /f %%a in ('powershell -command "(Get-ChildItem 'E:\configurator_fk\.git' -Recurse -File | Measure-Object -Property Length -Sum).Sum"') do set gitSize=%%a
set /a gitMB=%gitSize% / 1048576

REM === SUMA ROZMIARÓW ===
set /a totalMB=%folderMB% + %gitMB%
echo 📦 Łączny rozmiar projektu + .git: ~ %totalMB% MB

REM === PRZEJŚCIE DO FOLDERU PROJEKTU ===
cd /d E:\configurator_fk

REM === USTAWIENIE REMOTE ORIGIN ===
git remote set-url origin %repoURL%

REM === DODANIE ZMIAN I COMMIT Z DATĄ ===
git add .
for /f "tokens=1-4 delims=/:. " %%a in ("%date% %time%") do (
  set datetime=%%d-%%b-%%c_%%a%%e
)
git commit -m "Auto commit: %datetime% (~%totalMB% MB incl. .git)"

REM === PUSH NA BRANCH MAIN ===
git push origin main

pause
