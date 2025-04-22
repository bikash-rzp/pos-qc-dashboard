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
import { Box, Spinner, Text, Button } from "@razorpay/blade/components";

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
    <Box
      minHeight="100vh"
      backgroundColor="surface.background.gray.subtle"
      paddingY="spacing.6"
      paddingX="spacing.4"
    >
      <Box maxWidth="1280px" marginX="auto">
        <QCDashboardHeader
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />

        {isLoading ? (
          <Box
            backgroundColor="surface.background.gray.subtle"
            elevation="lowRaised"
            borderRadius="medium"
            padding="spacing.8"
            textAlign="center"
          >
            <Spinner
              size="medium"
              color="primary"
              accessibilityLabel="Loading"
              marginBottom="spacing.4"
            />
            <Text size="medium">Loading QC reports...</Text>
          </Box>
        ) : (
          <>
            {filteredReports.length === 0 ? (
              <Box
                backgroundColor="surface.background.gray.subtle"
                elevation="lowRaised"
                borderRadius="medium"
                padding="spacing.8"
                textAlign="center"
              >
                <Box marginBottom="spacing.3" />
                <Text size="large" weight="medium" marginBottom="spacing.2">
                  No results found
                </Text>
                <Text size="small" marginBottom="spacing.6">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </Text>
                <Box textAlign="center">
                  <Button
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
                    variant="primary"
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Box>
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
      </Box>
    </Box>
  );
};

export default QCDashboard;
