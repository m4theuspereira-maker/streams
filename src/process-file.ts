import fs from "fs";
import readline from "readline";
import { IInputOrOutputValidation, IInvoice } from "./interfaces/interfaces";

export class ProcessFile {
  readTextFile(
    inputFile: string,
    outputFile: string
  ): void | IInputOrOutputValidation {
    const streamFile = fs.createReadStream(inputFile, "utf-8");
    const reader = readline.createInterface({
      input: streamFile
    });

    let keys: string[] = [];

    let currentLine = 0;
    const invoicesWithMax6Pages: IInvoice[] = [];
    const invoicesWithMax12Pages: IInvoice[] = [];
    const invoicesWithMoreThan12Pages: IInvoice[] = [];
    const invoicesWithValue0: IInvoice[] = [];

    reader.on("line", (line: string) => {
      if (currentLine === 0) {
        keys = line.trim().split(";");
      } else {
        const value = line.trim().replace("-", "").split(";");
        const invoice: any = {};

        for (let i = 0; i < keys.length; i++) {
          invoice[keys[i]] = value[i].trim();
          if (keys[i] === "NumeroPaginas") {
            invoice[keys[i]] =
              Number(value[i]) % 2 === 0
                ? Number(value[i])
                : Number(value[i]) + 1;
          }

          if (keys[i] === "ValorFatura") {
            invoice[keys[i]] = Number(value[i]);
          }
        }

        const isCepValid = this.validateCEP(invoice.CEP);

        if (isCepValid && invoice.ValorFatura === 0) {
          invoicesWithValue0.push(invoice);
        }

        if (isCepValid && invoice.NumeroPaginas <= 6) {
          invoicesWithMax6Pages.push(invoice);
        }

        if (isCepValid && invoice.NumeroPaginas <= 12) {
          invoicesWithMax12Pages.push(invoice);
        }

        if (isCepValid && invoice.NumeroPaginas > 12) {
          invoicesWithMoreThan12Pages.push(invoice);
        }
      }

      currentLine++;
    });

    reader.on("close", () => {
      [
        {
          outputName: `${outputFile}-com-ate-6-paginas.csv`,
          invoices: invoicesWithMax6Pages
        },
        {
          outputName: `${outputFile}-com-ate-12-paginas.csv`,
          invoices: invoicesWithMax12Pages
        },
        {
          outputName: `${outputFile}-com-mais-de-12-paginas.csv`,
          invoices: invoicesWithMoreThan12Pages
        },
        {
          outputName: `${outputFile}-com-valor-da-fatura-0.csv`,
          invoices: invoicesWithValue0
        }
      ].forEach(({ outputName, invoices }) => {
        this.writeCSVFile(outputName, invoices);
      });
    });
  }

  writeCSVFile(outputFileName: string, invoices: IInvoice[]) {
    const stream = fs.createWriteStream(outputFileName, "utf-8");

    stream.write("NomeCliente;EnderecoCompleto;ValorFatura;NumeroPaginas\n");

    for (const invoice of invoices) {
      const enderecoCompleto = `${
        invoice.CEP
      }, ${invoice.RuaComComplemento.trim()}, ${invoice.Cidade}, ${
        invoice.Estado
      }`;
      const valorFatura = parseFloat(String(invoice.ValorFatura)).toFixed(2);

      stream.write(
        `${invoice.NomeCliente};${enderecoCompleto.trim()};${valorFatura};${
          invoice.NumeroPaginas
        }\n`
      );
    }

    stream.end();
  }

  private validateCEP(cep: string): boolean {
    cep = cep.trim();

    const hasOnlyNumbers = /^[0-9]+$/;

    const invalidCEP =
      cep.length > 8 ||
      cep.length < 7 ||
      !hasOnlyNumbers.test(cep) ||
      cep === "00000000";

    return !invalidCEP;
  }
}
