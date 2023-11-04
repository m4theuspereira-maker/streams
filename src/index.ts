import readline from "readline";
import { ProcessFile } from "./process-file";
import { ProcessPrompt } from "./process-prompt";

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const processFile = new ProcessFile();
const processPrompt = new ProcessPrompt(reader, processFile);

reader.question(`Digite o arquivo de entrada: \n`, (answer) => {
  processPrompt.processPrompt(answer.trim());
});
