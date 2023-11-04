export interface IInvoice {
  NomeCliente: string;
  CEP: string;
  RuaComComplemento: string;
  Bairro: string;
  Cidade: string;
  Estado: string;
  ValorFatura: number;
  NumeroPaginas: number;
}

export interface IInputOrOutputValidation {
  isValid: boolean;
  message?: string;
}
