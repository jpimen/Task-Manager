/**
 * Task Model - MVVM Architecture (Admin-Client System)
 * 
 * The Model layer represents the data structure and business logic.
 * This enhanced version includes:
 * - Task assignment to clients
 * - Due dates and priority levels
 * - Status tracking
 * 
 * The Model is completely independent of the View - it doesn't know how
 * the data will be displayed.
 */

/**
 * Task priority levels enumeration
 */
export const TaskPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

/**
 * Task status enumeration
 */
export const TaskStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

/**
 * Task class representing a single task entity
 * Contains all properties and methods related to task data
 */
export class Task {
    /**
     * Creates a new Task instance
     * @param {Object} params - Task parameters
     * @param {string} params.id - Unique identifier for the task
     * @param {string} params.title - Task title
     * @param {string} params.description - Task description
     * @param {string} params.status - Task status (pending/in_progress/completed)
     * @param {string} params.assignedClientId - ID of the assigned client (null if unassigned)
     * @param {string} params.createdBy - ID of the admin who created the task
     * @param {Date} params.createdAt - Task creation timestamp
     * @param {Date} params.dueDate - Task due date (optional)
     * @param {string} params.priority - Task priority (low/medium/high)
     */
    constructor({
        id,
        title,
        description = '',
        status = TaskStatus.PENDING,
        assignedClientId = null,
        createdBy = null,
        createdAt = new Date(),
        dueDate = null,
        priority = TaskPriority.MEDIUM
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.assignedClientId = assignedClientId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completedAt = null;
    }

    /**
     * Toggles the task status between pending and completed
     * Business logic stays in the Model layer
     */
    toggleStatus() {
        if (this.status === TaskStatus.COMPLETED) {
            this.status = TaskStatus.PENDING;
            this.completedAt = null;
        } else {
            this.status = TaskStatus.COMPLETED;
            this.completedAt = new Date();
        }
    }

    /**
     * Sets the task status
     * @param {string} status - New status value
     */
    setStatus(status) {
        if (Object.values(TaskStatus).includes(status)) {
            this.status = status;
            if (status === TaskStatus.COMPLETED) {
                this.completedAt = new Date();
            } else {
                this.completedAt = null;
            }
        }
    }

    /**
     * Assigns the task to a client
     * @param {string} clientId - ID of the client to assign to
     */
    assignTo(clientId) {
        this.assignedClientId = clientId;
    }

    /**
     * Unassigns the task from any client
     */
    unassign() {
        this.assignedClientId = null;
    }

    /**
     * Checks if the task is assigned to a specific client
     * @param {string} clientId - Client ID to check
     * @returns {boolean} True if assigned to this client
     */
    isAssignedTo(clientId) {
        return this.assignedClientId === clientId;
    }

    /**
     * Checks if the task is completed
     * @returns {boolean} True if task is completed
     */
    isCompleted() {
        return this.status === TaskStatus.COMPLETED;
    }

    /**
     * Checks if the task is overdue
     * @returns {boolean} True if task is past due date and not completed
     */
    isOverdue() {
        if (!this.dueDate || this.isCompleted()) return false;
        return new Date(this.dueDate) < new Date();
    }

    /**
     * Updates task properties
     * @param {Object} updates - Object containing properties to update
     */
    update(updates) {
        if (updates.title !== undefined) this.title = updates.title;
        if (updates.description !== undefined) this.description = updates.description;
        if (updates.status !== undefined) this.setStatus(updates.status);
        if (updates.assignedClientId !== undefined) this.assignedClientId = updates.assignedClientId;
        if (updates.dueDate !== undefined) this.dueDate = updates.dueDate;
        if (updates.priority !== undefined) this.priority = updates.priority;
    }

    /**
     * Converts Task instance to a plain object for serialization
     * @returns {Object} Plain object representation of the task
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            assignedClientId: this.assignedClientId,
            createdBy: this.createdBy,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
            dueDate: this.dueDate ? (this.dueDate instanceof Date ? this.dueDate.toISOString() : this.dueDate) : null,
            priority: this.priority,
            completedAt: this.completedAt ? (this.completedAt instanceof Date ? this.completedAt.toISOString() : this.completedAt) : null
        };
    }

    /**
     * Creates a Task instance from a plain object
     * @param {Object} obj - Plain object with task properties
     * @returns {Task} New Task instance
     */
    static fromJSON(obj) {
        const task = new Task({
            id: obj.id,
            title: obj.title,
            description: obj.description,
            status: obj.status,
            assignedClientId: obj.assignedClientId,
            createdBy: obj.createdBy,
            createdAt: new Date(obj.createdAt),
            dueDate: obj.dueDate ? new Date(obj.dueDate) : null,
            priority: obj.priority
        });
        task.completedAt = obj.completedAt ? new Date(obj.completedAt) : null;
        return task;
    }
}

/**
 * TaskList Model - Manages a collection of tasks
 * Handles all business logic related to task collection operations
 */
export class TaskList {
    constructor() {
        this.tasks = [];
    }

    /**
     * Adds a new task to the collection
     * @param {Task} task - Task to add
     */
    addTask(task) {
        this.tasks.push(task);
    }

    /**
     * Removes a task by its ID
     * @param {string} id - ID of the task to remove
     * @returns {boolean} True if task was found and removed
     */
    removeTask(id) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        return this.tasks.length < initialLength;
    }

    /**
     * Finds a task by its ID
     * @param {string} id - ID of the task to find
     * @returns {Task|undefined} The found task or undefined
     */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    /**
     * Gets all tasks
     * @returns {Task[]} Array of all tasks
     */
    getAllTasks() {
        return [...this.tasks];
    }

    /**
     * Gets tasks assigned to a specific client
     * @param {string} clientId - Client ID to filter by
     * @returns {Task[]} Array of tasks assigned to the client
     */
    getTasksByClient(clientId) {
        return this.tasks.filter(task => task.assignedClientId === clientId);
    }

    /**
     * Gets unassigned tasks
     * @returns {Task[]} Array of unassigned tasks
     */
    getUnassignedTasks() {
        return this.tasks.filter(task => !task.assignedClientId);
    }

    /**
     * Gets tasks filtered by status
     * @param {string} status - Status to filter by
     * @returns {Task[]} Filtered array of tasks
     */
    getTasksByStatus(status) {
        if (status === 'all') return this.getAllTasks();
        return this.tasks.filter(task => task.status === status);
    }

    /**
     * Gets tasks filtered by priority
     * @param {string} priority - Priority to filter by
     * @returns {Task[]} Filtered array of tasks
     */
    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    /**
     * Gets overdue tasks
     * @returns {Task[]} Array of overdue tasks
     */
    getOverdueTasks() {
        return this.tasks.filter(task => task.isOverdue());
    }

    /**
     * Gets count of tasks by various categories
     * @returns {Object} Object with task counts
     */
    getTaskCounts() {
        return {
            total: this.tasks.length,
            pending: this.tasks.filter(t => t.status === TaskStatus.PENDING).length,
            inProgress: this.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
            completed: this.tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
            unassigned: this.tasks.filter(t => !t.assignedClientId).length,
            overdue: this.getOverdueTasks().length
        };
    }

    /**
     * Gets statistics for admin dashboard
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const counts = this.getTaskCounts();
        const completionRate = counts.total > 0
            ? Math.round((counts.completed / counts.total) * 100)
            : 0;

        return {
            ...counts,
            completionRate,
            highPriority: this.getTasksByPriority(TaskPriority.HIGH).length,
            mediumPriority: this.getTasksByPriority(TaskPriority.MEDIUM).length,
            lowPriority: this.getTasksByPriority(TaskPriority.LOW).length
        };
    }

    /**
     * Loads tasks from an array of plain objects
     * @param {Object[]} taskObjects - Array of plain task objects
     */
    loadFromArray(taskObjects) {
        this.tasks = taskObjects.map(obj => Task.fromJSON(obj));
    }

    /**
     * Converts all tasks to an array of plain objects
     * @returns {Object[]} Array of plain task objects
     */
    toArray() {
        return this.tasks.map(task => task.toJSON());
    }

    /**
     * Searches tasks by title or description
     * @param {string} query - Search query
     * @returns {Task[]} Array of matching tasks
     */
    searchTasks(query) {
        const lowerQuery = query.toLowerCase();
        return this.tasks.filter(task =>
            task.title.toLowerCase().includes(lowerQuery) ||
            task.description.toLowerCase().includes(lowerQuery)
        );
    }
}
