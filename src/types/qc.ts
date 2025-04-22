export interface QCReport {
  id: string;
  serialNumber: string;
  testTimestamp: string;
  status: "pass" | "fail" | "pending";
  errorCodes: string[];
  testResults: TestResult[];
}

export interface TestResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "skipped";
  errorMessage?: string;
  testType: "mandatory" | "optional";
  duration: number;
  retries?: TestRetry[];
}

export interface TestRetry {
  id: string;
  attemptNumber: number;
  status: "pass" | "fail" | "skipped";
  errorMessage?: string;
  duration: number;
  timestamp: string;
  details?: string;
}

export interface FilterOptions {
  status?: "pass" | "fail" | "pending" | "";
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  searchTerm?: string;
}

export interface SortOptions {
  field: keyof QCReport | "";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
