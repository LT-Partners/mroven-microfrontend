import { ApiResponse } from "../types";

const BASE_URL = process.env.API_URL || "http://localhost:3000/api";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    throw new Error(`API call failed: ${error}`);
  }
}
