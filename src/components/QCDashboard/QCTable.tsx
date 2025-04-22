import React, { useState } from "react";
import { QCReport, TestResult } from "../../types/qc";
import dayjs from "dayjs";
import {
  exportSingleDeviceToCSV,
  exportSingleDeviceToPDF,
} from "../../utils/export";
import { Box, Text, Button, Badge } from "@razorpay/blade/components";

interface QCTableProps {
  data: QCReport[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const QCTable: React.FC<QCTableProps> = ({
  data,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  const toggleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const toggleTestExpand = (testId: string) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate test result summary
  const getTestResultSummary = (report: QCReport) => {
    const mandatoryTests = report.testResults.filter(
      (t) => t.testType === "mandatory"
    );
    const optionalTests = report.testResults.filter(
      (t) => t.testType === "optional"
    );

    const mandatoryPassed = mandatoryTests.filter(
      (t) => t.status === "pass"
    ).length;
    const optionalPassed = optionalTests.filter(
      (t) => t.status === "pass"
    ).length;

    const mandatoryTotal = mandatoryTests.length;
    const optionalTotal = optionalTests.length;

    return {
      mandatory: { passed: mandatoryPassed, total: mandatoryTotal },
      optional: { passed: optionalPassed, total: optionalTotal },
    };
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color;

    switch (status) {
      case "pass":
        color = "positive";
        break;
      case "fail":
        color = "negative";
        break;
      case "pending":
        color = "notice";
        break;
      case "skipped":
      default:
        color = "neutral";
    }

    return (
      <Badge color={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render test retries
  const renderTestRetries = (test: TestResult) => {
    if (!test.retries || test.retries.length === 0) {
      return null;
    }

    return (
      <div className="test-retries">
        <Text weight="medium" size="small" marginBottom="spacing.2">
          Retry Attempts ({test.retries.length})
        </Text>
        <div className="retries-list">
          {test.retries.map((retry) => (
            <div key={retry.id} className="retry-item">
              <div className="retry-header">
                <Text size="small" weight="medium">
                  Attempt #{retry.attemptNumber} - {dayjs(retry.timestamp).format("HH:mm:ss")}
                </Text>
                <StatusBadge status={retry.status} />
              </div>
              {retry.errorMessage && (
                <div className="retry-error">{retry.errorMessage}</div>
              )}
              <div className="retry-duration">
                Duration: {retry.duration}s
              </div>
              {retry.details && (
                <div className="retry-details">
                  <pre>{retry.details}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a single test item with expandable retries
  const renderTestItem = (test: TestResult) => {
    const hasRetries = test.retries && test.retries.length > 0;
    const isExpanded = expandedTests[test.id] || false;

    return (
      <div key={test.id} className="test-item">
        <div className="test-header">
          <Box display="flex" flexDirection="column" gap="spacing.1" flex="1">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <Text weight="medium">{test.name}</Text>
              {hasRetries && (
                <div
                  className="test-expand-toggle"
                  onClick={() => toggleTestExpand(test.id)}
                >
                  <span className="toggle-icon">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                  <span className="retry-count">{test.retries!.length}</span>
                </div>
              )}
            </Box>
            {test.status === "fail" && test.errorMessage && (
              <div className="test-error">{test.errorMessage}</div>
            )}
          </Box>
          <StatusBadge status={test.status} />
        </div>
        <div className="test-duration">
          Duration: {test.duration}s
        </div>

        {isExpanded && renderTestRetries(test)}
      </div>
    );
  };

  // Render expanded details
  const renderExpandedDetails = (report: QCReport) => {
    if (expandedRow !== report.id) return null;

    return (
      <tr>
        <td colSpan={6}>
          <Box
            padding="spacing.4"
            backgroundColor="surface.background.gray.subtle"
          >
            <Text weight="medium" marginBottom="spacing.4">
              Detailed Test Results
            </Text>

            <div className="tests-container">
              <div className="test-section">
                <Text weight="medium" marginBottom="spacing.3">
                  Mandatory Tests
                </Text>
                <div className="test-list">
                  {report.testResults
                    .filter((test) => test.testType === "mandatory")
                    .map(renderTestItem)}
                </div>
              </div>

              <div className="test-section">
                <Text weight="medium" marginBottom="spacing.3">
                  Optional Tests
                </Text>
                <div className="test-list">
                  {report.testResults
                    .filter((test) => test.testType === "optional")
                    .map(renderTestItem)}
                </div>
              </div>
            </div>
          </Box>
        </td>
      </tr>
    );
  };

  // Custom pagination component
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="spacing.2"
      >
        <Button
          variant="tertiary"
          size="small"
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          aria-label="First page"
        >
          ⟨⟨
        </Button>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
          aria-label="Previous page"
        >
          ⟨
        </Button>

        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={currentPage === number ? "primary" : "tertiary"}
            size="small"
            onClick={() => onPageChange(number)}
          >
            {`${number}`}
          </Button>
        ))}

        <Button
          variant="tertiary"
          size="small"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ⟩
        </Button>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          aria-label="Last page"
        >
          ⟩⟩
        </Button>
      </Box>
    );
  };

  return (
    <Box
      backgroundColor="surface.background.gray.subtle"
      elevation="lowRaised"
      borderRadius="medium"
      overflow="hidden"
    >
      <div className="table-wrapper">
        <table className="blade-table">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Test Timestamp</th>
              <th>Status</th>
              <th>Test Results</th>
              <th>Error Codes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((report) => {
              const testSummary = getTestResultSummary(report);
              const hasMandatoryFailures =
                testSummary.mandatory.passed < testSummary.mandatory.total;

              return (
                <React.Fragment key={report.id}>
                  <tr className={hasMandatoryFailures ? "row-highlight" : ""}>
                    <td>
                      <Text weight="medium">{report.serialNumber}</Text>
                    </td>
                    <td>
                      {dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <div className="test-summary">
                        <div
                          className={hasMandatoryFailures ? "text-error" : ""}
                        >
                          Mandatory: {testSummary.mandatory.passed}/
                          {testSummary.mandatory.total}
                        </div>
                        <div className="text-subtle text-small">
                          Optional: {testSummary.optional.passed}/
                          {testSummary.optional.total}
                        </div>
                      </div>
                    </td>
                    <td>
                      {report.errorCodes.length > 0 ? (
                        <Box display="flex" flexWrap="wrap" gap="spacing.1">
                          {report.errorCodes.map((code) => (
                            <Badge key={code} color="negative" size="small">
                              {code}
                            </Badge>
                          ))}
                        </Box>
                      ) : (
                        <div className="text-success">None</div>
                      )}
                    </td>
                    <td>
                      <Box display="flex" gap="spacing.2">
                        <Button
                          onClick={() => exportSingleDeviceToCSV(report)}
                          variant="tertiary"
                          size="small"
                        >
                          CSV
                        </Button>
                        <Button
                          onClick={() => exportSingleDeviceToPDF(report)}
                          variant="tertiary"
                          size="small"
                        >
                          PDF
                        </Button>
                        <Button
                          onClick={() => toggleRowExpand(report.id)}
                          variant="tertiary"
                          size="small"
                        >
                          {expandedRow === report.id ? "Hide" : "Details"}
                        </Button>
                      </Box>
                    </td>
                  </tr>
                  {renderExpandedDetails(report)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Box padding="spacing.4" display="flex" justifyContent="center">
        {renderPagination()}
      </Box>
    </Box>
  );
};

export default QCTable;
