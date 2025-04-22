import { QCReport, TestRetry } from "../types/qc";
import dayjs from "dayjs";

// Generate random test retries
const generateTestRetries = (testName: string, finalStatus: "pass" | "fail" | "skipped"): TestRetry[] => {
  // Only generate retries for failed tests or with a small chance for passed tests
  if (finalStatus === 'skipped' || (finalStatus === 'pass' && Math.random() > 0.3)) {
    return [];
  }

  const retryCount = Math.floor(Math.random() * 3) + 1;
  const retries: TestRetry[] = [];

  for (let i = 0; i < retryCount; i++) {
    const isLastRetry = i === retryCount - 1;
    const status = isLastRetry ? finalStatus : "fail";
    const minutesAgo = (retryCount - i) * 2; // Spaced 2 minutes apart

    retries.push({
      id: `retry-${Math.random().toString(36).substring(2, 9)}`,
      attemptNumber: i + 1,
      status: status as "pass" | "fail" | "skipped",
      errorMessage: status === "fail" ? `${testName} failed on attempt #${i + 1}` : undefined,
      duration: Math.floor(Math.random() * 20) + 5,
      timestamp: dayjs().subtract(minutesAgo, "minute").toISOString(),
      details: status === "fail" ? generateTestDetails(testName, i + 1) : undefined
    });
  }

  return retries;
};

// Generate random test details/logs
const generateTestDetails = (testName: string, attempt: number): string => {
  const logLines = [
    `[INFO] Starting ${testName} - Attempt #${attempt}`,
    `[INFO] Initializing test parameters...`,
    `[DEBUG] Check connection: OK`,
  ];

  if (Math.random() > 0.5) {
    logLines.push(`[WARNING] Response time slower than expected: 2500ms`);
  }

  logLines.push(`[ERROR] Test failed: timeout waiting for response`);
  logLines.push(`[ERROR] Connection lost during ${testName.toLowerCase()} operation`);
  logLines.push(`[INFO] Test ${testName} complete with status: FAILED`);

  return logLines.join('\n');
};

// Generate random test results for a device
const generateTestResults = (pass: boolean) => {
  const testTypes = [
    "Hardware Test",
    "Software Test",
    "Connectivity Test",
    "Battery Test",
    "Display Test",
    "Payment Processing",
    "Security Check",
    "Thermal Printer Test",
  ];

  return testTypes.map((name, index) => {
    const isMandatory = index < 5;
    const status = pass ? "pass" : Math.random() > 0.3 ? "pass" : "fail";

    return {
      id: `test-${Math.random().toString(36).substring(2, 9)}`,
      name,
      status: status as "pass" | "fail" | "skipped",
      errorMessage:
        status === "fail"
          ? "Test failed to meet required parameters"
          : undefined,
      testType: isMandatory ? ("mandatory" as const) : ("optional" as const),
      duration: Math.floor(Math.random() * 60) + 10,
      retries: generateTestRetries(name, status as "pass" | "fail" | "skipped")
    };
  });
};

// Generate random error codes
const generateErrorCodes = (status: "pass" | "fail" | "pending"): string[] => {
  if (status === "pass") return [];

  const possibleErrors = [
    "E001",
    "E102",
    "E205",
    "E311",
    "E420",
    "E507",
    "E615",
    "E723",
  ];
  const count = status === "fail" ? Math.floor(Math.random() * 3) + 1 : 0;

  return Array.from(
    { length: count },
    () => possibleErrors[Math.floor(Math.random() * possibleErrors.length)]
  );
};

// Generate a mock QC report dataset
export const generateMockData = (count = 100): QCReport[] => {
  const reports: QCReport[] = [];

  // Generate reports across the last 30 days
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = dayjs()
      .subtract(daysAgo, "day")
      .subtract(hoursAgo, "hour")
      .toISOString();

    const status =
      Math.random() > 0.8 ? "fail" : Math.random() > 0.1 ? "pass" : "pending";

    reports.push({
      id: `qc-${Math.random().toString(36).substring(2, 9)}`,
      serialNumber: `POS-${Math.floor(10000 + Math.random() * 90000)}`,
      testTimestamp: timestamp,
      status: status as "pass" | "fail" | "pending",
      errorCodes: generateErrorCodes(status as "pass" | "fail" | "pending"),
      testResults: generateTestResults(status === "pass"),
    });
  }

  // Sort by test timestamp in descending order (newest first)
  return reports.sort(
    (a, b) =>
      new Date(b.testTimestamp).getTime() - new Date(a.testTimestamp).getTime()
  );
};

// Filter QC data based on filter options
export const filterQCData = (
  data: QCReport[],
  {
    status,
    dateRange,
    searchTerm,
  }: {
    status?: string;
    dateRange?: { startDate?: string; endDate?: string };
    searchTerm?: string;
  }
) => {
  return data.filter((report) => {
    // Filter by status
    if (status && report.status !== status) return false;

    // Filter by date range
    if (dateRange) {
      const reportDate = dayjs(report.testTimestamp);
      if (
        dateRange.startDate &&
        reportDate.isBefore(dayjs(dateRange.startDate))
      )
        return false;
      if (dateRange.endDate && reportDate.isAfter(dayjs(dateRange.endDate)))
        return false;
    }

    // Filter by search term (search in serial number)
    if (
      searchTerm &&
      !report.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

// Paginate data
export const paginateData = (
  data: QCReport[],
  page: number,
  pageSize: number
): { data: QCReport[]; total: number } => {
  const startIndex = (page - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    total: data.length,
  };
};
