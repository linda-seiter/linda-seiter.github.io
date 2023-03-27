import { EditorView, basicSetup } from "codemirror";
import { javascript, esLint } from "@codemirror/lang-javascript";
import { lintGutter, linter } from "@codemirror/lint";
import Linter from "eslint4b-prebuilt";

// CodeMirror editor object
const editor = setupEditor();

// Code execution button
document
  .querySelector("#question > button")
  .addEventListener("click", clickHandler());

// Spy on console messages
const logBackup = console.log;
const assertBackup = console.assert;
const errorBackup = console.error;
let consoleMessages = [];

// Add editor elements (div, button, table) and create Codemirror editor object
function setupEditor() {
  // Hide textArea containing the code
  document.getElementById("code").style.display = "none";

  // Add CodeMirror editor div, run button, and result table
  const question = document.getElementById("question");
  question.append(document.createElement("div"));
  const button = document.createElement("button");
  button.textContent = "Run";
  question.append(button);
  question.append(document.createElement("table"));

  // Check if editor should include linter
  const extensions = [basicSetup, javascript()];
  if (question.dataset.lint == "true") {
    extensions.push(linter(esLint(new Linter())));
    extensions.push(lintGutter());
  }

  // Return CodeMirror editor object
  return new EditorView({
    extensions: extensions,
    parent: document.querySelector("#question > div"),
    doc: document.getElementById("code").value,
  });
}

// Assign button callback based on question type
function clickHandler() {
  const questionType = document.getElementById("question").dataset.questionType;
  switch (questionType) {
    case "show_output":
      return function () {
        showOutput();
      };
      break;
    case "compare_solution":
      // Hide the solution textarea
      document.getElementById("solution").style.display = "none";
      return function () {
        compareSolution();
      };
      break;
    case "check_assertion":
      return function () {
        checkAssertion();
      };
      break;
    default:
      return function () {
        console.error("Invalid question type " + questionType);
      };
  }
}

// Capture log messages
console.log = function () {
  consoleMessages.push.apply(consoleMessages, arguments);
  logBackup.apply(console, arguments);
};

// Capture assert messages
console.assert = function () {
  if (!arguments[0]) {
    consoleMessages.push(arguments[1]);
    assertBackup.apply(console, arguments);
  }
};

// Capture error messages
console.error = function () {
  if (!arguments[0]) {
    consoleMessages.push(arguments[1]);
    errorBackup.apply(console, arguments);
  }
};

// Run the code and return console messages
function runCode(code) {
  console.clear();
  consoleMessages = [];
  try {
    Function(code)(window);
  } catch (err) {
    console.error(err);
  } finally {
    return consoleMessages;
  }
}

// Convert array of strings to text nodes and line break elements
function arrayToTextNodes(parent, messages) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  for (var i = 0; i < messages.length; i++) {
    parent.appendChild(document.createTextNode(messages[i]));
    parent.appendChild(document.createElement("br"));
  }
}

// Run editor code and display console output
function showOutput() {
  const table = document.querySelector("#question > table");
  const actualMessages = runCode(editor.state.doc.toString());

  if (table.rows.length == 0) {
    setupTable(table, ["Output"]);
    setStatusClass(true, table.rows[0].cells[0]);
  }

  arrayToTextNodes(table.rows[1].cells[0], actualMessages);
}

// Compare editor code output vs solution code output
function compareSolution() {
  const table = document.querySelector("#question > table");
  const actualMessages = runCode(editor.state.doc.toString());
  const solutionMessages = runCode(document.getElementById("solution").value);

  const correct = actualMessages.toString() == solutionMessages.toString();
  const status = correct ? "Correct" : "Incorrect";

  if (table.rows.length == 0) {
    setupTable(table, ["Status", "Expected", "Actual"]);
  }

  arrayToTextNodes(table.rows[1].cells[0], [status]);
  arrayToTextNodes(table.rows[1].cells[1], solutionMessages);
  arrayToTextNodes(table.rows[1].cells[2], actualMessages);

  setStatusClass(correct, table.rows[1].cells[0]);
}

// run editor code and check console output for failed assertions
function checkAssertion() {
  const table = document.querySelector("#question > table");

  const actualMessages = runCode(editor.state.doc.toString());

  const correct = actualMessages.length == 0;
  const status = correct ? "Correct" : "Incorrect";

  if (table.rows.length == 0) {
    setupTable(table, ["Status", "Failed Assertions"]);
  }

  arrayToTextNodes(table.rows[1].cells[0], [status]);
  arrayToTextNodes(table.rows[1].cells[1], actualMessages);

  setStatusClass(correct, table.rows[1].cells[0]);
}

function setStatusClass(correct, element) {
  if (correct) {
    element.classList.add("correct");
    element.classList.remove("incorrect");
  } else {
    element.classList.add("incorrect");
    element.classList.remove("correct");
  }
}

// Table with 2 rows to display headings and results
function setupTable(table, rowHeadings) {
  table.insertRow(0);
  table.insertRow(1);

  for (let key of rowHeadings) {
    //add th with heading text in row 0
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    table.rows[0].appendChild(th);

    //add empty td in row 1
    table.rows[1].appendChild(document.createElement("td"));
  }
}
