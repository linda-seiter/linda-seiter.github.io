import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

let code = `console.log("hi");`;

let editor = new EditorView({
  state: EditorState.create({
    extensions: [basicSetup, javascript()],
    doc: code,
  }),
  parent: document.querySelector("#editor"),
});

let logBackup = console.log;
let assertBackup = console.assert;
let consoleMessages = [];

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

document.querySelector("#run").addEventListener("click", function () {
  console.clear();
  consoleMessages = [];
  let expectedMessages = ["hi", "bye"];

  try {
    let code = editor.state.doc.toString();
    Function(code)(window);
  } catch (err) {
    console.error(err);
  } finally {
    let actualContents = consoleMessages.join("<br>");
    document.querySelector("#actual").innerHTML = actualContents;

    let expectedContents = expectedMessages.join("<br>");
    document.querySelector("#expected").innerHTML = expectedContents;

    document.querySelector("#result_table").style.display = "block";

    let status = document.querySelector("#status");
    if (expectedMessages.toString() == consoleMessages.toString()) {
      status.textContent = "CORRECT";
      status.style.backgroundColor = "lightgreen";
    } else {
      status.textContent = "INCORRECT";
      status.style.backgroundColor = "lightcoral";
    }
  }
});
