import React from "react";
import { FilterOptions } from "../../types/qc";
import { Box, Heading, Button, TextInput } from "@razorpay/blade/components";

interface QCDashboardHeaderProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  filterOptions: FilterOptions;
  setFilterOptions: (filters: FilterOptions) => void;
}

const QCDashboardHeader: React.FC<QCDashboardHeaderProps> = ({
  onExportCSV,
  onExportPDF,
  filterOptions,
  setFilterOptions,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({ ...filterOptions, searchTerm: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions({
      ...filterOptions,
      status: e.target.value as "" | "pass" | "fail" | "pending",
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({
      ...filterOptions,
      dateRange: {
        ...filterOptions.dateRange,
        startDate: e.target.value,
      },
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({
      ...filterOptions,
      dateRange: {
        ...filterOptions.dateRange,
        endDate: e.target.value,
      },
    });
  };

  const clearFilters = () => {
    setFilterOptions({
      status: "",
      searchTerm: "",
      dateRange: {
        startDate: "",
        endDate: "",
      },
    });
  };

  return (
    <Box
      backgroundColor="surface.background.gray.subtle"
      elevation="lowRaised"
      borderRadius="medium"
      padding="spacing.4"
      marginBottom="spacing.6"
    >
      <Box
        display="flex"
        flexDirection={{ base: "column", s: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", s: "center" }}
        marginBottom="spacing.6"
      >
        <Heading
          size="xlarge"
          marginBottom={{ base: "spacing.4", s: "spacing.0" }}
        >
          POS Device QC Dashboard
        </Heading>

        <Box display="flex" gap="spacing.3">
          <Button variant="primary" onClick={onExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={onExportPDF}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", m: "repeat(4, 1fr)" }}
        gap="spacing.4"
      >
        <Box>
          <Box as="label" marginBottom="spacing.1" display="block">
            Search Serial Number
          </Box>
          <input
            type="text"
            id="search"
            value={filterOptions.searchTerm || ""}
            onChange={handleSearchChange}
            placeholder="Enter serial number..."
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          />
        </Box>

        <Box>
          <Box as="label" marginBottom="spacing.1" display="block">
            Status
          </Box>
          <select
            id="status"
            value={filterOptions.status || ""}
            onChange={handleStatusChange}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          >
            <option value="">All Statuses</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="pending">Pending</option>
          </select>
        </Box>

        <Box>
          <Box as="label" marginBottom="spacing.1" display="block">
            Start Date
          </Box>
          <input
            type="date"
            id="startDate"
            value={filterOptions.dateRange?.startDate || ""}
            onChange={handleStartDateChange}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          />
        </Box>

        <Box>
          <Box as="label" marginBottom="spacing.1" display="block">
            End Date
          </Box>
          <input
            type="date"
            id="endDate"
            value={filterOptions.dateRange?.endDate || ""}
            onChange={handleEndDateChange}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          />
        </Box>
      </Box>

      <Box marginTop="spacing.4" textAlign="right">
        <Button variant="tertiary" onClick={clearFilters} size="small">
          Clear Filters
        </Button>
      </Box>
    </Box>
  );
};

export default QCDashboardHeader;
