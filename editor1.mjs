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
let result = document.querySelector("#result").contentWindow.document;

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
  try {
    let code = editor.state.doc.toString();
    Function(code)(window);
  } catch (err) {
    console.error(err);
  } finally {
    let logContents = consoleMessages.join("<br>");
    result.open();
    result.write(logContents);
    result.close();
  }
});
