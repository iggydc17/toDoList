// To Do List Program

// Get Local Time
function getOrdinalSuffix(number) {
    if (number >= 11 && number <= 13) {
        return 'th';
    }
    switch (number % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

function updateLocalTime() {
    const localTimeElement = document.getElementById('time');
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfMonth = now.getDate();
    const dayOfMonthSuffix = getOrdinalSuffix(dayOfMonth);
    const month = months[now.getMonth()].slice(0, 3);
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const timeString = `${dayOfMonth}${dayOfMonthSuffix} ${month}, ${year} - ${hours}:${minutes}:${seconds}`;
    
    localTimeElement.textContent = timeString;
    localTimeElement.style.fontWeight = "bold";
}

setInterval(updateLocalTime, 1000);
updateLocalTime();


// Classes
class Task {
    constructor(name, importance, status, date, finishDate, description = '') {
        this.name = name;
        this.importance = importance;
        this.status = status;
        this.date = date;
        this.finishDate = finishDate;
        this.description = description;

        this.pTasks = null;
        }
}    

class ToDoList {
    constructor() {
        this.completeTaskForm = document.getElementById("complete-task-form");
        this.taskCounterAndClearAllContainer = document.getElementById("task-counter-and-clear-all-container");
        this.taskCounter = document.getElementById("task-counter");
        this.clearAllButton = document.getElementById("clear-all-button");
        this.searchFormContainer = document.getElementById("search-form-container");
        this.sortedByButton = document.getElementById("sorted-by-button");
        this.totalSearchContainer = document.getElementById("total-search-results");
        this.taskListResultsContainer = document.getElementById("task-list-results-container");
        this.statusOrder = ["Done", "In Progress", "Unfinished"];
        this.importanceOrder = ["High", "Medium", "Low"];
        this.deleteSelectedTasks();
        this.textareaCharacterCountdown();

        this.taskList = JSON.parse(localStorage.getItem('taskList')) || [];
    }

    createTaskElement(task, index) {
        let tasksDiv = document.createElement("div");
        let capitalizedTaskName = task.name.charAt(0).toUpperCase() + task.name.slice(1);
        let importanceColor = task.importance === "High" ? "red" : task.importance === "Medium" ? "darkOrange" : "#FFBF00";
        let statusColor = task.status === "Done" ? "green" : task.status === "In Progress" ? "darkOrange" : "red";
        let finishDate = new Date(task.finishDate);
        let formattedFinishDate = this.formatDate(finishDate);
        let date = new Date(task.date);
        let formattedDate = this.formatDate(date);
        let descriptionButton = '';
    
        if (task.description) {
            descriptionButton = `<button class="show-description-button" title="Description">Show Description</button>`;
        }

        const currentDate = new Date();
        const finishDateTime = new Date(task.finishDate);
        const isOverdue = currentDate > finishDateTime;
    
        const deadlineIcon = isOverdue ? '<i class="bi bi-hourglass-bottom" title="Overdue"></i>' : '';
    
        let taskId = `task-${index}`;
    
        tasksDiv.innerHTML = `
        <div class="tasksDiv">
            <div id="${taskId}" class="p-task">
                <div class="task-info">
                    <p class="task" title="${capitalizedTaskName}">
                        <input type="checkbox" class="task-checkbox" title="Select task"></input>
                        ${index + 1}) &nbsp ${capitalizedTaskName} | ${formattedDate} | 
                        <span style="color: ${importanceColor};">${task.importance}</span> | 
                        <span style="color: ${statusColor};">${task.status}</span> | <br><span class="finish-date-span">Finish Date: ${formattedFinishDate}.</span> 
                        &nbsp ${deadlineIcon}
                        <div class="description-container">
                            ${descriptionButton}
                        </div>
                    </p>
                </div>
            </div>
            <div class="button-container">
                <button class="edit-button" type="submit" title="Edit"><i class="bi bi-pencil-square" title="Edit"></i> Edit</button>
                <button class="${index} delete-button" type="submit" title="Delete"><i id="trash-icon" class="bi bi-trash" title="Delete"></i></button>
            </div>
        </div>
    `;
    
        const pTaskElement = tasksDiv.querySelector(`#${taskId}`);
        const deleteButton = tasksDiv.querySelector(".delete-button");
        const editButton = tasksDiv.querySelector(".edit-button");
    
        if (task.description) {
            const showDescriptionButton = tasksDiv.querySelector(".show-description-button");
            showDescriptionButton.addEventListener("click", () => {
                this.showTaskDescription(task.description, pTaskElement); 
            });
        }

        editButton.addEventListener("click", ()=> {
            console.log("Edit Button clicked!");
            this.createEditForm(task, index, tasksDiv);
        });


        deleteButton.addEventListener("click", () => {
            this.deleteTask(index);
            Toastify({
                text: `${task.name.charAt(0).toUpperCase() + task.name.slice(1)} has been deleted from the tasks list`,
                className: "info",
                style: {
                    background: "tomato",
                    borderRadius: "4px"
                }
            }).showToast();
        });
        
        return tasksDiv;
    }
    
    createEditForm(task, index, tasksDiv) {
        const existingEditForm = document.querySelector('.edit-form');
        if (existingEditForm) {
            existingEditForm.remove();
        }
        

        const editFormDiv = document.createElement('div');
        editFormDiv.classList.add('edit-form');

        editFormDiv.innerHTML = `
            <form id="edit-task-form">
                <div id="task-name-edit-container">
                    <label for="edit-task-name">Task Name:</label>
                    <input type="text" id="edit-task-name" value="${task.name}" placeholder="Rename the task" required>
                </div>
                <div id="quick-inputs-edit-container">
                    <label for="edit-task-importance">Importance:</label>
                    <select id="edit-task-importance" required>
                        <option value="High" ${task.importance === "High" ? "selected" : ""}>High</option>
                        <option value="Medium" ${task.importance === "Medium" ? "selected" : ""}>Medium</option>
                        <option value="Low" ${task.importance === "Low" ? "selected" : ""}>Low</option>
                    </select>
                    <label for="edit-task-status">Status:</label>
                    <select id="edit-task-status" required>
                        <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
                        <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Unfinished" ${task.status === "Unfinished" ? "selected" : ""}>Unfinished</option>
                    </select>
                    <label for="edit-task-finish-date">Finish Date:</label>
                    <input type="date" id="edit-task-finish-date" value="${task.finishDate.split('T')[0]}" required>
                </div>
                <div id="task-description-edit-container">
                    <label for="edit-task-description">Description <span class="edit-task-description">(optional)</span>:</label>
                    <textarea id="edit-task-description" maxlength="1000" placeholder="Enter a description for your task...">${task.description}</textarea>
                </div>
                <div id="buttons-edit-box">
                    <button type="submit" id="save-edit-button"> <i class="bi bi-check"></i> Save</button>
                    <button type="button" id="cancel-edit-button"> <i class="bi bi-x"></i> Cancel</button>
                <div>
            </form>
        `;

        tasksDiv.appendChild(editFormDiv);

        const editForm = editFormDiv.querySelector("#edit-task-form");
        const cancelEditButton = editFormDiv.querySelector("#cancel-edit-button");

        editForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.saveEditTask(task, index, editFormDiv);
        });

        cancelEditButton.addEventListener("click", () => {
            editFormDiv.remove();
        });
    }

    saveEditTask(task, index, editFormDiv) {
        const editTaskName = editFormDiv.querySelector("#edit-task-name").value;
        const editTaskImportance = editFormDiv.querySelector("#edit-task-importance").value;
        const editTaskStatus = editFormDiv.querySelector("#edit-task-status").value;
        const editTaskFinishDate = editFormDiv.querySelector("#edit-task-finish-date").value;
        const editTaskDescription = editFormDiv.querySelector("#edit-task-description").value;

        task.name = editTaskName;
        task.importance = editTaskImportance;
        task.status = editTaskStatus;
        task.finishDate = editTaskFinishDate;
        task.description = editTaskDescription;

        this.taskList[index] = task;
        localStorage.setItem('taskList', JSON.stringify(this.taskList));
        this.displayTasksHandler();
        Toastify({
            text: `${task.name.charAt(0).toUpperCase() + task.name.slice(1)} has been updated successfully!`,
            className: "info",
            style: {
                background: "#0FC616",
                borderRadius: "4px"
            }
        }).showToast();
    }

    showTaskDescription(description, pTaskElement) {
        if (pTaskElement) {
            if (!pTaskElement.querySelector('.task-description')) {
                const descriptionElement = document.createElement('div');
    
                descriptionElement.id = "description-container";
                descriptionElement.textContent = description;
                descriptionElement.classList.add('task-description');
                pTaskElement.appendChild(descriptionElement);
    
                const showDescriptionButton = pTaskElement.querySelector(".show-description-button");
                showDescriptionButton.textContent = "Hide Description";
                
                showDescriptionButton.classList.add('description-visible');
            } else {
                const descriptionElement = pTaskElement.querySelector('.task-description');
                descriptionElement.remove();
    
                const showDescriptionButton = pTaskElement.querySelector(".show-description-button");
                showDescriptionButton.textContent = "Show Description";
                
                showDescriptionButton.classList.remove('description-visible');
            }
        } else {
            console.error("Cannot show description: pTaskElement is not defined.");
        }
    }
    
    displayTasksOrSearchResults(taskArray) {
        this.taskListResultsContainer.innerHTML = "";
        taskArray.forEach((task, index) => {
            let tasksDiv = this.createTaskElement(task, index);
    
            this.taskListResultsContainer.appendChild(tasksDiv);
        });
    }
    
    createTask() {
        this.completeTaskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            
            let addTaskInput = document.getElementById("add-task-input").value.trim();
            let importanceSelectOption = document.getElementById("importance-select-option").value;
            let statusSelectOption = document.getElementById("status-select-option").value;
            let taskDescriptionTextarea = document.getElementById("task-description-textarea").value;
            let finishDate = document.getElementById("finish-date").value;
            let date = new Date(); 
    
            if (addTaskInput && importanceSelectOption && statusSelectOption && finishDate) {
                let newTask = new Task(addTaskInput, importanceSelectOption, statusSelectOption, date, finishDate, taskDescriptionTextarea);
                
                this.addTask(newTask);
                this.completeTaskForm.reset();
                Toastify({
                    text: `${addTaskInput.charAt(0).toUpperCase() + addTaskInput.slice(1)} has been added successfully to the tasks list!`,
                    className: "info",
                    style: {
                        background: "#0FC616",
                        borderRadius: "4px"
                    }
                }).showToast();
            } 
            else {
                Toastify({
                    text: "The form must be filled!",
                    className: "info",
                    style: {
                        background: "tomato",
                        borderRadius: "4px"
                    }
                }).showToast();
            }
        });
    }

    displayTasksHandler() {
        if (this.taskList.length === 0) {
            this.displayEmptyMessage();
            this.taskCounterAndClearAllContainer.style.display = "none";
            this.totalSearchContainer.style.display = "none";
        } else {
            this.displayTasksOrSearchResults(this.taskList);
            this.taskCounterAndClearAllContainer.style.display = "block";
        }
    }

    displayEmptyMessage() {
        let emptyMessage = document.createElement("div");

        emptyMessage.id = "empty-div";
        emptyMessage.innerHTML = `
            <h2 id="empty-message">The task list is empty.</h2>
        `;

        this.taskListResultsContainer.innerHTML = "";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.color = "tomato";
        this.taskListResultsContainer.appendChild(emptyMessage);
    }

    addTask(task) {
        this.taskList.push(task);
        localStorage.setItem('taskList', JSON.stringify(this.taskList));
        this.displayTasksHandler();
        this.taskCounterMethod();
        toDoList.completeTaskForm.reset();
    }

    deleteTask(index) {
        this.taskList.splice(index, 1);
        localStorage.setItem('taskList', JSON.stringify(this.taskList));
        this.displayTasksHandler(); 
        this.taskCounterMethod();
    }

    taskCounterMethod() {
        const backButton = document.createElement("button");

        this.taskCounter.textContent = `Total Tasks: ${this.taskList.length}`;

        this.taskCounter.addEventListener("click", () => {
            this.displayTasksOrSearchResults(this.taskList);
            backButton.style.display = "none";
            this.totalSearchResultNumber.style.display = "none";
            this.searchFormContainer.reset();
        });
    }

    clearTasks() {
        
        this.clearAllButton.addEventListener("click", () => {

            if (this.taskList.length >= 1) {
                Swal.fire({
                    title: "Are you sure you want to delete all the tasks?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#0FC616",
                    cancelButtonColor: "tomato",
                    confirmButtonText: "Yes, delete all"
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                        title: "Deleted!",
                        text: "All the tasks have been deleted.",
                        icon: "success"
                        });
                    }
                });
            }
            else {
                Toastify({
                    text: "The task list it's empty!",
                    className: "info",
                    style: {
                        background: "tomato",
                        borderRadius: "4px"
                    }
                }).showToast();    
            }

            this.taskList = [];
            localStorage.setItem('taskList', JSON.stringify(this.taskList));
            this.displayTasksHandler();
            this.taskCounterMethod();
        });
    }

    resetTaskForm() {
        const resetButton = document.getElementById("reset-button");

        resetButton.addEventListener("click", () => {
            this.completeTaskForm.reset();
            toDoList.textareaCharacterCountdown();
        });
    }

    // Search Tasks Section
    searchTasks() {
        let backButton;
    
        this.searchFormContainer.addEventListener("submit", (event) => {
            event.preventDefault();
    
            const searchBar = document.getElementById("search-bar").value.trim().toLowerCase();

            if (searchBar === "") {
                Toastify({
                    text: "Fill the search form!",
                    className: "info",
                    style: {
                        background: "tomato",
                        borderRadius: "4px"
                    }
                }).showToast();

                return;
            }
    
            if (this.taskList.length === 0) {
                Toastify({
                    text: "The task list it's empty.",
                    className: "info",
                    style: {
                        background: "tomato",
                        borderRadius: "4px"
                    }
                }).showToast();
                this.searchFormContainer.reset();
                return;
            }
    
            const searchResult = this.taskList.filter(task =>
                task.name.toLowerCase().includes(searchBar) ||
                task.importance.toLowerCase().includes(searchBar) ||
                task.status.toLowerCase().includes(searchBar)
            );
    
            if (searchResult.length > 0) {
                this.displayTasksOrSearchResults(searchResult);
                if (!backButton) {
                    backButton = this.createBackButton();
                    backButton.style.display = "block";
                    this.backButton.title = "Back";
                }
            } 
            else {
                this.displayNotFoundMessage();
                this.taskCounterAndClearAllContainer.style.display = "none";

                if (!backButton) {
                    backButton = this.createBackButton();
                    backButton.style.display = "block";
                }
            }
        });
    }

    createBackButton() {
        const backButton = document.createElement("button");
        backButton.textContent = "⇦";
        backButton.id = "back-button";
        backButton.style.display = "none";
    
        backButton.addEventListener("click", () => {
            location.reload();
            backButton.style.display = "none";
        });
    
        this.searchFormContainer.prepend(backButton);
    
        return backButton;
    }

    sortTasks(taskArray, criterion) {
        switch (criterion) {
            case "A - Z":
                taskArray.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "Z - A":
                taskArray.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "Active":
                taskArray = taskArray.filter(task => {
                    const currentDate = new Date();
                    const finishDateTime = new Date(task.finishDate);
                    return currentDate <= finishDateTime;
                });
                break;
            case "Expired":
                taskArray = taskArray.filter(task => {
                    const currentDate = new Date();
                    const finishDateTime = new Date(task.finishDate);
                    return currentDate > finishDateTime;
                });
                break;
            case "Status ↑ ↓":
                taskArray.sort((a, b) => this.statusOrder.indexOf(a.status) - this.statusOrder.indexOf(b.status));
                break;
            case "Status ↓ ↑":
                taskArray.sort((a, b) => this.statusOrder.indexOf(b.status) - this.statusOrder.indexOf(a.status));
                break;
            case "Importance ↑ ↓":
                taskArray.sort((a, b) => this.importanceOrder.indexOf(a.importance) - this.importanceOrder.indexOf(b.importance));
                break;
            case "Importance ↓ ↑":
                taskArray.sort((a, b) => this.importanceOrder.indexOf(b.importance) - this.importanceOrder.indexOf(a.importance));
                break;
            case "Order":
                taskArray.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            default:
                break;
        }
        return taskArray;
    }    
    
    convertSortedByButtonTextContent() {
        this.dropdownItems = document.querySelectorAll('#dropdown-menu .dropdown-item');
    
        this.dropdownItems.forEach(item => {
            item.addEventListener("click", () => {
                const value = item.getAttribute(`data-value`);
                this.sortedByButton.textContent = `${value}`;
                this.sortedByButton.style.paddingRight = "4px";
                
                const sortedTasks = this.sortTasks([...this.taskList], value);
                this.displayTasksOrSearchResults(sortedTasks);
                this.taskCounterMethod();
            });
        });
    }

    displayNotFoundMessage() {
        this.taskListResultsContainer.innerHTML = "";
    
        const notFoundMessage = document.createElement("div");
    
        notFoundMessage.innerHTML = `
            <div id="not-found-message">
                <h2 id="not-found-message-h4">We couldn't find any results</h2>
                <p id="show-tasks-again">Show Tasks!</p>
            </div> 
        `;
        
        this.taskListResultsContainer.innerHTML = "";
        this.taskListResultsContainer.appendChild(notFoundMessage);
        Toastify({
            text: "No results found.",
            className: "info",
            style: {
                background: "tomato",
                borderRadius: "4px"
            }
        }).showToast();

        this.sortedByButton.style.display = "none";
        this.taskCounter.style.display = "none";

        const showTasksAgain = document.getElementById("show-tasks-again");

        showTasksAgain.addEventListener("click", () => {
            this.displayTasksOrSearchResults(this.taskList);
            this.sortedByButton.style.display = "block";
            this.taskCounter.style.display = "block";
            this.totalSearchResultNumber.style.display = "none";
            this.searchFormContainer.reset();
        });
    }

    // Task Manipulation
    selectAllTasks() {
        const generalCheckbox = document.getElementById("general-checkbox");
        const allButton = document.getElementById("all-button");
        const noneButton = document.getElementById("none-button");
        const activeButton = document.getElementById("active-button"); 
        const expiredButton = document.getElementById("expired-button");
        const doneButton = document.getElementById("done-button");
        const inProgressButton = document.getElementById("in-progress-button");
        const unfinishedButton = document.getElementById("unfinished-button");
        const highImportanceButton = document.getElementById("hight-importance-button");
        const mediumImportanceButton = document.getElementById("medium-importance-button");
        const lowImportanceButton = document.getElementById("low-importance-button");
    
        generalCheckbox.addEventListener("click", () => {
            const tasks = document.querySelectorAll(".task-checkbox");
            tasks.forEach(task => {
                task.checked = generalCheckbox.checked;
            });
        });

        allButton.addEventListener("click", () => {
            const tasks = document.querySelectorAll(".task-checkbox");
            tasks.forEach(task => {
                task.checked = true;
            });
        });
    
        noneButton.addEventListener("click", () => {
            const tasks = document.querySelectorAll(".task-checkbox");
            tasks.forEach(task => {
                task.checked = false;
            });
        });

        activeButton.addEventListener("click", () => {
            const tasks = document.querySelectorAll(".task-checkbox");
            tasks.forEach(task => {
                const parentTaskDiv = task.closest(".p-task");
                const isOverdue = parentTaskDiv.querySelector(".bi-hourglass-bottom") !== null;
                if (isOverdue) {
                    task.checked = false;
                } else {
                    task.checked = true;
                }
            });
        });
                            
        expiredButton.addEventListener("click", () => {
            const tasks = document.querySelectorAll(".task-checkbox");
            tasks.forEach(task => {
                const parentTaskDiv = task.closest(".p-task");
                const isOverdue = parentTaskDiv.querySelector(".bi-hourglass-bottom") !== null;
                if (isOverdue) {
                    task.checked = true;
                } else {
                    task.checked = false;
                }
            });
        });

        doneButton.addEventListener("click", () => {
            this.filterAndSelectTasks("Done");
        });
    
        inProgressButton.addEventListener("click", () => {
            this.filterAndSelectTasks("In Progress");
        });
    
        unfinishedButton.addEventListener("click", () => {
            this.filterAndSelectTasks("Unfinished");
        });
    
        highImportanceButton.addEventListener("click", () => {
            this.filterAndSelectTasks("High");
        });
    
        mediumImportanceButton.addEventListener("click", () => {
            this.filterAndSelectTasks("Medium");
        });
    
        lowImportanceButton.addEventListener("click", () => {
            this.filterAndSelectTasks("Low");
        });
    }
    
    filterAndSelectTasks(filterValue) {
        const tasks = document.querySelectorAll(".task-checkbox");
        const filteredTasks = [];
        tasks.forEach(task => {
            const parentTaskDiv = task.closest(".p-task");
            const taskStatus = parentTaskDiv.querySelector(".task").textContent;
            if (taskStatus.includes(filterValue)) {
                task.checked = true;
                filteredTasks.push(task);
            } else {
                task.checked = false;
            }
        });
        
        if (filteredTasks.length === 0) {
            Toastify({
                text: `No tasks were found with the status "${filterValue}".`,
                className: "info",
                style: {
                    background: "tomato",
                    borderRadius: "4px"
                }
            }).showToast();
        }
    }    
    
    deleteSelectedTasks() {
        const trashIcon = document.getElementById("trash-icon");
    
        trashIcon.addEventListener("click", () => {
            const selectedTasks = document.querySelectorAll(".task-checkbox:checked");
            if (selectedTasks.length > 0) {
                const confirmation = confirm("Are you sure you want to delete the selected tasks?");
                if (confirmation) {
                    selectedTasks.forEach(selectedTask => {
                        const parentTaskDiv = selectedTask.closest(".p-task");
                        const taskId = parentTaskDiv.id;
                        const index = taskId.split("-")[1];
                        this.deleteTask(index);
                    });
                }
            } else {
                Toastify({
                    text: "No tasks selected for deletion.",
                    className: "info",
                    style: {
                        background: "tomato",
                        borderRadius: "4px"
                    }
                }).showToast();
            }
        });
    }  
    
    reloadWeb() {
        const refreshIcon = document.getElementById("refresh-icon");
    
        refreshIcon.addEventListener("click", () => {
            location.reload();
        })
    }

    formatDate(date) {
        const day = date.getDate();
        let daySuffix;
    
        if (day >= 11 && day <= 13) {
            daySuffix = "th";
        } else {
            switch (day % 10) {
                case 1:
                    daySuffix = "st";
                    break;
                case 2:
                    daySuffix = "nd";
                    break;
                case 3:
                    daySuffix = "rd";
                    break;
                default:
                    daySuffix = "th";
            }
        }
    
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
    
        return `${day}${daySuffix} ${month}, ${year}`;
    }

    textareaCharacterCountdown() {
        const taskDescriptionTextarea = document.getElementById("task-description-textarea");
        const numberCountdown = document.getElementById("number-countdown");

        if (taskDescriptionTextarea && numberCountdown) {
            taskDescriptionTextarea.addEventListener("input", () => {
                const remainingCharacters = 1000 - taskDescriptionTextarea.value.length;
                numberCountdown.textContent = `${remainingCharacters}/1000`;
            });
        }
    }
}

// Instances
const toDoList = new ToDoList();

toDoList.displayTasksHandler();
toDoList.createTask();
toDoList.taskCounterMethod();
toDoList.clearTasks();
toDoList.searchTasks();
toDoList.convertSortedByButtonTextContent();
toDoList.textareaCharacterCountdown();
toDoList.resetTaskForm();
toDoList.reloadWeb();
toDoList.selectAllTasks();

