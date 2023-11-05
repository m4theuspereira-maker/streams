import fs from "fs";
import { Interface } from "readline";
import { ProcessFile } from "./process-file";
import { IInputOrOutputValidation } from "./interfaces/interfaces";

export class ProcessPrompt {
  constructor(
    private readonly reader: Interface,
    private readonly processFile: ProcessFile
  ) {}
  processPrompt(input: string) {
    try {
      const inputValidated = this.validateInputFile(input);

      if (!inputValidated.isValid) {
        throw new Error(inputValidated.message);
      }

      this.reader.question(
        `Agora digite o caminho para a saída dos arquivos. Exemplo: "pastaSaida" ou caso não queria salvar em uma pasta, basta teclar ENTER!\n`,
        (answer) => {
          try {
            const outputFilePathValidated =
              this.validateOutputFilePlath(answer);

            if (!outputFilePathValidated.isValid) {
              throw new Error(outputFilePathValidated.message);
            }

            const outputPath =
              answer === "" ? "planilha" : `./${answer}/planilha`;

            const result = this.processFile.readTextFile(input, outputPath);

            if (result?.isValid === false) {
              throw new Error(result.message);
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

  private validateInputFile(input: string): IInputOrOutputValidation {
    if (!fs.existsSync(input)) {
      return {
        isValid: false,
        message: `❌arquivo "${input}" não encontrado! por favor digite um arquivo existente!❌`
      };
    }

    if (!input.includes(".txt")) {
      return {
        isValid: false,
        message: `❌${input} não aceito! Por favor adicione um arquivo com a extensão ".txt"❌`
      };
    }

    const stats = fs.statSync(input);

    if (stats.size === 0) {
      return {
        isValid: false,
        message: `❌O arquivo ${input} está vazio!❌`
      };
    }

    return { isValid: true };
  }

  private validateOutputFilePlath(path: string): IInputOrOutputValidation {
    if (!path.trim().length) {
      return {
        isValid: true
      };
    }

    if (!fs.existsSync(path.trim())) {
      fs.mkdirSync(path.trim());
    }

    return { isValid: true };
  }
}
