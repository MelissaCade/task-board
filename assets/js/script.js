//declares a global variable "tasklist" that pulls from local storage
let taskList = JSON.parse(localStorage.getItem("tasks"));
//declares a global variable "nextId" that pulls from local storage
let nextId = JSON.parse(localStorage.getItem("nextId"));
//if there is nothing in local storage, nextId is set to "1", if there is, the nextId number goes up by one. This will eventually be turned into "data-task-id" starting with "1" as we create project cards.
function generateTaskId() {
  if (nextId === null) {
    nextId = 1;
  } else {
    nextId++;
  }
  //stores the "nextID" object as a JSON object in local storage
  localStorage.setItem("nextId", JSON.stringify(nextId));
  //returns the nextId object
  return nextId;
}

function createTaskCard(task) {
  //creates a <div> of "taskCard" with various classes and attributes including a task ID - this is the entire card including all of its contents
  const taskCard = $("<div>")
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id);
  //creates a <div> with classes and text to act as the title of the card
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  //creates a <div> to be the card body
  const cardBody = $("<div>").addClass("card-body");
  //creates a <p> to be the card descriptoin and adds a class and text
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  //creates a <p> to be the due date on the card with a class and text
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  //creates a delete button on each card with classes and attributes including the task ID
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  //event listener for the delete button - directs js to the "handleDeleteTask" function
  cardDeleteBtn.on("click", handleDeleteTask);
  //the color-coding on the cards only applies if they are not yet done, so this part filters out the cards in the "done" pile
  if (task.dueDate && task.status !== "done") {
    //this pulls the current day from dayjs
    const now = dayjs();
    //this formats the due date for the task into DD/MM/YYYY format
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    //if today is the due date, the card will be yellow with white text
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
      //if we are past the due date, the card will be red with white text, and the delete button (already red) will now have a white border
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }
  //we append the various parts of the card (description, due date, and delete button) to the card body
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  //we append the card header and body to the task card
  taskCard.append(cardHeader, cardBody);
  //we return with the finished task card
  return taskCard;
}
//this function will make sure the various "bins" (to do, in progress, and done) are empty when we start
function renderTaskList() {
  //if there's nothing in local storage for our task list
  if (!taskList) {
    taskList = [];
  }
  //we empty the to do list bin
  const todoList = $("#todo-cards");
  todoList.empty();
  //we empty the in-progress bin
  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();
  //and we empty the done bin
  const doneList = $("#done-cards");
  doneList.empty();
  //If the task's status is "to-do", it is appended to the to-do div. If its status is "in-progress", it is appended to the in-progress div. If its status is "done", it is appended to the done div.
  for (let task of taskList) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }
  //this creates the semi-transparent image of the card that the user physically drags from one category to another.
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
  });
}
//declares a function to handle the "add task" event
function handleAddTask(event) {
  //stops the page from reloading when the user clicks "add task"
  event.preventDefault();
  //creates a new constant "task" with a task ID and an automatic status of "to-do"
  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };
  //this pushes our new task into our task list
  taskList.push(task);
  //this sets our "taskList" object into local storage as a JSON string
  localStorage.setItem("tasks", JSON.stringify(taskList));
  //here we are calling our "renderTaskList" function so our new task will appear on the page
  renderTaskList();
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}
//we are declaring a function that handles the "delete task" event
function handleDeleteTask(event) {
  //this stops the page from reloading by default when any of the delete buttons are pressed
  event.preventDefault();
  //we are creating a taskID of the task id number from the delete button so we can delete only this card
  const taskId = $(this).attr("data-task-id");
  //we are filtering through our task array in local memory to look for a specific task (specified with task.id) to delete
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  //we are overwriting our local storage array with our amended task list (in JSON object form) - not including the task we just deleted
  localStorage.setItem("tasks", JSON.stringify(taskList));
  //this calls the "renderTaskList" function above, which displays the tasks in their appropriate status divs
  renderTaskList();
}
//this is a function to handle the event when a user drogs and then drops a card from one status div to another - specifically the "drop" part
function handleDrop(event, ui) {
  //this makes the task card draggable
  const taskId = ui.draggable[0].dataset.taskId;
  //declaring a constant of "newStatus" - this will let us change the status of cards to reflect their new location
  const newStatus = event.target.id;
  //this changes the status of the card to reflect the new location of the card - a card dragged and dropped into "in progress" needs a status of "in progress" so that they don't revert to "to do" when we refresh the page
  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }
  //storing the data in local storage again
  localStorage.setItem("tasks", JSON.stringify(taskList));
  //calling the "renderTaskList" function to show the cards in their new homes (or, for ones that didn't move, in the same place they were before)
  renderTaskList();
}
//this calls the function to get the ball rolling when the page loads
$(document).ready(function () {
  //show the cards in their status locations
  renderTaskList();
  //pull up the form to add more tasks when the "add task" button is pressed
  $("#taskForm").on("submit", handleAddTask);
  //this makes the lanes (div status containers) "droppable" - a place you can succesfully drag and drop items to
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
  //this makes the "due date" part of the pop-up "add task" form into a datepicker, where you can change the month and date of the calendar
  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
