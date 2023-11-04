import fs from "fs";
import readline from "readline";

import { ProcessFile } from "./process.file";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// new ProcessFile().readTextFile(nomeArquivo, "./misera/saida.csv");

function processPrompt(input: string) {
  try {
    if (!fs.existsSync(input)) {
      throw new Error(
        `arquivo "${input}" não encontrado! por favor digite um arquivo existente!`
      );
    }

    if (!input.includes(".txt")) {
      throw new Error(
        `${input} não aceito! Por favor adicione um arquivo com a extensão ".txt"`
      );
    }

    rl.question(
      `Agora digite o caminho para a saída dos arquivos.
exemplo "./pastaSaida/" ou caso não queria salvar em uma pasta basta digita "."!\n`,
      (answer) => {
        try {
          if (!answer.includes(`./`) && !answer.includes(".")) {
            throw new Error(
              `caminho não encontrado! por favor, digite o caminho de saída conforme o exemplo: "./pastaSaida/" ou "."`
            );
          }

          if (!fs.existsSync(answer.trim())) {
            fs.mkdirSync(answer.trim());
          }

          const result = new ProcessFile().readTextFile(input, "./saida.csv");

          if (result?.isValid === false) {
            throw new Error(
              `O arquivo ${input} não corresponde ao padrão, ele deve ter os seguintes dados na primeira linha "NomeCliente;CEP;RuaComComplemento;Bairro;Cidade;Estado;ValorFatura;NumeroPaginas"`
            );
          }

          console.log("Processamento feito com sucesso!");
          rl.close();
        } catch (error: any) {
          console.log(error.message);
          rl.question("Digite o arquivo de entrada ", (answer) => {
            processPrompt(answer.trim());
          });
        }
      }
    );
  } catch (error: any) {
    console.log(error.message);
    rl.question("Digite o arquivo de entrada ", (answer) => {
      processPrompt(answer.trim());
    });
  }
}

rl.question("Digite o arquivo de entrada ", (answer) => {
  processPrompt(answer.trim());
});

// const inputFilePath = args(process.argv.slice(2))._.at(0);
// const socorro = fs.openSync(inputFilePath!, "r");
// console.log(socorro);
// async function a() {
//   const { inputFilePath } = await inquirer.prompt({
//     message: "escolha o arquivo de entrada",
//     type: "input",
//     name: "inputFilePath"
//   });

//   console.log(inputFilePath);
// }

// a();
