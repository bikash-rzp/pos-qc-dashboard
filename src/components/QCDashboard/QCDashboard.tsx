import React, { useState, useEffect } from "react";
import QCDashboardHeader from "./QCDashboardHeader";
import QCTable from "./QCTable";
import { FilterOptions, PaginationOptions, QCReport } from "../../types/qc";
import {
  generateMockData,
  filterQCData,
  paginateData,
} from "../../utils/mockData";
import { exportToCSV, exportToPDF } from "../../utils/export";

const QCDashboard: React.FC = () => {
  const [reports, setReports] = useState<QCReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<QCReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and pagination state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "",
    searchTerm: "",
    dateRange: {
      startDate: "",
      endDate: "",
    },
  });

  const [pagination, setPagination] = useState<PaginationOptions>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0,
  });

  const [currentPageData, setCurrentPageData] = useState<QCReport[]>([]);

  // Fetch data (mocked for now)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // In a real application, this would be an API call
      // For now, we'll use our mock data generator
      const data = generateMockData(150);
      setReports(data);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Apply filters whenever reports or filter options change
  useEffect(() => {
    const filtered = filterQCData(reports, filterOptions);
    setFilteredReports(filtered);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalItems: filtered.length,
    }));
  }, [reports, filterOptions]);

  // Update current page data whenever filtered reports or pagination changes
  useEffect(() => {
    const { data, total } = paginateData(
      filteredReports,
      pagination.currentPage,
      pagination.pageSize
    );

    setCurrentPageData(data);
    setPagination((prev) => ({ ...prev, totalItems: total }));
  }, [filteredReports, pagination.currentPage, pagination.pageSize]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Handle exports
  const handleExportCSV = () => {
    exportToCSV(filteredReports);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredReports);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <QCDashboardHeader
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />

        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading QC reports...</p>
          </div>
        ) : (
          <>
            {filteredReports.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No results found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() =>
                      setFilterOptions({
                        status: "",
                        searchTerm: "",
                        dateRange: {
                          startDate: "",
                          endDate: "",
                        },
                      })
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <QCTable
                data={currentPageData}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QCDashboard;
