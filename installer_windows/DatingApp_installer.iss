; DatingApp Windows installer.
; The Flutter build output is packaged as a single x64 installer.

#define MyAppName "DatingApp"
#ifndef MyAppVersion
#define MyAppVersion "1.0.0+9"
#endif
#define MyAppPublisher "MIS Project"
#define MyAppExeName "dating_app.exe"

[Setup]
AppId={{A9C4B9D0-1B42-4C67-9A1D-7D69D5D9D4A5}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
DisableProgramGroupPage=yes
OutputDir=..\build\windows\installer
OutputBaseFilename=DatingApp-Windows-Setup
SetupIconFile=..\windows\runner\resources\app_icon.ico

; 最高等級的 LZMA2 壓縮演算法
SolidCompression=yes
Compression=lzma2/ultra64
LZMADictionarySize=65536

WizardStyle=modern
UsedUserAreasWarning=no

[Languages]
Name: "chinesetraditional"; MessagesFile: "compiler:Default.isl,ChineseTraditional.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\build\windows\x64\runner\Release\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; 啟動 App
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
; 防火牆：允許輸入
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName}"" dir=in action=allow program=""{app}\{#MyAppExeName}"" enable=yes"; Flags: runhidden
; 防火牆：允許輸出
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName}"" dir=out action=allow program=""{app}\{#MyAppExeName}"" enable=yes"; Flags: runhidden

[UninstallRun]
; 移除防火牆規則
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName}"" program=""{app}\{#MyAppExeName}"""; Flags: runhidden; RunOnceId: "RemoveFirewallRule"

[UninstallDelete]
; 刪除崩潰紀錄檔
Type: files; Name: "{localappdata}\CrashDumps\{#MyAppName}*.dmp"
Type: files; Name: "{localappdata}\CrashDumps\dating_app*.dmp"
; 解除安裝後若安裝目錄有執行期殘留檔案，一併乾淨移除
Type: filesandordirs; Name: "{app}"

[Registry]
; 停用本機崩潰傾印，解除安裝時自動刪除此機碼
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\{#MyAppExeName}"; ValueType: dword; ValueName: "DumpCount"; ValueData: "0"; Flags: uninsdeletekey

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  TargetPaths: array[0..4] of string;
  I: Integer;
begin
  if CurUninstallStep = usUninstall then
  begin
    // 專案現行 Flutter Windows AppData (%APPDATA% 與 %LOCALAPPDATA%)
    TargetPaths[0] := ExpandConstant('{userappdata}\com.misproject');
    TargetPaths[1] := ExpandConstant('{localappdata}\com.misproject');
    // 歷史版本相容路徑
    TargetPaths[2] := ExpandConstant('{userappdata}\NSYSU');
    TargetPaths[3] := ExpandConstant('{userappdata}\com.nsysutest');
    TargetPaths[4] := ExpandConstant('{userappdata}\com.nsysutest\NSYSU');

    for I := 0 to 4 do
    begin
      if DirExists(TargetPaths[I]) then
      begin
        DelTree(TargetPaths[I], True, True, True);
      end;
    end;
  end;
end;
