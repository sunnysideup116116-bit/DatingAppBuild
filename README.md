# DatingApp Build & Releases 官方發布庫

本儲存庫為 **DatingApp** 跨平台應用程式的官方自動打包與公開安裝檔（Release）發布倉庫。

---

## 📥 最新版本下載

請至 [GitHub Releases 頁面](https://github.com/sunnysideup116116-bit/DatingAppBuild/releases) 下載適用於您裝置的最新安裝包：

| 作業系統 | 安裝包檔名格式 | 說明 |
| :--- | :--- | :--- |
| **Android (主流手機/平板)** | `DatingApp-vX.Y.Z-v8a.apk` | 適用於多數現代 Android 手機與平板 (arm64-v8a) |
| **Android (舊款裝置)** | `DatingApp-vX.Y.Z-v7a.apk` | 適用於較舊款 32 位元 Android 裝置 (armeabi-v7a) |
| **Android (模擬器/電腦)** | `DatingApp-vX.Y.Z-x64.apk` | 適用於 Android 模擬器或 x86_64 架構裝置 |
| **Windows** | `DatingApp-vX.Y.Z-Windows-Setup.exe` | 適用於 Windows 10 / 11 (x64) 安裝引導程式 |
| **Linux** | `DatingApp-vX.Y.Z-Linux-amd64.deb` | 適用於 Debian / Ubuntu 系列 (amd64) 安裝包 |
| **macOS** | `DatingApp-vX.Y.Z-macOS.dmg` | 適用於 macOS 系統安裝映像檔 |
| **iOS** | `DatingApp-vX.Y.Z.ipa` | 適用於 iOS 裝置安裝包 |

---

## 🛠️ 打包架構說明

- **自動建置**：本儲存庫利用 GitHub Actions 進行多平台平行編譯與自動化發布。
- **原始碼存取**：建置流程安全地拉取核心專案原始碼，執行靜態檢查、打包並產出經過混淆與符號分離的發布二進位檔案。
- **Windows 安裝檔配置**：收錄於 [`installer_windows/`](./installer_windows) 目錄中，使用 Inno Setup 進行安裝封裝。
