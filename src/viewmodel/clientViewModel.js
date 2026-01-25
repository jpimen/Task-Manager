/**
 * Client ViewModel - MVVM Architecture (Admin-Client System)
 * 
 * The Client ViewModel handles all client-specific business logic:
 * - Viewing tasks assigned to the current client
 * - Marking tasks as completed/pending
 * - Viewing task details
 * - Filtering and searching assigned tasks
 * 
 * It implements the Observer pattern to notify the Client View of changes.
 * IMPORTANT: Clients can only see and interact with tasks assigned to them.
 */

import { Task, TaskList, TaskStatus } from '../model/taskModel.js';
import { StorageService } from '../services/storageService.js';
import { authService } from '../services/authService.js';

/**
 * ClientViewModel class - Handles client-specific application logic
 */
export class ClientViewModel {
    constructor() {
        // Model instance - the ViewModel manages the Model
        this.taskList = new TaskList();

        // Current filter and search state
        this.currentFilter = 'all';
        this.currentSearch = '';

        // Subscribers array for the Observer pattern
        this.subscribers = [];

        // Load initial data from storage
        this.loadFromStorage();
    }

    // ==========================================
    // OBSERVER PATTERN - Subscribe/Notify
    // ==========================================

    /**
     * Subscribes a callback function to receive updates
     * @param {Function} callback - Function to call when data changes
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    /**
     * Unsubscribes a callback function
     * @param {Function} callback - Function to remove from subscribers
     */
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    /**
     * Notifies all subscribers that data has changed
     */
    notify() {
        const data = this.getViewData();
        this.subscribers.forEach(callback => callback(data));
    }

    // ==========================================
    // DATA RETRIEVAL - For View consumption
    // ==========================================

    /**
     * Gets all data needed by the Client View
     * IMPORTANT: Only returns tasks assigned to the current client
     * @returns {Object} View data including assigned tasks and counts
     */
    getViewData() {
        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
            return {
                tasks: [],
                counts: { total: 0, pending: 0, completed: 0 },
                currentFilter: this.currentFilter,
                currentSearch: this.currentSearch,
                currentUser: null
            };
        }

        // Get only tasks assigned to the current client
        let tasks = this.taskList.getTasksByClient(currentUser.id);

        // Apply status filter
        if (this.currentFilter !== 'all') {
            tasks = tasks.filter(t => t.status === this.currentFilter);
        }

        // Apply search
        if (this.currentSearch) {
            const query = this.currentSearch.toLowerCase();
            tasks = tasks.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        // Sort by due date (earliest first), then by priority
        tasks.sort((a, b) => {
            // Overdue tasks first
            if (a.isOverdue() && !b.isOverdue()) return -1;
            if (!a.isOverdue() && b.isOverdue()) return 1;

            // Then by due date
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;

            // Then by creation date
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Calculate counts for assigned tasks only
        const allAssignedTasks = this.taskList.getTasksByClient(currentUser.id);
        const counts = {
            total: allAssignedTasks.length,
            pending: allAssignedTasks.filter(t => t.status === TaskStatus.PENDING).length,
            inProgress: allAssignedTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
            completed: allAssignedTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
            overdue: allAssignedTasks.filter(t => t.isOverdue()).length
        };

        return {
            tasks: tasks,
            counts: counts,
            currentFilter: this.currentFilter,
            currentSearch: this.currentSearch,
            currentUser: currentUser
        };
    }

    // ==========================================
    // TASK COMMANDS - Client Actions
    // ==========================================

    /**
     * Toggles task status between pending and completed
     * Clients can only toggle status of tasks assigned to them
     * @param {string} taskId - ID of task to toggle
     * @returns {boolean} True if successful
     */
    toggleTaskStatus(taskId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return false;

        const task = this.taskList.getTaskById(taskId);

        if (!task) {
            console.warn(`Task not found: ${taskId}`);
            return false;
        }

        // Verify task is assigned to current client
        if (task.assignedClientId !== currentUser.id) {
            console.warn('Cannot modify task not assigned to you');
            return false;
        }

        task.toggleStatus();
        this.saveToStorage();
        this.notify();

        console.log(`🔄 Task "${task.title}" status changed to ${task.status}`);
        return true;
    }

    /**
     * Sets task status (for more granular control)
     * @param {string} taskId - ID of task to update
     * @param {string} status - New status
     * @returns {boolean} True if successful
     */
    setTaskStatus(taskId, status) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return false;

        const task = this.taskList.getTaskById(taskId);

        if (!task) return false;

        // Verify task is assigned to current client
        if (task.assignedClientId !== currentUser.id) {
            console.warn('Cannot modify task not assigned to you');
            return false;
        }

        task.setStatus(status);
        this.saveToStorage();
        this.notify();

        return true;
    }

    /**
     * Gets a single task by ID (only if assigned to current client)
     * @param {string} taskId - ID of task to get
     * @returns {Task|null} The task or null if not found/not assigned
     */
    getTask(taskId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return null;

        const task = this.taskList.getTaskById(taskId);

        // Only return if assigned to current client
        if (task && task.assignedClientId === currentUser.id) {
            return task;
        }

        return null;
    }

    /**
     * Gets task details formatted for display
     * @param {string} taskId - ID of task to get details for
     * @returns {Object|null} Task details or null
     */
    getTaskDetails(taskId) {
        const task = this.getTask(taskId);

        if (!task) return null;

        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            isOverdue: task.isOverdue(),
            isCompleted: task.isCompleted()
        };
    }

    // ==========================================
    // FILTER AND SEARCH
    // ==========================================

    /**
     * Sets the status filter
     * @param {string} filter - Filter value ('all', 'pending', 'completed', etc.)
     */
    setStatusFilter(filter) {
        this.currentFilter = filter;
        this.notify();
    }

    /**
     * Sets the search query
     * @param {string} query - Search query
     */
    setSearch(query) {
        this.currentSearch = query;
        this.notify();
    }

    /**
     * Clears all filters
     */
    clearFilters() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.notify();
    }

    // ==========================================
    // PERSISTENCE
    // ==========================================

    /**
     * Saves tasks to localStorage
     */
    saveToStorage() {
        StorageService.saveTasks(this.taskList.toArray());
    }

    /**
     * Loads tasks from localStorage
     */
    loadFromStorage() {
        const tasksArray = StorageService.loadTasks();
        this.taskList.loadFromArray(tasksArray);
    }

    /**
     * Refreshes data from storage
     */
    refresh() {
        this.loadFromStorage();
        this.notify();
    }

    // ==========================================
    // NOTIFICATIONS (Visual Only)
    // ==========================================

    /**
     * Gets notification data for the client
     * @returns {Object} Notification data
     */
    getNotifications() {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return { unread: 0, items: [] };

        const tasks = this.taskList.getTasksByClient(currentUser.id);
        const notifications = [];

        // Overdue tasks
        const overdueTasks = tasks.filter(t => t.isOverdue());
        overdueTasks.forEach(task => {
            notifications.push({
                type: 'overdue',
                message: `Task "${task.title}" is overdue!`,
                taskId: task.id,
                priority: 'high'
            });
        });

        // Tasks due today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueTodayTasks = tasks.filter(t => {
            if (!t.dueDate || t.isCompleted()) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate >= today && dueDate < tomorrow;
        });

        dueTodayTasks.forEach(task => {
            notifications.push({
                type: 'due_today',
                message: `Task "${task.title}" is due today!`,
                taskId: task.id,
                priority: 'medium'
            });
        });

        return {
            unread: notifications.length,
            items: notifications
        };
    }
}
