/**
 * Admin View - MVVM Architecture (Admin-Client System)
 * 
 * The Admin View is responsible for:
 * - Rendering the Admin Dashboard UI
 * - Capturing user interactions and delegating them to the ViewModel
 * - DOM manipulation only - no business logic
 * 
 * IMPORTANT: The View NEVER accesses the Model directly.
 * All data comes through the ViewModel via the subscribe/notify pattern.
 */

/**
 * AdminView class - Handles Admin Dashboard rendering and interactions
 */
export class AdminView {
    /**
     * Creates a new AdminView instance
     * @param {AdminViewModel} viewModel - The ViewModel to bind to
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.editingTaskId = null;

        // Subscribe to ViewModel updates
        this.viewModel.subscribe(this.render.bind(this));
    }

    /**
     * Initializes the view - called after DOM is ready
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.render(this.viewModel.getViewData());
    }

    /**
     * Caches frequently accessed DOM elements
     */
    cacheElements() {
        // Main containers
        this.dashboardContainer = document.getElementById('admin-dashboard');

        // Form elements
        this.taskForm = document.getElementById('task-form');
        this.taskTitleInput = document.getElementById('task-title');
        this.taskDescriptionInput = document.getElementById('task-description');
        this.taskClientSelect = document.getElementById('task-client');
        this.taskPrioritySelect = document.getElementById('task-priority');
        this.taskDueDateInput = document.getElementById('task-due-date');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.formTitle = document.getElementById('form-title');

        // Task list and filters
        this.taskListContainer = document.getElementById('task-list');
        this.statusFilterBtns = document.querySelectorAll('.status-filter-btn');
        this.clientFilterSelect = document.getElementById('client-filter');
        this.searchInput = document.getElementById('search-input');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');

        // Statistics elements
        this.statTotal = document.getElementById('stat-total');
        this.statPending = document.getElementById('stat-pending');
        this.statCompleted = document.getElementById('stat-completed');
        this.statOverdue = document.getElementById('stat-overdue');
        this.completionRate = document.getElementById('completion-rate');
    }

    /**
     * Binds all event listeners
     */
    bindEvents() {
        // Form submission
        this.taskForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit
        this.cancelEditBtn?.addEventListener('click', () => {
            this.cancelEdit();
        });

        // Status filter buttons
        this.statusFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.viewModel.setStatusFilter(filter);
            });
        });

        // Client filter dropdown
        this.clientFilterSelect?.addEventListener('change', (e) => {
            this.viewModel.setClientFilter(e.target.value);
        });

        // Search input with debounce
        let searchTimeout;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.viewModel.setSearch(e.target.value);
            }, 300);
        });

        // Clear filters
        this.clearFiltersBtn?.addEventListener('click', () => {
            this.viewModel.clearFilters();
            if (this.searchInput) this.searchInput.value = '';
            if (this.clientFilterSelect) this.clientFilterSelect.value = 'all';
        });

        // Task list event delegation
        this.taskListContainer?.addEventListener('click', (e) => {
            const target = e.target;
            const taskItem = target.closest('.task-item');

            if (!taskItem) return;

            const taskId = taskItem.dataset.id;

            if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
                this.handleDelete(taskId);
            } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
                this.handleEdit(taskId);
            } else if (target.classList.contains('status-btn') || target.closest('.status-btn')) {
                const status = target.dataset.status || target.closest('.status-btn').dataset.status;
                this.viewModel.setTaskStatus(taskId, status);
            }
        });

        // Assignment change handler
        this.taskListContainer?.addEventListener('change', (e) => {
            if (e.target.classList.contains('assign-select')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.id;
                const clientId = e.target.value || null;
                this.viewModel.assignTask(taskId, clientId);
            }
        });
    }

    /**
     * Handles form submission
     */
    handleFormSubmit() {
        const taskData = {
            title: this.taskTitleInput.value,
            description: this.taskDescriptionInput.value,
            assignedClientId: this.taskClientSelect.value || null,
            priority: this.taskPrioritySelect.value,
            dueDate: this.taskDueDateInput.value || null
        };

        if (!taskData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        if (this.editingTaskId) {
            this.viewModel.updateTask(this.editingTaskId, taskData);
            this.cancelEdit();
        } else {
            this.viewModel.createTask(taskData);
        }

        this.clearForm();
    }

    /**
     * Handles edit button click
     * @param {string} taskId - ID of task to edit
     */
    handleEdit(taskId) {
        const task = this.viewModel.getTask(taskId);

        if (task) {
            this.editingTaskId = taskId;
            this.taskTitleInput.value = task.title;
            this.taskDescriptionInput.value = task.description || '';
            this.taskClientSelect.value = task.assignedClientId || '';
            this.taskPrioritySelect.value = task.priority;
            this.taskDueDateInput.value = task.dueDate
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : '';

            this.submitBtn.innerHTML = '<span class="btn-icon">💾</span> Update Task';
            this.cancelEditBtn.style.display = 'inline-flex';
            this.formTitle.textContent = 'Edit Task';

            this.taskForm.scrollIntoView({ behavior: 'smooth' });
            this.taskTitleInput.focus();
        }
    }

    /**
     * Handles delete button click
     * @param {string} taskId - ID of task to delete
     */
    handleDelete(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.viewModel.deleteTask(taskId);
        }
    }

    /**
     * Cancels edit mode
     */
    cancelEdit() {
        this.editingTaskId = null;
        this.clearForm();
        this.submitBtn.innerHTML = '<span class="btn-icon">➕</span> Create Task';
        this.cancelEditBtn.style.display = 'none';
        this.formTitle.textContent = 'Create New Task';
    }

    /**
     * Clears the form
     */
    clearForm() {
        this.taskTitleInput.value = '';
        this.taskDescriptionInput.value = '';
        this.taskClientSelect.value = '';
        this.taskPrioritySelect.value = 'medium';
        this.taskDueDateInput.value = '';
    }

    // ==========================================
    // RENDERING
    // ==========================================

    /**
     * Main render method - called when ViewModel notifies
     * @param {Object} data - View data from ViewModel
     */
    render(data) {
        this.renderStatistics(data.statistics);
        this.renderClientOptions(data.clients);
        this.renderFilters(data.currentFilter);
        this.renderTaskList(data.tasks, data.clients);
    }

    /**
     * Renders statistics cards
     * @param {Object} stats - Statistics object
     */
    renderStatistics(stats) {
        if (this.statTotal) this.statTotal.textContent = stats.total;
        if (this.statPending) this.statPending.textContent = stats.pending;
        if (this.statCompleted) this.statCompleted.textContent = stats.completed;
        if (this.statOverdue) this.statOverdue.textContent = stats.overdue;
        if (this.completionRate) {
            this.completionRate.textContent = `${stats.completionRate}%`;
            this.completionRate.style.setProperty('--progress', `${stats.completionRate}%`);
        }
    }

    /**
     * Renders client options in dropdowns
     * @param {User[]} clients - Array of client users
     */
    renderClientOptions(clients) {
        // Task form client dropdown
        if (this.taskClientSelect) {
            const currentValue = this.taskClientSelect.value;
            this.taskClientSelect.innerHTML = `
                <option value="">-- Unassigned --</option>
                ${clients.map(c => `<option value="${c.id}">${this.escapeHTML(c.name)}</option>`).join('')}
            `;
            this.taskClientSelect.value = currentValue;
        }

        // Client filter dropdown
        if (this.clientFilterSelect) {
            const currentValue = this.clientFilterSelect.value;
            this.clientFilterSelect.innerHTML = `
                <option value="all">All Clients</option>
                <option value="unassigned">Unassigned</option>
                ${clients.map(c => `<option value="${c.id}">${this.escapeHTML(c.name)}</option>`).join('')}
            `;
            this.clientFilterSelect.value = currentValue;
        }
    }

    /**
     * Renders filter button states
     * @param {string} currentFilter - Currently active filter
     */
    renderFilters(currentFilter) {
        this.statusFilterBtns?.forEach(btn => {
            if (btn.dataset.filter === currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Renders the task list
     * @param {Task[]} tasks - Array of tasks
     * @param {User[]} clients - Array of clients
     */
    renderTaskList(tasks, clients) {
        if (!this.taskListContainer) return;

        if (tasks.length === 0) {
            this.taskListContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>No tasks found</p>
                    <span>Create a new task or adjust your filters</span>
                </div>
            `;
            return;
        }

        this.taskListContainer.innerHTML = tasks.map(task =>
            this.createTaskHTML(task, clients)
        ).join('');
    }

    /**
     * Creates HTML for a single task item
     * @param {Task} task - Task object
     * @param {User[]} clients - Array of clients
     * @returns {string} HTML string
     */
    createTaskHTML(task, clients) {
        const priorityClass = `priority-${task.priority}`;
        const statusClass = task.status;
        const overdueClass = task.isOverdue() ? 'overdue' : '';

        const assignedClient = clients.find(c => c.id === task.assignedClientId);
        const assignedName = assignedClient ? assignedClient.name : 'Unassigned';

        const dueDateDisplay = task.dueDate
            ? this.formatDate(task.dueDate)
            : 'No due date';

        return `
            <div class="task-item ${statusClass} ${overdueClass}" data-id="${task.id}">
                <div class="task-priority-indicator ${priorityClass}"></div>
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
                        <div class="task-badges">
                            <span class="badge priority-badge ${priorityClass}">${task.priority}</span>
                            <span class="badge status-badge ${task.status}">${this.formatStatus(task.status)}</span>
                            ${task.isOverdue() ? '<span class="badge overdue-badge">Overdue</span>' : ''}
                        </div>
                    </div>
                    ${task.description ? `<p class="task-description">${this.escapeHTML(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-assignee">
                            <span class="meta-icon">👤</span>
                            <select class="assign-select" title="Assign to client">
                                <option value="">Unassigned</option>
                                ${clients.map(c => `
                                    <option value="${c.id}" ${c.id === task.assignedClientId ? 'selected' : ''}>
                                        ${this.escapeHTML(c.name)}
                                    </option>
                                `).join('')}
                            </select>
                        </span>
                        <span class="task-due-date ${task.isOverdue() ? 'overdue' : ''}">
                            <span class="meta-icon">📅</span>
                            ${dueDateDisplay}
                        </span>
                        <span class="task-created">
                            <span class="meta-icon">🕐</span>
                            Created: ${this.formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    ${this.createStatusButtons(task)}
                    <button class="btn edit-btn" title="Edit Task">
                        <span class="btn-icon">✏️</span>
                    </button>
                    <button class="btn delete-btn" title="Delete Task">
                        <span class="btn-icon">🗑️</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Creates status toggle buttons
     * @param {Task} task - Task object
     * @returns {string} HTML string
     */
    createStatusButtons(task) {
        if (task.status === 'completed') {
            return `
                <button class="btn status-btn reopen-btn" data-status="pending" title="Reopen Task">
                    <span class="btn-icon">↩️</span>
                </button>
            `;
        } else {
            return `
                <button class="btn status-btn complete-btn" data-status="completed" title="Mark Complete">
                    <span class="btn-icon">✓</span>
                </button>
            `;
        }
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Formats a date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Formats status for display
     * @param {string} status - Status value
     * @returns {string} Formatted status
     */
    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'completed': 'Completed'
        };
        return statusMap[status] || status;
    }

    /**
     * Shows a notification toast
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning)
     */
    showNotification(message, type = 'success') {
        // Simple notification - could be enhanced with toast library
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
