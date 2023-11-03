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
    const invoices: IInvoice[] = [];

    let currentLine = 0;

    reader.on("line", (line: string) => {
      if (currentLine === 0) {
        keys = line.trim().split(";");
      } else {
        const value = line.trim().replace("-", "").split(";");
        const invoice: any = {};

        for (let i = 0; i < keys.length; i++) {
          invoice[keys[i]] = value[i];
        }

        invoices.push(invoice);
      }

      currentLine++;
    });

    reader.on("close", () => {
      this.readCSVFile(outputFile, invoices);
      var duracao = Date.now() - antes;
      console.log(duracao);
    });
  }

  readCSVFile(outputFileName: string, invoices: IInvoice[]) {
    const stream = fs.createWriteStream(outputFileName, "utf-8");

    // Escreve o cabeçalho do CSV
    stream.write("NomeCliente;EnderecoCompleto;ValorFatura;NumeroPaginas\n");

    for (const invoice of invoices) {
      const enderecoCompleto = `${invoice.CEP}, ${invoice.RuaComComplemento}, ${invoice.Cidade}, ${invoice.Estado}`;
      const valorFatura = parseFloat(String(invoice.ValorFatura)).toFixed(2);
      const numeroPaginasPar =
        invoice.NumeroPaginas % 2 === 0
          ? invoice.NumeroPaginas
          : invoice.NumeroPaginas + 1;

      stream.write(
        `${invoice.NomeCliente};${enderecoCompleto};${valorFatura};${numeroPaginasPar}\n`
      );
    }

    stream.end();
  }

  filtrarArquivoDeTexto(
    nomeArquivoEntrada: string,
    nomeArquivoSaida: string
  ): void {
     this.readTextFile(nomeArquivoEntrada, nomeArquivoSaida);
  }
}

const nomeArquivo = "base_hi.txt"; // Substitua pelo nome do seu arquivo
new ProcessFile().filtrarArquivoDeTexto(nomeArquivo, "saida.csv");
