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
        this.totalSearchResultNumber = document.getElementById("total-search-result-number");
        this.taskListResultsContainer = document.getElementById("task-list-results-container");
        this.textareaCharacterCountdown();

        this.taskList = JSON.parse(localStorage.getItem('taskList')) || [];
    }

    createTaskElement(task, index) {
        let tasksDiv = document.createElement("div");
        let capitalizedTaskName = task.name.charAt(0).toUpperCase() + task.name.slice(1);
        let importanceColor = task.importance === "High" ? "red" : task.importance === "Medium" ? "darkOrange" : "rgb(255, 238, 0)";
        let statusColor = task.status === "Done" ? "green" : task.status === "In Progress" ? "darkOrange" : "red";
        let finishDate = new Date(task.finishDate);
        let formattedFinishDate = this.formatDate(finishDate);
        let date = new Date(task.date);
        let formattedDate = this.formatDate(date);
        let descriptionButton = '';
    
        if (task.description) {
            descriptionButton += `<button class="show-description-button" title="Description">Show Description</button>`;
        }
    
        let taskId = `task-${index}`;
    
        tasksDiv.innerHTML = `
        <div class="tasksDiv">
            <div id="${taskId}" class="p-task">
                <div class="task-info">
                    <p class="task" title="${capitalizedTaskName}"><input type="checkbox" class="task-checkbox" title="Select task"></input>${index + 1}) ${capitalizedTaskName} | ${formattedDate} | <span style="color: ${importanceColor};">${task.importance}</span> | <span style="color: ${statusColor};">${task.status}</span> | Finish Date: ${formattedFinishDate}</p>
                    <div class="description-container">${descriptionButton}</div>
                </div>
            </div>
            <div class="button-container">
                <button class="edit-button" type="submit" title="Edit"><i class="bi bi-pencil-square" title="Edit"></i> Edit</button>
                <button class="${index} delete-button" type="submit" title="Delete"><i id="trash-icon" class="bi bi-trash" title="Delete"></i></button>
            </div>
            <br>
        </div>
        `;
    
        let pTaskElement = tasksDiv.querySelector(`#${taskId}`);
    
        if (task.description) {
            const showDescriptionButton = tasksDiv.querySelector(".show-description-button");
            showDescriptionButton.addEventListener("click", () => {
                this.showTaskDescription(task.description, pTaskElement); 
            });
        }
        return tasksDiv;
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
            
            const deleteButton = tasksDiv.querySelector(".delete-button");
    
            deleteButton.addEventListener("click", (event) => {
                const taskIndex = event.target.classList[0];
                this.deleteTask(taskIndex);
                alert(`${task.name} has been deleted.`);
            });
        });
        this.updateSearchResultCount(taskArray.length);
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
                alert(`The "${addTaskInput}" task has been added successfully!`);
            } 
            else {
                alert("The form must be filled!");
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
            alert(`${this.taskList.length} tasks have been removed, the list is empty.`)
            this.taskList = [];
            localStorage.setItem('taskList', JSON.stringify(this.taskList));
            this.displayTasksHandler();
            this.taskCounterMethod();
        })
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
                alert("Fill the search form!");
                return;
            }
    
            if (this.taskList.length === 0) {
                alert("The task list it's empty.");
                this.searchFormContainer.reset();
                return;
            }
    
            const searchResult = this.taskList.filter(task =>
                task.name.toLowerCase().includes(searchBar) ||
                task.importance.toLowerCase().includes(searchBar) ||
                task.status.toLowerCase().includes(searchBar)
            );
    
            this.updateSearchResultCount(searchResult.length);

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
    
    // Definir el orden de importancia y estado
    statusOrder = ["Done", "In Progress", "Not Done"];
    importanceOrder = ["High", "Medium", "Low"];
    
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

    updateSearchResultCount(count) {
        if (count > 0) {
            this.totalSearchResultNumber.textContent = `Search Results: ${count}`;
            this.totalSearchResultNumber.style.display = "block";
        } else {
            this.totalSearchResultNumber.style.display = "none";
        }
    }

    displayNotFoundMessage() {
        this.taskListResultsContainer.innerHTML = "";
    
        const notFoundMessage = document.createElement("div");
    
        notFoundMessage.innerHTML = `
            <div id="not-found-message">
                <h2 id="not-found-message-h4">We couldn't find any results</h2>
            </div> 
        `;
        
        this.taskListResultsContainer.innerHTML = "";
        this.taskListResultsContainer.appendChild(notFoundMessage);
    }

    // Task Manipulation
    selectAllTasks() {
        const generalCheckbox = document.getElementById("general-checkbox");
        const taskCheckbox = document.getElementById ("task-checkbox");

        generalCheckbox.addEventListener("change", () => {
            // Finish
        })
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

    textareaCharacterCountdown = () => {
        const taskDescriptionTextarea = document.getElementById("task-description-textarea");
        const numberCountdown = document.getElementById("number-countdown");
    
        const maxLength = 1000;
    
        const updateCounter = () => {
            const remainingChars = maxLength - taskDescriptionTextarea.value.length;
            numberCountdown.textContent = `${remainingChars}/${maxLength}`;
            numberCountdown.style.color = remainingChars === 0 ? "tomato" : "#555";
        };
    
        updateCounter();
    
        taskDescriptionTextarea.addEventListener("input", updateCounter);
    };
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




// Add Luxon, Toastify and SweetAlert Js Libraries!!!
// Include SendGrid for mails.