import React, { useState } from "react";
import { QCReport } from "../../types/qc";
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

  const toggleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);
  const pageNumbers = [];

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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

  return (
    <Box
      backgroundColor="surface.background.gray.subtle"
      elevation="lowRaised"
      borderRadius="medium"
      overflow="hidden"
    >
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="data-table">
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
              const isExpanded = expandedRow === report.id;
              const hasMandatoryFailures =
                testSummary.mandatory.passed < testSummary.mandatory.total;

              return (
                <React.Fragment key={report.id}>
                  <tr className={hasMandatoryFailures ? "row-fail" : ""}>
                    <td className="cell-serial">{report.serialNumber}</td>
                    <td>
                      {dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <Box display="flex" flexDirection="column">
                        <div
                          className={hasMandatoryFailures ? "text-fail" : ""}
                        >
                          Mandatory: {testSummary.mandatory.passed}/
                          {testSummary.mandatory.total}
                        </div>
                        <div className="text-muted text-small">
                          Optional: {testSummary.optional.passed}/
                          {testSummary.optional.total}
                        </div>
                      </Box>
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
                          {isExpanded ? "Hide Details" : "Show Details"}
                        </Button>
                      </Box>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6}>
                        <div className="details-container">
                          <div className="details-header">
                            <Text weight="medium" size="medium">
                              Detailed Test Results
                            </Text>
                          </div>
                          <Box padding="spacing.4">
                            <Box
                              display="grid"
                              gridTemplateColumns={{
                                base: "1fr",
                                s: "1fr 1fr",
                              }}
                              gap="spacing.4"
                            >
                              <Box>
                                <Text weight="medium" marginBottom="spacing.2">
                                  Mandatory Tests
                                </Text>
                                <div className="test-list">
                                  {report.testResults
                                    .filter(
                                      (test) => test.testType === "mandatory"
                                    )
                                    .map((test, index, arr) => (
                                      <div
                                        key={test.id}
                                        className={`test-item ${
                                          index < arr.length - 1
                                            ? "test-item-border"
                                            : ""
                                        }`}
                                      >
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="center"
                                        >
                                          <Box>
                                            <Text weight="medium">
                                              {test.name}
                                            </Text>
                                            {test.status === "fail" && (
                                              <div className="text-fail text-small">
                                                {test.errorMessage}
                                              </div>
                                            )}
                                          </Box>
                                          <StatusBadge status={test.status} />
                                        </Box>
                                        <div className="text-muted text-small duration">
                                          Duration: {test.duration}s
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </Box>
                              <Box>
                                <Text weight="medium" marginBottom="spacing.2">
                                  Optional Tests
                                </Text>
                                <div className="test-list">
                                  {report.testResults
                                    .filter(
                                      (test) => test.testType === "optional"
                                    )
                                    .map((test, index, arr) => (
                                      <div
                                        key={test.id}
                                        className={`test-item ${
                                          index < arr.length - 1
                                            ? "test-item-border"
                                            : ""
                                        }`}
                                      >
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="center"
                                        >
                                          <Box>
                                            <Text weight="medium">
                                              {test.name}
                                            </Text>
                                            {test.status === "fail" && (
                                              <div className="text-fail text-small">
                                                {test.errorMessage}
                                              </div>
                                            )}
                                          </Box>
                                          <StatusBadge status={test.status} />
                                        </Box>
                                        <div className="text-muted text-small duration">
                                          Duration: {test.duration}s
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </Box>
                            </Box>
                          </Box>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        {/* Mobile pagination */}
        <Box
          display={{ base: "flex", s: "none" }}
          justifyContent="space-between"
          width="100%"
        >
          <Button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            isDisabled={currentPage === 1}
            variant="tertiary"
            size="small"
          >
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            isDisabled={currentPage === totalPages}
            variant="tertiary"
            size="small"
          >
            Next
          </Button>
        </Box>

        {/* Desktop pagination */}
        <Box
          display={{ base: "none", s: "flex" }}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Text size="small">
            Showing{" "}
            <Text as="span" weight="medium" size="small">
              {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
            </Text>{" "}
            to{" "}
            <Text as="span" weight="medium" size="small">
              {Math.min(currentPage * pageSize, totalItems)}
            </Text>{" "}
            of{" "}
            <Text as="span" weight="medium" size="small">
              {totalItems}
            </Text>{" "}
            results
          </Text>

          <Box display="flex" alignItems="center" gap="spacing.1">
            <Button
              onClick={() => onPageChange(1)}
              isDisabled={currentPage === 1}
              variant="tertiary"
              size="small"
              aria-label="First page"
            >
              ⟨⟨
            </Button>
            <Button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              variant="tertiary"
              size="small"
              aria-label="Previous page"
            >
              ⟨
            </Button>

            {pageNumbers.map((number) => (
              <Button
                key={number}
                onClick={() => onPageChange(number)}
                variant={currentPage === number ? "primary" : "tertiary"}
                size="small"
              >
                {`${number}`}
              </Button>
            ))}

            <Button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              isDisabled={currentPage === totalPages}
              variant="tertiary"
              size="small"
              aria-label="Next page"
            >
              ⟩
            </Button>
            <Button
              onClick={() => onPageChange(totalPages)}
              isDisabled={currentPage === totalPages}
              variant="tertiary"
              size="small"
              aria-label="Last page"
            >
              ⟩⟩
            </Button>
          </Box>
        </Box>
      </div>
    </Box>
  );
};

export default QCTable;
