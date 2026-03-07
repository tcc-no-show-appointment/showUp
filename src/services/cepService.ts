/**
 * @file Service for Brazilian CEP (postal code) lookup using ViaCEP API.
 *
 * API documentation: https://viacep.com.br/
 */
import axios from "axios";
import type { ViaCepResponse } from "../types/models";

const VIACEP_BASE_URL = "https://viacep.com.br/ws";

/**
 * Fetch address information from a Brazilian CEP (postal code).
 *
 * @param cep - CEP with or without formatting (e.g., "01310-100" or "01310100")
 * @throws {Error} If CEP is invalid or not found
 */
export const fetchAddressByCep = async (cep: string): Promise<ViaCepResponse> => {
  // Remove all non-digit characters
  const cleanCep = cep.replace(/\D/g, "");

  // Validate CEP format (must be 8 digits)
  if (cleanCep.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos");
  }

  try {
    const response = await axios.get<ViaCepResponse>(
      `${VIACEP_BASE_URL}/${cleanCep}/json/`,
      {
        timeout: 10000,
      }
    );

    // ViaCEP returns { erro: true } when CEP is not found
    if (response.data.erro) {
      throw new Error("CEP não encontrado");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error("Erro ao buscar CEP. Tente novamente.");
      } else if (error.request) {
        throw new Error("Sem conexão com o serviço de CEP");
      }
    }
    throw error;
  }
};

/**
 * Format a CEP string to standard format (12345-678).
 *
 * @param cep - Raw CEP string
 * @returns Formatted CEP or original if invalid
 */
export const formatCep = (cep: string): string => {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    return cep;
  }

  return `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}`;
};

export const cepService = {
  fetchAddressByCep,
  formatCep,
};

export default cepService;
