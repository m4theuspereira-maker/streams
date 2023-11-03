import fs from "fs";
import readline from "readline";
import { IInvoice } from "./interfaces/interfaces";

export class ProcessFile {
  readTextFile(inputFile: string, outputFile: string): void {
    var antes = Date.now();
    const streamFile = fs.createReadStream(inputFile, "utf-8");
    const reader = readline.createInterface({
      input: streamFile
    });

    let keys: string[] = [];

    let currentLine = 0;
    const invoicesWith0000CEP: IInvoice[] = [];
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

        if (invoice.CEP === "00000000") {
          invoicesWith0000CEP.push(invoice);
        }

        if (invoice.CEP !== "00000000" && invoice.ValorFatura === 0) {
          invoicesWithValue0.push(invoice);
        }

        if (invoice.CEP !== "00000000" && invoice.NumeroPaginas <= 6) {
          invoicesWithMax6Pages.push(invoice);
        }

        if (invoice.CEP !== "00000000" && invoice.NumeroPaginas <= 12) {
          invoicesWithMax12Pages.push(invoice);
        }

        if (invoice.CEP !== "00000000" && invoice.NumeroPaginas > 12) {
          invoicesWithMoreThan12Pages.push(invoice);
        }
      }

      currentLine++;
    });

    reader.on("close", () => {
      Promise.all([
        this.writeCSVFile(
          `${outputFile}-com-CEP-zerados.csv`,
          invoicesWith0000CEP
        ),
        this.writeCSVFile(
          `${outputFile}-com-ate-6-paginas.csv`,
          invoicesWithMax6Pages
        ),
        this.writeCSVFile(
          `${outputFile}-com-ate-12-paginas.csv`,
          invoicesWithMax12Pages
        ),
        this.writeCSVFile(
          `${outputFile}-com-mais-de12-paginas.csv`,
          invoicesWithMoreThan12Pages
        ),
        this.writeCSVFile(
          `${outputFile}-com-valor-da-fatura-0.csv`,
          invoicesWithValue0
        )
      ]);

      var duracao = Date.now() - antes;
      console.log(duracao);
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
}

const nomeArquivo = "base_hi.txt"; // Substitua pelo nome do seu arquivo
new ProcessFile().readTextFile(nomeArquivo, "saida.csv");
