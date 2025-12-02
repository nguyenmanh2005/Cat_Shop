import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "vi" | "en" | "zh" | "ja";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Common
    "settings.title": "Cài đặt",
    "settings.save": "Lưu tất cả thay đổi",
    "settings.saved": "Đã lưu cài đặt",
    "settings.saved.description": "Tất cả các thay đổi đã được lưu thành công.",
    
    // Notifications
    "notifications.title": "Thông báo",
    "notifications.email.title": "Thông báo Email",
    "notifications.email.description": "Quản lý các thông báo được gửi qua email",
    "notifications.push.title": "Thông báo Push",
    "notifications.push.description": "Nhận thông báo trực tiếp trên thiết bị của bạn",
    
    // Appearance
    "appearance.title": "Giao diện",
    "appearance.theme": "Chủ đề",
    "appearance.language": "Ngôn ngữ",
    "appearance.compact": "Chế độ compact",
    
    // Privacy
    "privacy.title": "Quyền riêng tư",
    "privacy.profile": "Hiển thị hồ sơ",
    
    // Account
    "account.title": "Tài khoản",
    "account.export": "Xuất dữ liệu",
    "account.delete": "Xóa tài khoản",
  },
  en: {
    // Common
    "settings.title": "Settings",
    "settings.save": "Save all changes",
    "settings.saved": "Settings saved",
    "settings.saved.description": "All changes have been saved successfully.",
    
    // Notifications
    "notifications.title": "Notifications",
    "notifications.email.title": "Email Notifications",
    "notifications.email.description": "Manage notifications sent via email",
    "notifications.push.title": "Push Notifications",
    "notifications.push.description": "Receive notifications directly on your device",
    
    // Appearance
    "appearance.title": "Appearance",
    "appearance.theme": "Theme",
    "appearance.language": "Language",
    "appearance.compact": "Compact mode",
    
    // Privacy
    "privacy.title": "Privacy",
    "privacy.profile": "Profile visibility",
    
    // Account
    "account.title": "Account",
    "account.export": "Export data",
    "account.delete": "Delete account",
  },
  zh: {
    // Common
    "settings.title": "设置",
    "settings.save": "保存所有更改",
    "settings.saved": "设置已保存",
    "settings.saved.description": "所有更改已成功保存。",
    
    // Notifications
    "notifications.title": "通知",
    "notifications.email.title": "电子邮件通知",
    "notifications.email.description": "管理通过电子邮件发送的通知",
    "notifications.push.title": "推送通知",
    "notifications.push.description": "直接在您的设备上接收通知",
    
    // Appearance
    "appearance.title": "外观",
    "appearance.theme": "主题",
    "appearance.language": "语言",
    "appearance.compact": "紧凑模式",
    
    // Privacy
    "privacy.title": "隐私",
    "privacy.profile": "个人资料可见性",
    
    // Account
    "account.title": "账户",
    "account.export": "导出数据",
    "account.delete": "删除账户",
  },
  ja: {
    // Common
    "settings.title": "設定",
    "settings.save": "すべての変更を保存",
    "settings.saved": "設定が保存されました",
    "settings.saved.description": "すべての変更が正常に保存されました。",
    
    // Notifications
    "notifications.title": "通知",
    "notifications.email.title": "メール通知",
    "notifications.email.description": "メールで送信される通知を管理",
    "notifications.push.title": "プッシュ通知",
    "notifications.push.description": "デバイスで直接通知を受信",
    
    // Appearance
    "appearance.title": "外観",
    "appearance.theme": "テーマ",
    "appearance.language": "言語",
    "appearance.compact": "コンパクトモード",
    
    // Privacy
    "privacy.title": "プライバシー",
    "privacy.profile": "プロフィールの表示",
    
    // Account
    "account.title": "アカウント",
    "account.export": "データをエクスポート",
    "account.delete": "アカウントを削除",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings_language");
      return (saved as Language) || "vi";
    }
    return "vi";
  });

  useEffect(() => {
    // Apply language to HTML lang attribute
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem("settings_language", language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

