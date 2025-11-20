import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translationService } from "@/services/translationService";

type Language = "vi" | "en" | "zh" | "ja";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => Promise<string>;
  tSync: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Cache để tránh dịch lại text đã dịch
const translationCache = new Map<string, string>();

// Fallback dictionary cho những trường hợp API không khả dụng
const fallbackTranslations: Record<Language, Record<string, string>> = {
  vi: {
    // Common UI
    "common.search": "Tìm kiếm...",
    "common.login": "Đăng nhập",
    "common.register": "Đăng ký",
    "common.logout": "Đăng xuất",
    "common.profile": "Hồ sơ",
    "common.cart": "Giỏ hàng",
    "common.settings": "Cài đặt",
    "common.admin": "Quản trị",
    "common.home": "Trang chủ",
    "common.about": "Giới thiệu",
    "common.blog": "Blog",
    "common.contact": "Liên hệ",
    "common.loading": "Đang tải...",
    "common.error": "Lỗi",
    "common.success": "Thành công",
    "common.cancel": "Hủy",
    "common.save": "Lưu",
    "common.delete": "Xóa",
    "common.edit": "Sửa",
    "common.add": "Thêm",
    "common.view": "Xem",
    "common.close": "Đóng",
    
    // Header
    "header.slogan": "Chăm sóc - Yêu thương",
    "header.search.placeholder": "Tìm kiếm...",
    
    // Navigation
    "nav.home": "Trang chủ",
    "nav.pets": "Thú cưng",
    "nav.pet.products": "Sản phẩm thú cưng",
    "nav.food": "Thức ăn",
    "nav.accessories": "Phụ kiện",
    "nav.blog": "Blog",
    "nav.about": "Giới thiệu",
    "nav.contact": "Liên hệ",
    
    // Products
    "product.view.details": "Xem chi tiết",
    "product.add.to.cart": "Thêm vào giỏ",
    "product.price": "Giá",
    "product.category": "Danh mục",
    "product.description": "Mô tả",
    "product.reviews": "Đánh giá",
    "product.stock": "Tình trạng",
    "product.in.stock": "Còn hàng",
    "product.out.of.stock": "Hết hàng",
    
    // Cart
    "cart.title": "Giỏ hàng",
    "cart.empty": "Giỏ hàng trống",
    "cart.total": "Tổng cộng",
    "cart.checkout": "Thanh toán",
    "cart.continue.shopping": "Tiếp tục mua sắm",
    "cart.remove": "Xóa",
    "cart.quantity": "Số lượng",
    
    // Auth
    "auth.login.title": "Đăng nhập",
    "auth.register.title": "Đăng ký",
    "auth.email": "Email",
    "auth.password": "Mật khẩu",
    "auth.confirm.password": "Xác nhận mật khẩu",
    "auth.forgot.password": "Quên mật khẩu?",
    "auth.no.account": "Chưa có tài khoản?",
    "auth.have.account": "Đã có tài khoản?",
    "auth.login.success": "Đăng nhập thành công",
    "auth.register.success": "Đăng ký thành công",
    "auth.logout.success": "Đăng xuất thành công",
    
    // Settings
    "settings.title": "Cài đặt",
    "settings.subtitle": "Quản lý cài đặt tài khoản và tùy chọn của bạn",
    "settings.save": "Lưu tất cả thay đổi",
    "settings.saved": "Đã lưu cài đặt",
    "settings.saved.description": "Tất cả các thay đổi đã được lưu thành công.",
    "settings.data.export.success": "Đã xuất dữ liệu",
    "settings.data.export.description": "Cài đặt của bạn đã được tải xuống.",
    "settings.delete.title": "Tính năng đang phát triển",
    "settings.delete.description": "Tính năng xóa tài khoản sẽ sớm được triển khai.",
    "theme.light": "Sáng",
    "theme.dark": "Tối",
    "theme.system": "Theo hệ thống",
    "theme.current": "Chủ đề hiện tại",
    "theme.changed": "Đã thay đổi chủ đề",
    "language.vi": "Tiếng Việt",
    "language.en": "English",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.current": "Ngôn ngữ hiện tại",
    "language.changed": "Đã thay đổi ngôn ngữ",
    
    // Notifications
    "notifications.title": "Thông báo",
    "notifications.email.title": "Thông báo Email",
    "notifications.email.description": "Quản lý các thông báo được gửi qua email",
    "notifications.email.enable": "Thông báo qua Email",
    "notifications.email.enable.desc": "Nhận thông báo quan trọng qua email",
    "notifications.order.updates": "Cập nhật đơn hàng",
    "notifications.order.updates.desc": "Thông báo về trạng thái đơn hàng của bạn",
    "notifications.promotional": "Email khuyến mãi",
    "notifications.promotional.desc": "Nhận thông tin về ưu đãi và sản phẩm mới",
    "notifications.security": "Cảnh báo bảo mật",
    "notifications.security.desc": "Thông báo về các hoạt động bảo mật quan trọng",
    "notifications.push.title": "Thông báo Push",
    "notifications.push.description": "Nhận thông báo trực tiếp trên thiết bị của bạn",
    "notifications.push.enable": "Bật thông báo Push",
    "notifications.push.enable.desc": "Cho phép gửi thông báo đến trình duyệt của bạn",
    
    // Appearance
    "appearance.title": "Giao diện",
    "appearance.description": "Tùy chỉnh giao diện và trải nghiệm của bạn",
    "appearance.theme": "Chủ đề",
    "appearance.language": "Ngôn ngữ",
    "appearance.compact": "Chế độ compact",
    "appearance.compact.desc": "Hiển thị nhiều nội dung hơn trên màn hình",
    
    // Privacy
    "privacy.title": "Quyền riêng tư",
    "privacy.description": "Kiểm soát thông tin cá nhân của bạn",
    "privacy.profile": "Hiển thị hồ sơ",
    "privacy.profile.desc": "Ai có thể xem hồ sơ của bạn",
    "privacy.profile.public": "Công khai",
    "privacy.profile.public.badge": "Mọi người",
    "privacy.profile.friends": "Bạn bè",
    "privacy.profile.friends.badge": "Chỉ bạn bè",
    "privacy.profile.private": "Riêng tư",
    "privacy.profile.private.badge": "Chỉ mình tôi",
    "privacy.email": "Hiển thị Email",
    "privacy.email.desc": "Cho phép người khác xem email của bạn",
    "privacy.phone": "Hiển thị Số điện thoại",
    "privacy.phone.desc": "Cho phép người khác xem số điện thoại của bạn",
    "privacy.data.sharing": "Chia sẻ dữ liệu",
    "privacy.data.sharing.desc": "Cho phép chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ",
    "privacy.analytics": "Phân tích sử dụng",
    "privacy.analytics.desc": "Thu thập dữ liệu để phân tích và cải thiện trải nghiệm",
    
    // Account
    "account.title": "Tài khoản",
    "account.data.title": "Quản lý dữ liệu",
    "account.data.description": "Xuất hoặc xóa dữ liệu tài khoản của bạn",
    "account.export": "Xuất dữ liệu",
    "account.export.label": "Xuất dữ liệu",
    "account.export.desc": "Tải xuống tất cả dữ liệu tài khoản của bạn",
    "account.delete": "Xóa tài khoản",
    "account.delete.label": "Xóa tài khoản",
    "account.delete.desc": "Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.",
    "account.delete.confirm": "Tôi hiểu rằng hành động này không thể hoàn tác",
  },
  en: {
    // Common UI
    "common.search": "Search...",
    "common.login": "Login",
    "common.register": "Register",
    "common.logout": "Logout",
    "common.profile": "Profile",
    "common.cart": "Cart",
    "common.settings": "Settings",
    "common.admin": "Admin",
    "common.home": "Home",
    "common.about": "About",
    "common.blog": "Blog",
    "common.contact": "Contact",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.view": "View",
    "common.close": "Close",
    
    // Header
    "header.slogan": "Care - Love",
    "header.search.placeholder": "Search...",
    
    // Navigation
    "nav.home": "Home",
    "nav.pets": "Pets",
    "nav.pet.products": "Pet Products",
    "nav.food": "Food",
    "nav.accessories": "Accessories",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.contact": "Contact",
    
    // Products
    "product.view.details": "View details",
    "product.add.to.cart": "Add to cart",
    "product.price": "Price",
    "product.category": "Category",
    "product.description": "Description",
    "product.reviews": "Reviews",
    "product.stock": "Stock",
    "product.in.stock": "In stock",
    "product.out.of.stock": "Out of stock",
    
    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.continue.shopping": "Continue shopping",
    "cart.remove": "Remove",
    "cart.quantity": "Quantity",
    
    // Auth
    "auth.login.title": "Login",
    "auth.register.title": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirm.password": "Confirm password",
    "auth.forgot.password": "Forgot password?",
    "auth.no.account": "Don't have an account?",
    "auth.have.account": "Already have an account?",
    "auth.login.success": "Login successful",
    "auth.register.success": "Registration successful",
    "auth.logout.success": "Logout successful",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account settings and preferences",
    "settings.save": "Save all changes",
    "settings.saved": "Settings saved",
    "settings.saved.description": "All changes have been saved successfully.",
    "settings.data.export.success": "Data exported",
    "settings.data.export.description": "Your settings have been downloaded.",
    "settings.delete.title": "Feature in development",
    "settings.delete.description": "Account deletion feature will be available soon.",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "theme.current": "Current theme",
    "theme.changed": "Theme changed",
    "language.vi": "Tiếng Việt",
    "language.en": "English",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.current": "Current language",
    "language.changed": "Language changed",
    
    // Notifications
    "notifications.title": "Notifications",
    "notifications.email.title": "Email Notifications",
    "notifications.email.description": "Manage notifications sent via email",
    "notifications.email.enable": "Email Notifications",
    "notifications.email.enable.desc": "Receive important notifications via email",
    "notifications.order.updates": "Order updates",
    "notifications.order.updates.desc": "Notifications about your order status",
    "notifications.promotional": "Promotional emails",
    "notifications.promotional.desc": "Receive information about deals and new products",
    "notifications.security": "Security alerts",
    "notifications.security.desc": "Notifications about important security activities",
    "notifications.push.title": "Push Notifications",
    "notifications.push.description": "Receive notifications directly on your device",
    "notifications.push.enable": "Enable Push notifications",
    "notifications.push.enable.desc": "Allow sending notifications to your browser",
    
    // Appearance
    "appearance.title": "Appearance",
    "appearance.description": "Customize your interface and experience",
    "appearance.theme": "Theme",
    "appearance.language": "Language",
    "appearance.compact": "Compact mode",
    "appearance.compact.desc": "Display more content on screen",
    
    // Privacy
    "privacy.title": "Privacy",
    "privacy.description": "Control your personal information",
    "privacy.profile": "Profile visibility",
    "privacy.profile.desc": "Who can see your profile",
    "privacy.profile.public": "Public",
    "privacy.profile.public.badge": "Everyone",
    "privacy.profile.friends": "Friends",
    "privacy.profile.friends.badge": "Friends only",
    "privacy.profile.private": "Private",
    "privacy.profile.private.badge": "Only me",
    "privacy.email": "Show Email",
    "privacy.email.desc": "Allow others to see your email",
    "privacy.phone": "Show Phone",
    "privacy.phone.desc": "Allow others to see your phone number",
    "privacy.data.sharing": "Data sharing",
    "privacy.data.sharing.desc": "Allow sharing anonymous data to improve service",
    "privacy.analytics": "Usage analytics",
    "privacy.analytics.desc": "Collect data for analysis and experience improvement",
    
    // Account
    "account.title": "Account",
    "account.data.title": "Data management",
    "account.data.description": "Export or delete your account data",
    "account.export": "Export data",
    "account.export.label": "Export data",
    "account.export.desc": "Download all your account data",
    "account.delete": "Delete account",
    "account.delete.label": "Delete account",
    "account.delete.desc": "Permanently delete your account and all data. This action cannot be undone.",
    "account.delete.confirm": "I understand that this action cannot be undone",
  },
  zh: {
    // Common UI
    "common.search": "搜索...",
    "common.login": "登录",
    "common.register": "注册",
    "common.logout": "登出",
    "common.profile": "个人资料",
    "common.cart": "购物车",
    "common.settings": "设置",
    "common.admin": "管理员",
    "common.home": "首页",
    "common.about": "关于",
    "common.blog": "博客",
    "common.contact": "联系",
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",
    "common.cancel": "取消",
    "common.save": "保存",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.add": "添加",
    "common.view": "查看",
    "common.close": "关闭",
    
    // Header
    "header.slogan": "关爱 - 爱心",
    "header.search.placeholder": "搜索...",
    
    // Navigation
    "nav.home": "首页",
    "nav.pets": "宠物",
    "nav.pet.products": "宠物产品",
    "nav.food": "食品",
    "nav.accessories": "配件",
    "nav.blog": "博客",
    "nav.about": "关于",
    "nav.contact": "联系",
    
    // Products
    "product.view.details": "查看详情",
    "product.add.to.cart": "加入购物车",
    "product.price": "价格",
    "product.category": "类别",
    "product.description": "描述",
    "product.reviews": "评价",
    "product.stock": "库存",
    "product.in.stock": "有货",
    "product.out.of.stock": "缺货",
    
    // Cart
    "cart.title": "购物车",
    "cart.empty": "购物车为空",
    "cart.total": "总计",
    "cart.checkout": "结账",
    "cart.continue.shopping": "继续购物",
    "cart.remove": "移除",
    "cart.quantity": "数量",
    
    // Auth
    "auth.login.title": "登录",
    "auth.register.title": "注册",
    "auth.email": "邮箱",
    "auth.password": "密码",
    "auth.confirm.password": "确认密码",
    "auth.forgot.password": "忘记密码？",
    "auth.no.account": "还没有账户？",
    "auth.have.account": "已有账户？",
    "auth.login.success": "登录成功",
    "auth.register.success": "注册成功",
    "auth.logout.success": "登出成功",
    
    // Settings
    "settings.title": "设置",
    "settings.subtitle": "管理您的账户设置和首选项",
    "settings.save": "保存所有更改",
    "settings.saved": "设置已保存",
    "settings.saved.description": "所有更改已成功保存。",
    "settings.data.export.success": "数据已导出",
    "settings.data.export.description": "您的设置已下载。",
    "settings.delete.title": "功能开发中",
    "settings.delete.description": "删除账户功能即将推出。",
    "theme.light": "浅色",
    "theme.dark": "深色",
    "theme.system": "系统",
    "theme.current": "当前主题",
    "theme.changed": "主题已更改",
    "language.vi": "Tiếng Việt",
    "language.en": "English",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.current": "当前语言",
    "language.changed": "语言已更改",
    
    // Notifications
    "notifications.title": "通知",
    "notifications.email.title": "电子邮件通知",
    "notifications.email.description": "管理通过电子邮件发送的通知",
    "notifications.email.enable": "电子邮件通知",
    "notifications.email.enable.desc": "通过电子邮件接收重要通知",
    "notifications.order.updates": "订单更新",
    "notifications.order.updates.desc": "关于您的订单状态的通知",
    "notifications.promotional": "促销邮件",
    "notifications.promotional.desc": "接收优惠和新产品信息",
    "notifications.security": "安全警报",
    "notifications.security.desc": "关于重要安全活动的通知",
    "notifications.push.title": "推送通知",
    "notifications.push.description": "直接在您的设备上接收通知",
    "notifications.push.enable": "启用推送通知",
    "notifications.push.enable.desc": "允许向浏览器发送通知",
    
    // Appearance
    "appearance.title": "外观",
    "appearance.description": "自定义您的界面和体验",
    "appearance.theme": "主题",
    "appearance.language": "语言",
    "appearance.compact": "紧凑模式",
    "appearance.compact.desc": "在屏幕上显示更多内容",
    
    // Privacy
    "privacy.title": "隐私",
    "privacy.description": "控制您的个人信息",
    "privacy.profile": "个人资料可见性",
    "privacy.profile.desc": "谁可以查看您的个人资料",
    "privacy.profile.public": "公开",
    "privacy.profile.public.badge": "所有人",
    "privacy.profile.friends": "朋友",
    "privacy.profile.friends.badge": "仅朋友",
    "privacy.profile.private": "私密",
    "privacy.profile.private.badge": "仅我",
    "privacy.email": "显示电子邮件",
    "privacy.email.desc": "允许他人查看您的电子邮件",
    "privacy.phone": "显示电话",
    "privacy.phone.desc": "允许他人查看您的电话号码",
    "privacy.data.sharing": "数据共享",
    "privacy.data.sharing.desc": "允许共享匿名数据以改善服务",
    "privacy.analytics": "使用分析",
    "privacy.analytics.desc": "收集数据以进行分析和改善体验",
    
    // Account
    "account.title": "账户",
    "account.data.title": "数据管理",
    "account.data.description": "导出或删除您的账户数据",
    "account.export": "导出数据",
    "account.export.label": "导出数据",
    "account.export.desc": "下载您的所有账户数据",
    "account.delete": "删除账户",
    "account.delete.label": "删除账户",
    "account.delete.desc": "永久删除您的账户和所有数据。此操作无法撤销。",
    "account.delete.confirm": "我明白此操作无法撤销",
  },
  ja: {
    // Common UI
    "common.search": "検索...",
    "common.login": "ログイン",
    "common.register": "登録",
    "common.logout": "ログアウト",
    "common.profile": "プロフィール",
    "common.cart": "カート",
    "common.settings": "設定",
    "common.admin": "管理者",
    "common.home": "ホーム",
    "common.about": "について",
    "common.blog": "ブログ",
    "common.contact": "お問い合わせ",
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.cancel": "キャンセル",
    "common.save": "保存",
    "common.delete": "削除",
    "common.edit": "編集",
    "common.add": "追加",
    "common.view": "表示",
    "common.close": "閉じる",
    
    // Header
    "header.slogan": "ケア - 愛",
    "header.search.placeholder": "検索...",
    
    // Navigation
    "nav.home": "ホーム",
    "nav.pets": "ペット",
    "nav.pet.products": "ペット用品",
    "nav.food": "フード",
    "nav.accessories": "アクセサリー",
    "nav.blog": "ブログ",
    "nav.about": "について",
    "nav.contact": "お問い合わせ",
    
    // Products
    "product.view.details": "詳細を見る",
    "product.add.to.cart": "カートに追加",
    "product.price": "価格",
    "product.category": "カテゴリー",
    "product.description": "説明",
    "product.reviews": "レビュー",
    "product.stock": "在庫",
    "product.in.stock": "在庫あり",
    "product.out.of.stock": "在庫切れ",
    
    // Cart
    "cart.title": "ショッピングカート",
    "cart.empty": "カートは空です",
    "cart.total": "合計",
    "cart.checkout": "チェックアウト",
    "cart.continue.shopping": "買い物を続ける",
    "cart.remove": "削除",
    "cart.quantity": "数量",
    
    // Auth
    "auth.login.title": "ログイン",
    "auth.register.title": "登録",
    "auth.email": "メール",
    "auth.password": "パスワード",
    "auth.confirm.password": "パスワード確認",
    "auth.forgot.password": "パスワードを忘れた？",
    "auth.no.account": "アカウントをお持ちでない？",
    "auth.have.account": "すでにアカウントをお持ちですか？",
    "auth.login.success": "ログイン成功",
    "auth.register.success": "登録成功",
    "auth.logout.success": "ログアウト成功",
    
    // Settings
    "settings.title": "設定",
    "settings.subtitle": "アカウント設定と設定を管理",
    "settings.save": "すべての変更を保存",
    "settings.saved": "設定が保存されました",
    "settings.saved.description": "すべての変更が正常に保存されました。",
    "settings.data.export.success": "データがエクスポートされました",
    "settings.data.export.description": "設定がダウンロードされました。",
    "settings.delete.title": "機能開発中",
    "settings.delete.description": "アカウント削除機能は間もなく利用可能になります。",
    "theme.light": "ライト",
    "theme.dark": "ダーク",
    "theme.system": "システム",
    "theme.current": "現在のテーマ",
    "theme.changed": "テーマが変更されました",
    "language.vi": "Tiếng Việt",
    "language.en": "English",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.current": "現在の言語",
    "language.changed": "言語が変更されました",
    
    // Notifications
    "notifications.title": "通知",
    "notifications.email.title": "メール通知",
    "notifications.email.description": "メールで送信される通知を管理",
    "notifications.email.enable": "メール通知",
    "notifications.email.enable.desc": "メールで重要な通知を受け取る",
    "notifications.order.updates": "注文更新",
    "notifications.order.updates.desc": "注文ステータスに関する通知",
    "notifications.promotional": "プロモーションメール",
    "notifications.promotional.desc": "お得情報や新製品情報を受け取る",
    "notifications.security": "セキュリティアラート",
    "notifications.security.desc": "重要なセキュリティ活動に関する通知",
    "notifications.push.title": "プッシュ通知",
    "notifications.push.description": "デバイスで直接通知を受信",
    "notifications.push.enable": "プッシュ通知を有効にする",
    "notifications.push.enable.desc": "ブラウザへの通知送信を許可",
    
    // Appearance
    "appearance.title": "外観",
    "appearance.description": "インターフェースと体験をカスタマイズ",
    "appearance.theme": "テーマ",
    "appearance.language": "言語",
    "appearance.compact": "コンパクトモード",
    "appearance.compact.desc": "画面により多くのコンテンツを表示",
    
    // Privacy
    "privacy.title": "プライバシー",
    "privacy.description": "個人情報を制御",
    "privacy.profile": "プロフィールの表示",
    "privacy.profile.desc": "プロフィールを表示できる人",
    "privacy.profile.public": "公開",
    "privacy.profile.public.badge": "すべての人",
    "privacy.profile.friends": "友達",
    "privacy.profile.friends.badge": "友達のみ",
    "privacy.profile.private": "非公開",
    "privacy.profile.private.badge": "自分のみ",
    "privacy.email": "メールを表示",
    "privacy.email.desc": "他の人にメールを表示することを許可",
    "privacy.phone": "電話を表示",
    "privacy.phone.desc": "他の人に電話番号を表示することを許可",
    "privacy.data.sharing": "データ共有",
    "privacy.data.sharing.desc": "サービス改善のために匿名データの共有を許可",
    "privacy.analytics": "使用分析",
    "privacy.analytics.desc": "分析と体験改善のためにデータを収集",
    
    // Account
    "account.title": "アカウント",
    "account.data.title": "データ管理",
    "account.data.description": "アカウントデータをエクスポートまたは削除",
    "account.export": "データをエクスポート",
    "account.export.label": "データをエクスポート",
    "account.export.desc": "すべてのアカウントデータをダウンロード",
    "account.delete": "アカウントを削除",
    "account.delete.label": "アカウントを削除",
    "account.delete.desc": "アカウントとすべてのデータを完全に削除します。この操作は元に戻せません。",
    "account.delete.confirm": "この操作は元に戻せないことを理解しています",
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
    // Clear cache khi đổi ngôn ngữ
    translationCache.clear();
  };

  // Async translation sử dụng Google Translate API
  const t = async (key: string, fallback?: string): Promise<string> => {
    // Nếu ngôn ngữ hiện tại là tiếng Việt, trả về key gốc
    if (language === "vi") {
      return fallback || key;
    }

    const cacheKey = `${key}_${language}`;
    
    // Kiểm tra cache trước
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // Thử dùng fallback dictionary nếu có
    const fallbackText = fallbackTranslations[language]?.[key];
    if (fallbackText) {
      translationCache.set(cacheKey, fallbackText);
      return fallbackText;
    }

    try {
      // Gọi API Google Translate
      const textToTranslate = fallback || key;
      const translated = await translationService.translate(textToTranslate, "vi", language);
      
      // Lưu vào cache
      translationCache.set(cacheKey, translated);
      
      return translated;
    } catch (error) {
      console.error(`Translation error for "${key}":`, error);
      // Fallback về text gốc nếu có lỗi
      return fallback || key;
    }
  };

  // Sync translation - chỉ dùng fallback dictionary (không gọi API)
  const tSync = (key: string): string => {
    return fallbackTranslations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tSync }}>
      {children}
    </LanguageContext.Provider>
  );
};

