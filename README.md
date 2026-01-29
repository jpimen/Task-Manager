# Task Manager - Admin-Client System | MVVM Architecture

A clean and scalable **Admin-Client Task Management System** built with **vanilla JavaScript** following the **MVVM (Model–View–ViewModel)** architecture pattern.

![MVVM Architecture](https://img.shields.io/badge/Architecture-MVVM-blue)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![LocalStorage](https://img.shields.io/badge/Storage-LocalStorage-green)
![Roles](https://img.shields.io/badge/Roles-Admin%20%7C%20Client-purple)

## 🎯 System Overview

This application demonstrates a real-world **Admin → Client task assignment** workflow:

- **Admins** create, edit, and assign tasks to clients
- **Clients** view and manage only tasks assigned to them
- Strict **role-based access control**
- Complete **data persistence** with localStorage

## 🚀 Features

### 👔 Admin Features
- ✅ Create new tasks with title, description, priority, and due date
- ✅ Edit and delete tasks
- ✅ Assign tasks to specific clients
- ✅ View all tasks and their status
- ✅ Dashboard statistics (total, pending, completed, overdue)
- ✅ Filter and search tasks
- ✅ Completion rate tracking

### 👤 Client Features
- ✅ View only tasks assigned to them
- ✅ Mark tasks as completed or pending
- ✅ View task details (title, description, due date, priority)
- ✅ Overdue task notifications
- ✅ Filter and search assigned tasks

### 💫 Bonus Features
- 🔍 **Search and filtering** by status, client, and text
- 📊 **Task statistics** dashboard
- 🔔 **Visual notifications** for overdue tasks
- 📅 **Due dates** and **priority levels**
- 💾 **Persistent storage** using localStorage
- 🎨 **Modern dark theme** with animations

### ✨ NEW ENHANCED FEATURES (v2.0)
- 📁 **Category System** - Organize tasks by custom categories with color coding
- 📋 **Activity Log** - Complete audit trail of all task changes and actions
- 📊 **Performance Analytics** - Comprehensive insights on task completion and team productivity
- 🎯 **Subtasks** - Break complex tasks into smaller, manageable subtasks
- ⏱️ **Time Tracking** - Estimated vs actual completion time analysis
- 👥 **Client Performance Metrics** - Individual performance analytics per client
- 📈 **Productivity Trends** - 7-day and 30-day productivity analysis

## 📁 Project Structure

```
/src
 ├── model/
 │    ├── taskModel.js           # Task data structure and business logic
 │    ├── userModel.js           # User data structure and roles
 │    ├── categoryModel.js       # NEW: Category/tagging system
 │    ├── activityModel.js       # NEW: Activity log tracking
 │    └── subtaskModel.js        # NEW: Subtasks decomposition
 ├── view/
 │    ├── adminView.js           # Admin Dashboard UI rendering
 │    └── clientView.js          # Client Dashboard UI rendering
 ├── viewmodel/
 │    ├── adminViewModel.js      # Admin business logic and state
 │    └── clientViewModel.js     # Client business logic and state
 ├── services/
 │    ├── authService.js         # Authentication and session management
 │    ├── storageService.js      # localStorage persistence layer
 │    └── analyticsService.js    # NEW: Performance analytics engine
 ├── index.js                    # Application entry point
 ├── index.html                  # Main HTML file
 ├── styles.css                  # Modern CSS styling
 ├── NEW_FEATURES.md             # NEW: Detailed feature documentation
 └── IMPLEMENTATION_GUIDE.md     # NEW: Integration guide for developers
```

## 🏗️ MVVM Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│                          ↓↑                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      VIEW                                │    │
│  │  adminView.js / clientView.js                           │    │
│  │  • Renders UI based on data from ViewModel              │    │
│  │  • Captures user interactions                           │    │
│  │  • Delegates actions to ViewModel                       │    │
│  │  • DOM manipulation ONLY - no business logic            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓↑                                      │
│                   Subscribe/Notify                               │
│                          ↓↑                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   VIEWMODEL                              │    │
│  │  adminViewModel.js / clientViewModel.js                 │    │
│  │  • Handles user actions/commands from View              │    │
│  │  • Updates Model based on user input                    │    │
│  │  • Notifies View when data changes                      │    │
│  │  • Manages application state and filters                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓↑                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     MODEL                                │    │
│  │  taskModel.js / userModel.js                            │    │
│  │  • Task data structure with assignment                  │    │
│  │  • User data structure with roles                       │    │
│  │  • Business logic (validation, status changes)          │    │
│  │  • Completely independent of View                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓↑                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   SERVICES                               │    │
│  │  authService.js / storageService.js                     │    │
│  │  • Authentication and session management                │    │
│  │  • localStorage persistence                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Key MVVM Concepts Implemented

1. **Model Layer** (`taskModel.js`, `userModel.js`)
   - `Task` class with assignment, priority, due dates
   - `User` class with roles (admin/client)
   - Pure business logic, no UI awareness

2. **ViewModel Layer** (`adminViewModel.js`, `clientViewModel.js`)
   - Implements Observer pattern (subscribe/notify)
   - Role-specific business logic
   - Handles all user commands
   - Manages state, filters, and persistence

3. **View Layer** (`adminView.js`, `clientView.js`)
   - Role-specific dashboard rendering
   - Subscribes to ViewModel for updates
   - **Never accesses Model directly**

4. **Services Layer** (`authService.js`, `storageService.js`, `analyticsService.js`)
   - Authentication with role-based login
   - Data persistence abstraction
   - Performance analytics engine

## 🎁 Enhanced Features v2.0

### 📁 Category System
Organize tasks into custom categories for better project management:
- Create custom categories with colors
- Assign tasks to categories
- Filter by category
- Color-coded visual identification

### 📋 Activity Log
Complete audit trail of all task changes:
- Automatic activity logging
- Track who changed what and when
- Chronological history view
- Activity type classification

### 📊 Performance Analytics
Comprehensive insights into task management:
- Completion rate statistics
- Client performance metrics
- Priority distribution analysis
- Status breakdown
- Overdue task analytics
- Time completion trends
- 7-day and 30-day productivity trends

### 🎯 Subtasks
Break complex tasks into manageable pieces:
- Create multiple subtasks per task
- Estimated hours tracking
- Individual completion status
- Automatic progress calculation
- Visual progress bar

### ⏱️ Time Analytics
Track actual vs estimated completion:
- Average completion time
- Fastest and slowest completions
- Time-based productivity analysis
- Performance trend visualization

---

## 📖 Documentation

For detailed information about new features:
- **[NEW_FEATURES.md](NEW_FEATURES.md)** - Complete feature documentation
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Developer integration guide

---

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (required for ES6 modules)

### Running the Application

**Option 1: Using VS Code Live Server Extension** (Recommended)
1. Install the "Live Server" extension in VS Code
2. Right-click on `src/index.html`
3. Select "Open with Live Server"

**Option 2: Using Python HTTP Server**
```bash
cd src
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Option 3: Using Node.js HTTP Server**
```bash
npx http-server src -p 8000
# Then open http://localhost:8000 in your browser
```

## 💡 How It Works

### User Flow

1. **Select a user** from the login screen (Admin or Client)
2. **Admin Dashboard**: Create tasks, assign to clients, manage all tasks
3. **Client Dashboard**: View and manage only assigned tasks
4. **Logout** and switch between roles to test

### Data Flow Example: Admin Creates and Assigns Task

```
User clicks "Create Task"
        ↓
    AdminView captures form data
        ↓
    AdminView calls viewModel.createTask(taskData)
        ↓
    AdminViewModel creates Task object (Model)
        ↓
    AdminViewModel adds to TaskList → Saves to storage
        ↓
    AdminViewModel calls notify()
        ↓
    AdminView.render() is called with new data
        ↓
    UI updates to show new task
```

### Subscribe/Notify Pattern

```javascript
// In View constructor - subscribe to updates
this.viewModel.subscribe(this.render.bind(this));

// In ViewModel - notify after any change
notify() {
    const data = this.getViewData();
    this.subscribers.forEach(callback => callback(data));
}
```

### Role-Based Access (Client)

```javascript
// ClientViewModel only returns tasks assigned to current user
getViewData() {
    const currentUser = authService.getCurrentUser();
    let tasks = this.taskList.getTasksByClient(currentUser.id);
    // ...filter and return
}
```

## 🎨 UI Features

- **Dark Theme** with role-specific accent colors
- **Login Screen** with user/role selection
- **Admin Dashboard** with statistics and full task management
- **Client Dashboard** with assigned tasks and notifications
- **Smooth Animations** for transitions
- **Responsive Design** for all screen sizes
- **Accessible** with keyboard navigation

## 📝 Default Users

The system comes with pre-configured users for testing:

| User | Role | Purpose |
|------|------|---------|
| Admin User | Admin | Create and assign tasks |
| John Doe | Client | Receive and manage tasks |
| Jane Smith | Client | Receive and manage tasks |
| Bob Johnson | Client | Receive and manage tasks |

## 🔧 Customization

### Adding New Users
Edit `DEFAULT_USERS` in `src/model/userModel.js`:

```javascript
export const DEFAULT_USERS = [
    {
        id: 'client_new',
        name: 'New Client',
        role: UserRole.CLIENT,
        email: 'new@example.com'
    },
    // ...
];
```

### Changing Colors
Edit CSS custom properties in `src/styles.css`:

```css
:root {
    --admin-color: hsl(280, 70%, 55%);  /* Admin theme */
    --client-color: hsl(190, 70%, 50%); /* Client theme */
    --primary-hue: 220;                  /* Primary color */
}
```

## 📊 Architecture Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Business logic in ViewModel can be tested independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features or roles
5. **Reusability**: Models and ViewModels can be reused with different Views

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using vanilla JavaScript and MVVM Architecture**

*Demonstrating real-world Admin → Client task assignment with strict role-based access control*