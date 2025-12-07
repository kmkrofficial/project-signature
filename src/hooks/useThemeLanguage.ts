import { useTheme } from "@/components/layout/ThemeProvider";

export const useThemeLanguage = () => {
    const { theme } = useTheme();

    const isDark = theme === "deepSystem";

    return {
        nav: {
            blog: isDark ? "System Logs" : "Eng Blog",
            home: isDark ? "Core" : "Home",
            skills: isDark ? "Skills" : "Expertise",
            experience: isDark ? "Logs" : "Experience",
            projects: isDark ? "Modules" : "Projects",
            achievements: isDark ? "Kernel Training" : "Education",
        },
        blog: {
            title: isDark ? "System Logs" : "Engineering Blog",
            subtitle: isDark ? "RESEARCH LAB // DOCUMENTATION" : "ENGINEERING TEAM // INSIGHTS",
            searchPlaceholder: isDark ? "Search logs..." : "Search articles...",
            readTime: isDark ? "Process Time" : "Read Time",
            category: isDark ? "Protocol" : "Category",
            backToLogs: isDark ? "Return to System Logs" : "Back to Blog",
            loading: isDark ? "Decrypting..." : "Loading...",
            notFound: isDark ? "404 // DATA CORRUPTED" : "404 // Page Not Found",
        },
        admin: {
            title: isDark ? "Mainframe Access" : "Admin Dashboard",
            createPost: isDark ? "Initialize Protocol" : "Create Post",
            editPost: isDark ? "Modify Protocol" : "Edit Post",
        }
    };
};
