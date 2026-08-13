import { fetchAPI } from "@/lib/api";

export class RequestApplicantService {
  /**
   * Create a new request by an applicant via Golang Backend API
   */
  static async createByApplicant(params: {
    userId: string;
    serviceId: bigint;
    serviceItemId: bigint;
    formData: FormData;
  }) {
    const { serviceId, serviceItemId, formData } = params;

    // Convert FormData to plain object for API transmission
    const body: Record<string, any> = {
      serviceId: Number(serviceId),
      serviceItemId: Number(serviceItemId),
    };

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        body[key] = value;
      }
    });

    const res = await fetchAPI<any>("/requests", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return res.data;
  }
}
