/**
 * Storage Service - MVVM Architecture (Admin-Client System)
 * 
 * The Service layer handles data persistence using localStorage.
 * It abstracts the storage mechanism from the rest of the application,
 * making it easy to switch to a different storage solution in the future.
 * 
 * This enhanced version handles:
 * - Task storage
 * - User storage
 * - Current session storage
 */

const STORAGE_KEYS = {
    TASKS: 'mvvm_admin_client_tasks',
    USERS: 'mvvm_admin_client_users',
    CURRENT_USER: 'mvvm_admin_client_current_user',
    CATEGORIES: 'mvvm_admin_client_categories',
    ACTIVITIES: 'mvvm_admin_client_activities',
    SUBTASKS: 'mvvm_admin_client_subtasks'
};

/**
 * StorageService class - Handles localStorage operations
 * Provides methods for saving and loading tasks/users from browser storage
 */
export class StorageService {

    // ==========================================
    // TASK STORAGE
    // ==========================================

    /**
     * Saves tasks to localStorage
     * @param {Object[]} tasks - Array of task objects to save
     * @returns {boolean} True if successful
     */
    static saveTasks(tasks) {
        try {
            const serialized = JSON.stringify(tasks);
            localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
            return true;
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads tasks from localStorage
     * @returns {Object[]} Array of task objects, or empty array if none found
     */
    static loadTasks() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.TASKS);
            if (serialized === null) {
                return [];
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            return [];
        }
    }

    /**
     * Clears all tasks from localStorage
     * @returns {boolean} True if successful
     */
    static clearTasks() {
        try {
            localStorage.removeItem(STORAGE_KEYS.TASKS);
            return true;
        } catch (error) {
            console.error('Error clearing tasks from localStorage:', error);
            return false;
        }
    }

    // ==========================================
    // USER STORAGE
    // ==========================================

    /**
     * Saves users to localStorage
     * @param {Object[]} users - Array of user objects to save
     * @returns {boolean} True if successful
     */
    static saveUsers(users) {
        try {
            const serialized = JSON.stringify(users);
            localStorage.setItem(STORAGE_KEYS.USERS, serialized);
            return true;
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads users from localStorage
     * @returns {Object[]} Array of user objects, or empty array if none found
     */
    static loadUsers() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.USERS);
            if (serialized === null) {
                return [];
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading users from localStorage:', error);
            return [];
        }
    }

    /**
     * Clears all users from localStorage
     * @returns {boolean} True if successful
     */
    static clearUsers() {
        try {
            localStorage.removeItem(STORAGE_KEYS.USERS);
            return true;
        } catch (error) {
            console.error('Error clearing users from localStorage:', error);
            return false;
        }
    }

    // ==========================================
    // SESSION STORAGE (Current User)
    // ==========================================

    /**
     * Saves current user session to localStorage
     * @param {Object} user - User object to save as current session
     * @returns {boolean} True if successful
     */
    static saveCurrentUser(user) {
        try {
            if (user === null) {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            } else {
                const serialized = JSON.stringify(user);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, serialized);
            }
            return true;
        } catch (error) {
            console.error('Error saving current user to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads current user session from localStorage
     * @returns {Object|null} Current user object, or null if not logged in
     */
    static loadCurrentUser() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (serialized === null) {
                return null;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading current user from localStorage:', error);
            return null;
        }
    }

    /**
     * Clears current user session (logout)
     * @returns {boolean} True if successful
     */
    static clearCurrentUser() {
        return this.saveCurrentUser(null);
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Clears all application data from localStorage
     * @returns {boolean} True if successful
     */
    static clearAll() {
        try {
            this.clearTasks();
            this.clearUsers();
            this.clearCurrentUser();
            return true;
        } catch (error) {
            console.error('Error clearing all data from localStorage:', error);
            return false;
        }
    }

    /**
     * Checks if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets storage usage information
     * @returns {Object} Object with storage usage details
     */
    static getStorageInfo() {
        try {
            const tasks = localStorage.getItem(STORAGE_KEYS.TASKS) || '';
            const users = localStorage.getItem(STORAGE_KEYS.USERS) || '';
            const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '';

            return {
                tasksSize: tasks.length,
                usersSize: users.length,
                currentUserSize: currentUser.length,
                totalSize: tasks.length + users.length + currentUser.length
            };
        } catch (error) {
            return null;
        }
    }

    // ==========================================
    // CATEGORY STORAGE
    // ==========================================

    /**
     * Saves categories to localStorage
     * @param {Object[]} categories - Array of category objects
     * @returns {boolean} True if successful
     */
    static saveCategories(categories) {
        try {
            const serialized = JSON.stringify(categories);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, serialized);
            return true;
        } catch (error) {
            console.error('Error saving categories to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads categories from localStorage
     * @returns {Object[]} Array of category objects
     */
    static loadCategories() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            if (serialized === null) {
                return [];
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading categories from localStorage:', error);
            return [];
        }
    }

    // ==========================================
    // ACTIVITY STORAGE
    // ==========================================

    /**
     * Saves activities to localStorage
     * @param {Object[]} activities - Array of activity objects
     * @returns {boolean} True if successful
     */
    static saveActivities(activities) {
        try {
            const serialized = JSON.stringify(activities);
            localStorage.setItem(STORAGE_KEYS.ACTIVITIES, serialized);
            return true;
        } catch (error) {
            console.error('Error saving activities to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads activities from localStorage
     * @returns {Object[]} Array of activity objects
     */
    static loadActivities() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
            if (serialized === null) {
                return [];
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading activities from localStorage:', error);
            return [];
        }
    }

    // ==========================================
    // SUBTASK STORAGE
    // ==========================================

    /**
     * Saves subtasks to localStorage
     * @param {Object[]} subtasks - Array of subtask objects
     * @returns {boolean} True if successful
     */
    static saveSubtasks(subtasks) {
        try {
            const serialized = JSON.stringify(subtasks);
            localStorage.setItem(STORAGE_KEYS.SUBTASKS, serialized);
            return true;
        } catch (error) {
            console.error('Error saving subtasks to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads subtasks from localStorage
     * @returns {Object[]} Array of subtask objects
     */
    static loadSubtasks() {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.SUBTASKS);
            if (serialized === null) {
                return [];
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error loading subtasks from localStorage:', error);
            return [];
        }
    }
}
