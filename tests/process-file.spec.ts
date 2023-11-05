import { describe, it, expect, beforeAll, vitest } from "vitest";
import { ProcessFile } from "../src/process-file";

describe("ProcessPrompt", () => {
  let processFile: ProcessFile;

  beforeAll(() => {
    processFile = new ProcessFile();
  });

  describe("validateCEP", () => {
    it("should return false if CEP was equal to 00000000", () => {
      expect(processFile[`validateCEP`]("00000000")).toBeFalsy();
    });

    it("should return false if CEP has some letter", () => {
      expect(processFile[`validateCEP`]("210000a0")).toBeFalsy();
    });

    it("should return false if CEP has more than 8 characters", () => {
      expect(processFile[`validateCEP`]("000000000")).toBeFalsy();
    });

    it("should return false if CEP has less than 7 characters", () => {
      expect(processFile[`validateCEP`]("000000")).toBeFalsy();
    });

    it("should return true if CEP was valid according validations", () => {
      expect(processFile[`validateCEP`]("49300000")).toBeTruthy();
    });
  });
});
