import fs from "fs";
import { Interface } from "readline";
import { ProcessFile } from "./process-file";

export class ProcessPrompt {
  constructor(
    private readonly reader: Interface,
    private readonly processFile: ProcessFile
  ) {}
  processPrompt(input: string) {
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

      this.reader.question(
        `Agora digite o caminho para a saída dos arquivos. Exemplo: "./pastaSaida/" ou caso não queria salvar em uma pasta basta digita "."!\n`,
        (answer) => {
          try {
            if (
              !answer.trim().startsWith("./") ||
              !answer.trim().endsWith(`/`) ||
              answer.trim() != "."
            ) {
              throw new Error(
                `caminho não encontrado! por favor, digite o caminho de saída conforme o exemplo: "./pastaSaida/" ou "."`
              );
            }

            if (!fs.existsSync(answer.trim())) {
              fs.mkdirSync(answer.trim());
            }

            const result = this.processFile.readTextFile(input, "./saida.csv");

            if (result?.isValid === false) {
              throw new Error(
                `O arquivo ${input} não corresponde ao padrão, ele deve ter os seguintes dados na primeira linha "NomeCliente;CEP;RuaComComplemento;Bairro;Cidade;Estado;ValorFatura;NumeroPaginas"`
              );
            }

            console.log("Processamento feito com sucesso!");
            this.reader.close();
          } catch (error: any) {
            console.log(error.message);
            this.reader.question(
              `Digite o arquivo de entrada: \n`,
              (answer) => {
                this.processPrompt(answer.trim());
              }
            );
          }
        }
      );
    } catch (error: any) {
      console.log(error.message);
      this.reader.question(`Digite o arquivo de entrada: \n`, (answer) => {
        this.processPrompt(answer.trim());
      });
    }
  }
}
