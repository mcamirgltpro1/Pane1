import React, { useState } from 'react';
import { 
  Globe, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  Volume2, 
  Smartphone, 
  FileCode, 
  Copy, 
  Check, 
  FolderDown, 
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';
import JSZip from 'jszip';
import { AppState, Language, ThemeMode } from '../types';
import { translations, toPersianDigits } from '../utils/translations';
import { playChime, triggerVibration, requestNotificationPermission } from '../utils/audio';
import { androidProjectFiles, AndroidFile } from '../androidCode/sourceFiles';

interface SettingsViewProps {
  state: AppState;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: ThemeMode) => void;
  onRestoreState: (importedState: AppState) => void;
  onResetState: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateLanguage,
  onUpdateTheme,
  onRestoreState,
  onResetState,
}) => {
  const t = translations[state.language];

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedFile = androidProjectFiles[selectedFileIndex] || androidProjectFiles[0];

  const handleTestChime = () => {
    playChime('gentle');
    triggerVibration([80, 40, 80]);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      playChime('complete');
      setStatusMessage(state.language === 'fa' ? 'مجوز اعلان‌ها با موفقیت فعال شد' : 'Notification permission granted');
    } else {
      setStatusMessage(state.language === 'fa' ? 'مجوز اعلان توسط مرورگر تایید نشد' : 'Notification permission denied');
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playChime('complete');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.courses && parsed.scheduleActivities && parsed.tasks) {
          onRestoreState(parsed);
          playChime('complete');
          setStatusMessage(t.restoreSuccess);
        } else {
          alert('فایل پشتیبان نامعتبر است (ساختار داده شناسایی نشد).');
        }
      } catch {
        alert('خطا در خواندن فایل پشتیبان JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    playChime('gentle');
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadAllAsZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      androidProjectFiles.forEach((f) => {
        zip.file(f.path, f.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyPlanner_AndroidStudio_Kotlin_Project.zip';
      a.click();
      URL.revokeObjectURL(url);

      playChime('complete');
      triggerVibration([100, 50, 100]);
      setStatusMessage(
        state.language === 'fa' 
          ? 'پروژه کامل اندروید استودیو به صورت فایل ZIP دانلود شد!' 
          : 'Full Android Studio project downloaded as ZIP!'
      );
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-4 max-w-2xl mx-auto">
      {/* Status toast message */}
      {statusMessage && (
        <div className="p-3 bg-amber-400 text-black font-semibold text-xs rounded-2xl flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. Language & Theme Preferences */}
      <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{t.appLanguage} & {t.appTheme}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Persian RTL */}
          <button
            onClick={() => onUpdateLanguage('fa')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              state.language === 'fa'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <span>فارسی (RTL)</span>
            {state.language === 'fa' && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          {/* English LTR */}
          <button
            onClick={() => onUpdateLanguage('en')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              state.language === 'en'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <span>English (LTR)</span>
            {state.language === 'en' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* AMOLED Dark */}
          <button
            onClick={() => onUpdateTheme('amoled')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              state.theme === 'amoled' || state.theme === 'dark'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              <span>AMOLED Dark</span>
            </div>
            {(state.theme === 'amoled' || state.theme === 'dark') && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Light */}
          <button
            onClick={() => onUpdateTheme('light')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              state.theme === 'light'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{t.lightTheme}</span>
            </div>
            {state.theme === 'light' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 2. Notifications & Audio Test */}
      <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>{t.smartReminders}</span>
        </h3>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleTestChime}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 text-xs font-semibold text-zinc-200 flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{t.testSound}</span>
          </button>

          <button
            onClick={handleRequestNotifications}
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold shadow-sm"
          >
            {state.language === 'fa' ? 'درخواست مجوز اعلان مرورگر' : 'Enable Notifications'}
          </button>
        </div>
      </div>

      {/* 3. JSON Backup & Restore (Local Offline Persistence) */}
      <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>{t.backupAndRestore}</span>
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {state.language === 'fa'
            ? 'برنامه به صورت کاملاً آفلاین اجرا می‌شود. می‌توانید در هر زمان از تمامی اطلاعات پشتیبان بگیرید یا آن را بازیابی کنید.'
            : 'All data is stored locally on device. You can export or restore a complete JSON backup at any time.'}
        </p>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{t.exportBackup}</span>
          </button>

          <label className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>{t.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm(t.resetConfirm)) {
                onResetState();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.resetData}</span>
          </button>
        </div>
      </div>

      {/* 4. Native Android Studio Kotlin Project Exporter */}
      <div className="bg-[#151515] border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {t.androidProjectExport}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {t.androidProjectDescription}
            </p>
          </div>

          <button
            onClick={handleDownloadAllAsZip}
            disabled={isZipping}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold flex items-center gap-2 shadow-sm shadow-amber-400/20 active:scale-95 transition-all shrink-0 disabled:opacity-50"
          >
            <FolderDown className="w-4 h-4" />
            <span>{isZipping ? (state.language === 'fa' ? 'در حال زیپ...' : 'Zipping...') : t.downloadZip}</span>
          </button>
        </div>

        {/* File Browser Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 block px-1">
            {t.filesInProject} ({toPersianDigits(androidProjectFiles.length, state.language)})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            {androidProjectFiles.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`p-2 rounded-xl text-[11px] text-start truncate font-mono transition-all ${
                  selectedFileIndex === idx
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {file.path.split('/').pop()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected File Details & Code Viewer */}
        <div className="bg-black/90 rounded-2xl border border-zinc-800/80 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div className="min-w-0">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                {selectedFile.category}
              </span>
              <p className="text-xs font-mono font-semibold text-white truncate">
                {selectedFile.path}
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 shrink-0"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? t.codeCopied : t.copyCode}</span>
            </button>
          </div>

          <pre className="text-[11px] font-mono text-zinc-300 max-h-72 overflow-y-auto overflow-x-auto whitespace-pre p-2 bg-zinc-950/80 rounded-xl leading-relaxed">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
