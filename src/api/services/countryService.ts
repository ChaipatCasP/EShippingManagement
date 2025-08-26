import { env } from '../../config/env';

export interface Country {
  name: string;
}

export interface CountryListResponse {
  error: boolean;
  data: Country[];
  message?: string;
}

class CountryService {
  private bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55IjoiSkIiLCJ1c2VybmFtZSI6Imt1c3VtYUBzYW5ndGhvbmdzdWtzaGlwcGluZ3NvbHV0aW9uLmNvLnRoIiwic3VwcGxpZXJDb2RlIjoiNjIzMiIsImlhdCI6MTc1NDI4MDIxMywiZXhwIjoxNzg1ODE2MjEzfQ.1bys3p_-9kQ-DlgWfz7g3m2ap3_0jypyQDF8FUuQIR0`;

  private getFallbackCountries(): Country[] {
    return [
      { name: "Thailand" },
      { name: "China" },
      { name: "Japan" },
      { name: "South Korea" },
      { name: "United States" },
    ];
  }

  async getCountries(): Promise<CountryListResponse> {
    try {
      console.log("🌍 Loading countries from API...");

      const response = await fetch(
        `${env.jagotaApi.baseUrl}/v1/es/eshipping/country-list`,
        {
          method: "GET",
          headers: {
            Authorization: this.bearerToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.error && data.data) {
        console.log("✅ Countries loaded successfully:", data.data.length, "countries");
        return {
          error: false,
          data: data.data,
        };
      } else {
        console.error("❌ Countries API returned error:", data);
        return {
          error: true,
          data: this.getFallbackCountries(),
          message: data.message || "API returned error",
        };
      }
    } catch (error) {
      console.error("❌ Error loading countries:", error);
      return {
        error: true,
        data: this.getFallbackCountries(),
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const countryService = new CountryService();
