export interface Student {
  applicationNumber: string;
  name: string;
  COP: string;
  sgpaValues: string[];
  dob?: string;
}

export interface ParseResult {
  success: boolean;
  applicationNumber: string;
  name: string;
  COP: string;
  sgpaValues: string[];
}

export interface ViewStateParams {
  viewState: string;
  viewStateGenerator: string;
  eventValidation: string;
}