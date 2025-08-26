import { env } from '../../config/env';
import { AuthUtils } from '../../utils/authUtils';

export interface Country {
  name: string;
}

export interface CountryListResponse {
  error: boolean;
  data: Country[];
  message?: string;
}

class CountryService {
  private getAuthToken(): string {
    return AuthUtils.getAuthToken();
  }

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
            Authorization: this.getAuthToken(),
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
