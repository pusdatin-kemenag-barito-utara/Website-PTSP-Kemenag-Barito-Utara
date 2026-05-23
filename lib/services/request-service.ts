import { RequestQueryService } from "./request/request-query";
import { RequestAdminService } from "./request/request-admin";
import { RequestApplicantService } from "./request/request-applicant";

export class RequestService {
  // Queries
  static getPaginatedRequests = RequestQueryService.getPaginatedRequests;
  static searchGlobal = RequestQueryService.searchGlobal;

  // Admin Mutations
  static updateStatus = RequestAdminService.updateStatus;
  static uploadResult = RequestAdminService.uploadResult;
  static deleteRequest = RequestAdminService.deleteRequest;

  // Applicant Mutations
  static createByApplicant = RequestApplicantService.createByApplicant;
  static updateByApplicant = RequestApplicantService.updateByApplicant;
  static deleteByApplicant = RequestApplicantService.deleteByApplicant;
}
