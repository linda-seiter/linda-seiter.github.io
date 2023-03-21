import { EditorView, basicSetup } from "codemirror";
import { javascript, esLint } from "@codemirror/lang-javascript";
import { lintGutter, linter } from "@codemirror/lint";
import Linter from "eslint4b-prebuilt";

let code = `let x = 7;
consolelog(x);`;

let editor = new EditorView({
  extensions: [
    linter(esLint(new Linter())),
    lintGutter(),
    basicSetup,
    javascript(),
  ],
  doc: code,
  parent: document.body,
});
