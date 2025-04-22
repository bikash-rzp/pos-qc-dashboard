import React, { useState } from "react";
import { QCReport } from "../../types/qc";
import dayjs from "dayjs";
import {
  exportSingleDeviceToCSV,
  exportSingleDeviceToPDF,
} from "../../utils/export";

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
    let bgColor = "";

    switch (status) {
      case "pass":
        bgColor = "bg-green-100 text-green-800";
        break;
      case "fail":
        bgColor = "bg-red-100 text-red-800";
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case "skipped":
        bgColor = "bg-gray-100 text-gray-800";
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Serial Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Test Timestamp
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Test Results
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Error Codes
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((report) => {
              const testSummary = getTestResultSummary(report);
              const isExpanded = expandedRow === report.id;
              const hasMandatoryFailures =
                testSummary.mandatory.passed < testSummary.mandatory.total;

              return (
                <React.Fragment key={report.id}>
                  <tr className={hasMandatoryFailures ? "bg-red-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {report.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <div
                          className={`${
                            hasMandatoryFailures
                              ? "text-red-800 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          Mandatory: {testSummary.mandatory.passed}/
                          {testSummary.mandatory.total}
                        </div>
                        <div className="text-gray-500">
                          Optional: {testSummary.optional.passed}/
                          {testSummary.optional.total}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.errorCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {report.errorCodes.map((code) => (
                            <span
                              key={code}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-600">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex items-center">
                      <button
                        onClick={() => exportSingleDeviceToCSV(report)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download CSV"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportSingleDeviceToPDF(report)}
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => toggleRowExpand(report.id)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <h4 className="text-sm font-medium text-gray-900">
                              Detailed Test Results
                            </h4>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2">
                                  Mandatory Tests
                                </h5>
                                <ul className="divide-y divide-gray-200">
                                  {report.testResults
                                    .filter(
                                      (test) => test.testType === "mandatory"
                                    )
                                    .map((test) => (
                                      <li key={test.id} className="py-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm font-medium">
                                            {test.name}
                                            {test.status === "fail" && (
                                              <span className="ml-2 text-xs text-red-600">
                                                - {test.errorMessage}
                                              </span>
                                            )}
                                          </span>
                                          <StatusBadge status={test.status} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Duration: {test.duration}s
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2">
                                  Optional Tests
                                </h5>
                                <ul className="divide-y divide-gray-200">
                                  {report.testResults
                                    .filter(
                                      (test) => test.testType === "optional"
                                    )
                                    .map((test) => (
                                      <li key={test.id} className="py-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm font-medium">
                                            {test.name}
                                            {test.status === "fail" && (
                                              <span className="ml-2 text-xs text-red-600">
                                                - {test.errorMessage}
                                              </span>
                                            )}
                                          </span>
                                          <StatusBadge status={test.status} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Duration: {test.duration}s
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
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
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>

          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">First</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => onPageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === number
                      ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  } text-sm font-medium`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Last</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L6.414 10l3.293 3.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCTable;
