/**
 * Admin ViewModel - MVVM Architecture (Admin-Client System)
 * 
 * The Admin ViewModel handles all admin-specific business logic:
 * - Creating, editing, and deleting tasks
 * - Assigning tasks to clients
 * - Viewing all tasks and statistics
 * - Managing task state
 * 
 * It implements the Observer pattern to notify the Admin View of changes.
 */

import { Task, TaskList, TaskStatus, TaskPriority } from '../model/taskModel.js';
import { StorageService } from '../services/storageService.js';
import { authService } from '../services/authService.js';

/**
 * AdminViewModel class - Handles admin-specific application logic
 */
export class AdminViewModel {
    constructor() {
        // Model instance - the ViewModel manages the Model
        this.taskList = new TaskList();

        // Current filter and search state
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentClientFilter = 'all';

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
     * Gets all data needed by the Admin View
     * @returns {Object} View data including tasks, counts, filters, and clients
     */
    getViewData() {
        let tasks = this.taskList.getAllTasks();

        // Apply client filter
        if (this.currentClientFilter !== 'all') {
            if (this.currentClientFilter === 'unassigned') {
                tasks = tasks.filter(t => !t.assignedClientId);
            } else {
                tasks = tasks.filter(t => t.assignedClientId === this.currentClientFilter);
            }
        }

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

        // Sort by creation date (newest first)
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            tasks: tasks,
            statistics: this.taskList.getStatistics(),
            clients: authService.getClients(),
            currentFilter: this.currentFilter,
            currentClientFilter: this.currentClientFilter,
            currentSearch: this.currentSearch,
            currentUser: authService.getCurrentUser()
        };
    }

    // ==========================================
    // TASK COMMANDS - Admin Actions
    // ==========================================

    /**
     * Creates a new task
     * @param {Object} taskData - Task data from the form
     * @returns {boolean} True if successful
     */
    createTask(taskData) {
        if (!taskData.title || !taskData.title.trim()) {
            console.warn('Task title is required');
            return false;
        }

        const currentUser = authService.getCurrentUser();

        const task = new Task({
            id: this.generateId(),
            title: taskData.title.trim(),
            description: taskData.description?.trim() || '',
            status: TaskStatus.PENDING,
            assignedClientId: taskData.assignedClientId || null,
            createdBy: currentUser?.id || null,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            priority: taskData.priority || TaskPriority.MEDIUM
        });

        this.taskList.addTask(task);
        this.saveToStorage();
        this.notify();

        console.log(`✅ Task created: ${task.title}`);
        return true;
    }

    /**
     * Updates an existing task
     * @param {string} taskId - ID of task to update
     * @param {Object} updates - Object with properties to update
     * @returns {boolean} True if successful
     */
    updateTask(taskId, updates) {
        const task = this.taskList.getTaskById(taskId);

        if (!task) {
            console.warn(`Task not found: ${taskId}`);
            return false;
        }

        // Convert dueDate string to Date if provided
        if (updates.dueDate) {
            updates.dueDate = new Date(updates.dueDate);
        }

        task.update(updates);
        this.saveToStorage();
        this.notify();

        console.log(`✏️ Task updated: ${task.title}`);
        return true;
    }

    /**
     * Deletes a task
     * @param {string} taskId - ID of task to delete
     * @returns {boolean} True if successful
     */
    deleteTask(taskId) {
        const task = this.taskList.getTaskById(taskId);
        const removed = this.taskList.removeTask(taskId);

        if (removed) {
            this.saveToStorage();
            this.notify();
            console.log(`🗑️ Task deleted: ${task?.title}`);
        }

        return removed;
    }

    /**
     * Assigns a task to a client
     * @param {string} taskId - ID of task to assign
     * @param {string} clientId - ID of client to assign to (null to unassign)
     * @returns {boolean} True if successful
     */
    assignTask(taskId, clientId) {
        const task = this.taskList.getTaskById(taskId);

        if (!task) {
            console.warn(`Task not found: ${taskId}`);
            return false;
        }

        if (clientId) {
            const client = authService.getUserById(clientId);
            if (!client) {
                console.warn(`Client not found: ${clientId}`);
                return false;
            }
            task.assignTo(clientId);
            console.log(`📋 Task "${task.title}" assigned to ${client.name}`);
        } else {
            task.unassign();
            console.log(`📋 Task "${task.title}" unassigned`);
        }

        this.saveToStorage();
        this.notify();
        return true;
    }

    /**
     * Changes task status
     * @param {string} taskId - ID of task to update
     * @param {string} status - New status
     * @returns {boolean} True if successful
     */
    setTaskStatus(taskId, status) {
        const task = this.taskList.getTaskById(taskId);

        if (!task) return false;

        task.setStatus(status);
        this.saveToStorage();
        this.notify();

        return true;
    }

    /**
     * Gets a single task by ID
     * @param {string} taskId - ID of task to get
     * @returns {Task|undefined} The task or undefined
     */
    getTask(taskId) {
        return this.taskList.getTaskById(taskId);
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
     * Sets the client filter
     * @param {string} clientId - Client ID or 'all' or 'unassigned'
     */
    setClientFilter(clientId) {
        this.currentClientFilter = clientId;
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
        this.currentClientFilter = 'all';
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
    // UTILITY
    // ==========================================

    /**
     * Generates a unique task ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Gets client name by ID
     * @param {string} clientId - Client ID
     * @returns {string} Client name or 'Unassigned'
     */
    getClientName(clientId) {
        if (!clientId) return 'Unassigned';
        const client = authService.getUserById(clientId);
        return client?.name || 'Unknown';
    }
}
