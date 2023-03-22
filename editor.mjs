import { EditorView, basicSetup } from "codemirror";
import { javascript, esLint } from "@codemirror/lang-javascript";
import { lintGutter, linter } from "@codemirror/lint";
import Linter from "eslint4b-prebuilt";

let logBackup = console.log;
let assertBackup = console.assert;
let consoleMessages = [];
let editor = setupEditor();

document
  .querySelector("#question > button")
  .addEventListener("click", clickHandler());

function setupEditor() {
  let question = document.getElementById("question");
  question.append(document.createElement("div"));
  let button = document.createElement("button");
  button.textContent = "Run";
  question.append(button);
  question.append(document.createElement("table"));
  document.getElementById("code").style.display = "none";

  let extensions = [basicSetup, javascript()];
  if (document.getElementById("question").dataset.lint == "true") {
    extensions.push(linter(esLint(new Linter())));
    extensions.push(lintGutter());
  }

  return new EditorView({
    extensions: extensions,
    parent: document.querySelector("#question > div"),
    doc: document.getElementById("code").value,
  });
}

function clickHandler() {
  let questionType = document.getElementById("question").dataset.questionType;
  switch (questionType) {
    case "show_output":
      return function () {
        showOutput();
      };
      break;
    case "compare_solution":
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
        console.error("unknown question type " + questionType);
      };
  }
}

console.log = function () {
  consoleMessages.push.apply(consoleMessages, arguments);
  logBackup.apply(console, arguments);
};

console.assert = function () {
  if (!arguments[0]) {
    consoleMessages.push(arguments[1]);
    assertBackup.apply(console, arguments);
  }
};

function runCode(code) {
  console.clear();
  consoleMessages = [];
  try {
    Function(code)(window);
  } catch (err) {
    console.error(err);
  }
}

function showOutput() {
  runCode(editor.state.doc.toString());
  let table = document.querySelector("#question > table");
  let resultString = consoleMessages.join("<br>");
  if (table.rows.length == 0) {
    table.insertRow(0).insertCell(0).innerHTML = "Output";
    table.insertRow(1).insertCell(0).innerHTML = resultString;
    table.rows[0].cells[0].classList.add("correct");
  } else {
    table.rows[1].cells[0].innerHTML = resultString;
  }
}

function compareSolution() {
  runCode(editor.state.doc.toString());
  let table = document.querySelector("#question > table");
  let actualMessages = consoleMessages;

  consoleMessages = [];
  runCode(document.getElementById("solution").value);
  let solutionMessages = consoleMessages;

  let solution = solutionMessages.join("<br>");
  let actual = actualMessages.join("<br>");
  let status = solution == actual ? "Correct" : "Incorrect";
  if (table.rows.length == 0) {
    table.insertRow(0).insertCell(0).innerHTML = "Status";
    table.insertRow(1).insertCell(0).innerHTML = status;
    table.rows[0].insertCell().innerHTML = "Expected";
    table.rows[1].insertCell().innerHTML = solution;
    table.rows[0].insertCell().innerHTML = "Actual";
    table.rows[1].insertCell().innerHTML = actual;
  } else {
    table.rows[1].cells[0].innerHTML = status;
    table.rows[1].cells[1].innerHTML = solution;
    table.rows[1].cells[2].innerHTML = actual;
  }
  let classList = table.rows[1].cells[2].classList;
  if (solution === actual) {
    classList.add("correct");
    classList.remove("incorrect");
  } else {
    classList.add("incorrect");
    classList.remove("correct");
  }
}

function checkAssertion() {
  runCode(editor.state.doc.toString());
  let table = document.querySelector("#question > table");
  let resultString = consoleMessages.join("<br>");
  let status = consoleMessages.length == 0 ? "Correct" : "Incorrect";
  if (table.rows.length == 0) {
    table.insertRow(0).insertCell(0).innerHTML = "Status";
    table.insertRow(1).insertCell(0).innerHTML = status;
    table.rows[0].insertCell().innerHTML = "Failed Assertions";
    table.rows[1].insertCell().innerHTML = resultString;
  } else {
    table.rows[1].cells[0].innerHTML = status;
    table.rows[1].cells[1].innerHTML = resultString;
  }
  let classList = table.rows[1].cells[0].classList;
  if (consoleMessages.length == 0) {
    classList.add("correct");
    classList.remove("incorrect");
  } else {
    classList.add("incorrect");
    classList.remove("correct");
  }
}
