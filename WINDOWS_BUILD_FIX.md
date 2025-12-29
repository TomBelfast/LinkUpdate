# 🔧 Windows Build Fix

**Problem**: Build script nie działa w Windows PowerShell

**Symptom**:
```
'NODE_OPTIONS' is not recognized as an internal or external command
```

**Przyczyna**: 
- Windows PowerShell nie obsługuje bezpośredniego ustawiania zmiennych środowiskowych w formacie `VAR=value command`
- Ten format działa tylko w Unix-like systemach (Linux, macOS, Git Bash)

**Rozwiązanie**:
- ✅ Przywrócono `cross-env` do build script
- ✅ `cross-env` jest już w devDependencies
- ✅ Działa zarówno w Windows jak i Linux/Docker

**Uwaga**: 
- Dockerfile używa bezpośrednio `NODE_OPTIONS` (działa w Linux)
- Build script w package.json używa `cross-env` (działa w Windows)
- To jest prawidłowe podejście - różne narzędzia dla różnych środowisk

---

*Fix zastosowany: 2024-12-29*

