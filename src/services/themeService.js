/**
 * Theme Service - Dark/Light Mode Toggle
 * 
 * Manages theme state with localStorage persistence.
 * Follows the Observer pattern for theme change notifications.
 */

const STORAGE_KEY = 'mvvm_task_manager_theme';

export const Theme = {
    DARK: 'dark',
    LIGHT: 'light'
};

class ThemeService {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.subscribers = [];
        this.applyTheme(this.currentTheme);
    }

    /**
     * Subscribes to theme changes
     * @param {Function} callback - Function to call when theme changes
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    /**
     * Notifies all subscribers of theme change
     */
    notify() {
        this.subscribers.forEach(callback => callback(this.currentTheme));
    }

    /**
     * Gets the current theme
     * @returns {string} Current theme ('dark' or 'light')
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Toggles between dark and light theme
     */
    toggle() {
        this.currentTheme = this.currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        this.applyTheme(this.currentTheme);
        this.saveTheme(this.currentTheme);
        this.notify();
    }

    /**
     * Sets a specific theme
     * @param {string} theme - Theme to set
     */
    setTheme(theme) {
        if (Object.values(Theme).includes(theme)) {
            this.currentTheme = theme;
            this.applyTheme(this.currentTheme);
            this.saveTheme(this.currentTheme);
            this.notify();
        }
    }

    /**
     * Applies theme to the document
     * @param {string} theme - Theme to apply
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === Theme.DARK ? '#1a1d2e' : '#ffffff');
        }
    }

    /**
     * Loads theme from localStorage
     * @returns {string} Saved theme or default (dark)
     */
    loadTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && Object.values(Theme).includes(saved)) {
                return saved;
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
        return Theme.DARK; // Default theme
    }

    /**
     * Saves theme to localStorage
     * @param {string} theme - Theme to save
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    /**
     * Checks if current theme is dark
     * @returns {boolean} True if dark theme
     */
    isDark() {
        return this.currentTheme === Theme.DARK;
    }
}

// Export singleton instance
export const themeService = new ThemeService();
