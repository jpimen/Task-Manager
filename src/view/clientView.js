/**
 * Client View - MVVM Architecture (Admin-Client System)
 * 
 * The Client View is responsible for:
 * - Rendering the Client Dashboard UI
 * - Displaying only tasks assigned to the logged-in client
 * - Capturing user interactions and delegating them to the ViewModel
 * - DOM manipulation only - no business logic
 * 
 * IMPORTANT: The View NEVER accesses the Model directly.
 * All data comes through the ViewModel via the subscribe/notify pattern.
 */

/**
 * ClientView class - Handles Client Dashboard rendering and interactions
 */
export class ClientView {
    /**
     * Creates a new ClientView instance
     * @param {ClientViewModel} viewModel - The ViewModel to bind to
     */
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.selectedTaskId = null;

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
        this.dashboardContainer = document.getElementById('client-dashboard');

        // Counter elements
        this.totalCount = document.getElementById('client-total-count');
        this.pendingCount = document.getElementById('client-pending-count');
        this.completedCount = document.getElementById('client-completed-count');
        this.overdueCount = document.getElementById('client-overdue-count');

        // Filter and search
        this.statusFilterBtns = document.querySelectorAll('.client-status-filter-btn');
        this.searchInput = document.getElementById('client-search-input');
        this.clearFiltersBtn = document.getElementById('client-clear-filters-btn');

        // Task list
        this.taskListContainer = document.getElementById('client-task-list');

        // Task detail modal
        this.taskDetailModal = document.getElementById('task-detail-modal');
        this.taskDetailContent = document.getElementById('task-detail-content');
        this.closeModalBtn = document.getElementById('close-modal-btn');

        // Notifications
        this.notificationBadge = document.getElementById('notification-badge');
        this.notificationList = document.getElementById('notification-list');
    }

    /**
     * Binds all event listeners
     */
    bindEvents() {
        // Status filter buttons
        this.statusFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.viewModel.setStatusFilter(filter);
            });
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
        });

        // Task list event delegation
        this.taskListContainer?.addEventListener('click', (e) => {
            const target = e.target;
            const taskItem = target.closest('.task-item');

            if (!taskItem) return;

            const taskId = taskItem.dataset.id;

            if (target.classList.contains('toggle-btn') || target.closest('.toggle-btn')) {
                this.viewModel.toggleTaskStatus(taskId);
            } else if (target.classList.contains('detail-btn') || target.closest('.detail-btn')) {
                this.showTaskDetail(taskId);
            }
        });

        // Close modal
        this.closeModalBtn?.addEventListener('click', () => {
            this.closeTaskDetail();
        });

        // Close modal on outside click
        this.taskDetailModal?.addEventListener('click', (e) => {
            if (e.target === this.taskDetailModal) {
                this.closeTaskDetail();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.taskDetailModal?.classList.contains('active')) {
                this.closeTaskDetail();
            }
        });
    }

    /**
     * Shows task detail modal
     * @param {string} taskId - ID of task to show
     */
    showTaskDetail(taskId) {
        const details = this.viewModel.getTaskDetails(taskId);

        if (!details) return;

        this.selectedTaskId = taskId;

        this.taskDetailContent.innerHTML = this.createTaskDetailHTML(details);
        this.taskDetailModal.classList.add('active');

        // Bind toggle button in modal
        const modalToggleBtn = this.taskDetailContent.querySelector('.modal-toggle-btn');
        modalToggleBtn?.addEventListener('click', () => {
            this.viewModel.toggleTaskStatus(taskId);
            // Re-render the modal with updated data
            const updatedDetails = this.viewModel.getTaskDetails(taskId);
            if (updatedDetails) {
                this.taskDetailContent.innerHTML = this.createTaskDetailHTML(updatedDetails);
            }
        });
    }

    /**
     * Closes task detail modal
     */
    closeTaskDetail() {
        this.taskDetailModal?.classList.remove('active');
        this.selectedTaskId = null;
    }

    // ==========================================
    // RENDERING
    // ==========================================

    /**
     * Main render method - called when ViewModel notifies
     * @param {Object} data - View data from ViewModel
     */
    render(data) {
        this.renderCounts(data.counts);
        this.renderFilters(data.currentFilter);
        this.renderTaskList(data.tasks);
        this.renderNotifications();
    }

    /**
     * Renders task counters
     * @param {Object} counts - Counts object
     */
    renderCounts(counts) {
        if (this.totalCount) this.totalCount.textContent = counts.total;
        if (this.pendingCount) this.pendingCount.textContent = counts.pending;
        if (this.completedCount) this.completedCount.textContent = counts.completed;
        if (this.overdueCount) this.overdueCount.textContent = counts.overdue;
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
     */
    renderTaskList(tasks) {
        if (!this.taskListContainer) return;

        if (tasks.length === 0) {
            this.taskListContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No tasks assigned to you</p>
                    <span>Check back later for new assignments</span>
                </div>
            `;
            return;
        }

        this.taskListContainer.innerHTML = tasks.map(task =>
            this.createTaskHTML(task)
        ).join('');
    }

    /**
     * Creates HTML for a single task item
     * @param {Task} task - Task object
     * @returns {string} HTML string
     */
    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const statusClass = task.status;
        const overdueClass = task.isOverdue() ? 'overdue' : '';
        const completedClass = task.isCompleted() ? 'completed' : '';

        const dueDateDisplay = task.dueDate
            ? this.formatDate(task.dueDate)
            : 'No due date';

        const toggleIcon = task.isCompleted() ? '↩️' : '✓';
        const toggleText = task.isCompleted() ? 'Mark Pending' : 'Mark Complete';

        return `
            <div class="task-item ${statusClass} ${overdueClass} ${completedClass}" data-id="${task.id}">
                <div class="task-priority-indicator ${priorityClass}"></div>
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
                        <div class="task-badges">
                            <span class="badge priority-badge ${priorityClass}">${task.priority}</span>
                            <span class="badge status-badge ${task.status}">${this.formatStatus(task.status)}</span>
                            ${task.isOverdue() ? '<span class="badge overdue-badge">⚠️ Overdue</span>' : ''}
                        </div>
                    </div>
                    ${task.description ? `<p class="task-description">${this.escapeHTML(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-due-date ${task.isOverdue() ? 'overdue' : ''}">
                            <span class="meta-icon">📅</span>
                            Due: ${dueDateDisplay}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn toggle-btn ${task.isCompleted() ? 'reopen' : 'complete'}" title="${toggleText}">
                        <span class="btn-icon">${toggleIcon}</span>
                        <span class="btn-text">${toggleText}</span>
                    </button>
                    <button class="btn detail-btn" title="View Details">
                        <span class="btn-icon">👁️</span>
                        <span class="btn-text">Details</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Creates HTML for task detail modal
     * @param {Object} details - Task details object
     * @returns {string} HTML string
     */
    createTaskDetailHTML(details) {
        const priorityClass = `priority-${details.priority}`;
        const toggleIcon = details.isCompleted ? '↩️' : '✓';
        const toggleText = details.isCompleted ? 'Mark as Pending' : 'Mark as Complete';

        return `
            <div class="detail-header">
                <h2>${this.escapeHTML(details.title)}</h2>
                <div class="detail-badges">
                    <span class="badge priority-badge ${priorityClass}">${details.priority} priority</span>
                    <span class="badge status-badge ${details.status}">${this.formatStatus(details.status)}</span>
                    ${details.isOverdue ? '<span class="badge overdue-badge">⚠️ Overdue</span>' : ''}
                </div>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${details.description ? this.escapeHTML(details.description) : 'No description provided.'}</p>
                </div>
                <div class="detail-section">
                    <h4>Details</h4>
                    <ul class="detail-list">
                        <li>
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${this.formatStatus(details.status)}</span>
                        </li>
                        <li>
                            <span class="detail-label">Priority:</span>
                            <span class="detail-value ${priorityClass}">${details.priority}</span>
                        </li>
                        <li>
                            <span class="detail-label">Due Date:</span>
                            <span class="detail-value ${details.isOverdue ? 'overdue' : ''}">
                                ${details.dueDate ? this.formatDate(details.dueDate) : 'Not set'}
                            </span>
                        </li>
                        <li>
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${this.formatDateTime(details.createdAt)}</span>
                        </li>
                        ${details.completedAt ? `
                        <li>
                            <span class="detail-label">Completed:</span>
                            <span class="detail-value">${this.formatDateTime(details.completedAt)}</span>
                        </li>
                        ` : ''}
                    </ul>
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn btn-primary modal-toggle-btn">
                    <span class="btn-icon">${toggleIcon}</span>
                    ${toggleText}
                </button>
            </div>
        `;
    }

    /**
     * Renders notifications
     */
    renderNotifications() {
        const notifications = this.viewModel.getNotifications();

        if (this.notificationBadge) {
            if (notifications.unread > 0) {
                this.notificationBadge.textContent = notifications.unread;
                this.notificationBadge.style.display = 'flex';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }

        if (this.notificationList) {
            if (notifications.items.length === 0) {
                this.notificationList.innerHTML = '<p class="no-notifications">No notifications</p>';
            } else {
                this.notificationList.innerHTML = notifications.items.map(n => `
                    <div class="notification-item ${n.type}">
                        <span class="notification-icon">${n.type === 'overdue' ? '⚠️' : '📅'}</span>
                        <span class="notification-message">${this.escapeHTML(n.message)}</span>
                    </div>
                `).join('');
            }
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
     * Formats a date with time for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date and time
     */
    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
}
