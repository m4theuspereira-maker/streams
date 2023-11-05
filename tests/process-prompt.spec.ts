import { describe, it, expect, beforeAll, vitest } from "vitest";
import { ProcessPrompt } from "../src/process-prompt";
import { ProcessFile } from "../src/process-file";
import readline from "readline";
import fs from "fs";

describe("ProcessPrompt", () => {
  let processPromp: ProcessPrompt;
  let reader: readline.Interface;

  beforeAll(() => {
    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    processPromp = new ProcessPrompt(reader, new ProcessFile());
  });
  describe("validateInputFile", () => {
    it("should return error if file was not .txt", () => {
      const result = processPromp["validateInputFile"]("mock_file");

      expect(result).toStrictEqual({
        isValid: false,
        message:
          '❌arquivo "mock_file" não encontrado! por favor digite um arquivo existente!❌'
      });
    });

    it("should return error if file was not found", () => {
      const result = processPromp["validateInputFile"]("mock_file.txt");

      expect(result).toStrictEqual({
        isValid: false,
        message:
          '❌arquivo "mock_file.txt" não encontrado! por favor digite um arquivo existente!❌'
      });
    });

    it("should return error if file found was empty", () => {
      vitest.spyOn(fs, "statSync").mockReturnValueOnce({ size: 0 } as any);

      processPromp = new ProcessPrompt(reader, new ProcessFile());

      const result = processPromp["validateInputFile"]("base_hi.txt");

      expect(result).toStrictEqual({
        isValid: false,
        message: "❌O arquivo base_hi.txt está vazio!❌"
      });
    });
  });

  describe("validateOutputFilePlath", () => {
    it("should return true with the path specifyed was an empty string", () => {
      const result = processPromp["validateOutputFilePlath"]("");

      expect(result.isValid).toBeTruthy();
    });

    it("should call mkdir if output folder does not exist", () => {
      vitest.spyOn(fs, "existsSync").mockReturnValueOnce(false);

      const mkdirSpy = vitest
        .spyOn(fs, "mkdirSync")
        .mockReturnValueOnce({} as any);

      new ProcessPrompt(reader, new ProcessFile())["validateOutputFilePlath"](
        "pastaSaida"
      );

      expect(mkdirSpy).toHaveBeenCalled();
    });

    it("should not call mkdir if output folder already exist", () => {
      vitest.spyOn(fs, "existsSync").mockReturnValueOnce(true);

      const mkdirSpy = vitest
        .spyOn(fs, "mkdirSync")
        .mockReturnValueOnce({} as any);

      new ProcessPrompt(reader, new ProcessFile())["validateOutputFilePlath"](
        "pastaSaida"
      );

      expect(mkdirSpy).not.toHaveBeenCalled();
    });
  });
});
