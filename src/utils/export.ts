import { saveAs } from "file-saver";
import { QCReport, TestResult, TestRetry } from "../types/qc";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

// Format retry details for export
const formatRetryDetails = (retry: TestRetry): string => {
  return `Attempt #${retry.attemptNumber} - ${dayjs(retry.timestamp).format("HH:mm:ss")} - ${retry.status.toUpperCase()} - ${retry.duration}s${retry.errorMessage ? ` - Error: ${retry.errorMessage}` : ''}`;
};

// Export single device data as CSV
export const exportSingleDeviceToCSV = (report: QCReport) => {
  let csvContent = "Test Name,Test Type,Status,Duration (s),Error Message,Retry Details\n";

  report.testResults.forEach((test) => {
    const retryDetails = test.retries && test.retries.length > 0
      ? test.retries.map(formatRetryDetails).join(' | ')
      : "No retries";

    csvContent +=
      [
        test.name,
        test.testType,
        test.status,
        test.duration,
        test.errorMessage || "None",
        retryDetails
      ].join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(
    blob,
    `qc-report-${report.serialNumber}-${dayjs(report.testTimestamp).format(
      "YYYY-MM-DD"
    )}.csv`
  );
};

// Export single device data as PDF
export const exportSingleDeviceToPDF = (report: QCReport) => {
  const doc = new jsPDF();

  // Add title and device info
  doc.setFontSize(18);
  doc.text(`Device QC Report - ${report.serialNumber}`, 14, 22);
  doc.setFontSize(11);
  doc.text(
    `Test Date: ${dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm")}`,
    14,
    32
  );
  doc.text(`Status: ${report.status.toUpperCase()}`, 14, 40);

  if (report.errorCodes.length > 0) {
    doc.text("Error Codes:", 14, 48);
    doc.setTextColor(255, 0, 0);
    doc.text(report.errorCodes.join(", "), 14, 56);
    doc.setTextColor(0, 0, 0);
  }

  // Add test results tables
  const mandatoryTests = report.testResults.filter(
    (test) => test.testType === "mandatory"
  );
  const optionalTests = report.testResults.filter(
    (test) => test.testType === "optional"
  );

  // Function to create test results table data
  const createTestTable = (tests: TestResult[]) => {
    return tests.map((test) => [
      test.name,
      test.status.toUpperCase(),
      `${test.duration}s`,
      test.errorMessage || "None",
      test.retries && test.retries.length > 0 ? `${test.retries.length} retries` : "No retries"
    ]);
  };

  // Mandatory Tests Table
  doc.text("Mandatory Tests", 14, 68);
  autoTable(doc, {
    startY: 72,
    head: [["Test Name", "Status", "Duration", "Error Message", "Retries"]],
    body: createTestTable(mandatoryTests),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Optional Tests Table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 72;
  doc.text("Optional Tests", 14, finalY + 10);
  autoTable(doc, {
    startY: finalY + 14,
    head: [["Test Name", "Status", "Duration", "Error Message", "Retries"]],
    body: createTestTable(optionalTests),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 204, 113] },
  });

  // Add detailed retry information for each test with retries
  let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  const testsWithRetries = report.testResults.filter(test => test.retries && test.retries.length > 0);

  if (testsWithRetries.length > 0) {
    doc.setFontSize(14);
    doc.text("Retry Details", 14, currentY);
    currentY += 10;
    doc.setFontSize(10);

    testsWithRetries.forEach(test => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.text(`${test.name} (${test.testType}) - ${test.status.toUpperCase()}`, 14, currentY);
      currentY += 6;
      doc.setFontSize(9);

      test.retries!.forEach((retry, index) => {
        // Check if we need a new page
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(`Attempt #${retry.attemptNumber} - ${dayjs(retry.timestamp).format("HH:mm:ss")}`, 20, currentY);
        currentY += 4;
        doc.text(`Status: ${retry.status.toUpperCase()} - Duration: ${retry.duration}s`, 20, currentY);
        currentY += 4;

        if (retry.errorMessage) {
          // Wrap error message if needed
          const errorLines = doc.splitTextToSize(retry.errorMessage, 170);
          doc.setTextColor(255, 0, 0);
          errorLines.forEach(line => {
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }
            doc.text(line, 20, currentY);
            currentY += 4;
          });
          doc.setTextColor(0, 0, 0);
        }

        // Add log details if available
        if (retry.details) {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          doc.text("Log details:", 20, currentY);
          currentY += 4;

          const logLines = retry.details.split('\n');
          doc.setFontSize(7);
          logLines.forEach(line => {
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }
            doc.text(line, 24, currentY);
            currentY += 3;
          });
          doc.setFontSize(9);
        }

        currentY += 6;
      });

      currentY += 8;
    });
  }

  // Save the PDF
  doc.save(
    `qc-report-${report.serialNumber}-${dayjs(report.testTimestamp).format(
      "YYYY-MM-DD"
    )}.pdf`
  );
};

// Export data as CSV
export const exportToCSV = (data: QCReport[]) => {
  // Create CSV headers
  let csvContent =
    "Serial Number,Test Timestamp,Status,Error Codes,Mandatory Tests Passed,Optional Tests Passed,Tests with Retries\n";

  // Add each report as a row
  data.forEach((report) => {
    const mandatoryTests = report.testResults.filter(
      (test) => test.testType === "mandatory"
    );
    const optionalTests = report.testResults.filter(
      (test) => test.testType === "optional"
    );
    const mandatoryPassed = mandatoryTests.filter(
      (test) => test.status === "pass"
    ).length;
    const optionalPassed = optionalTests.filter(
      (test) => test.status === "pass"
    ).length;

    // Count tests with retries
    const testsWithRetries = report.testResults.filter(test =>
      test.retries && test.retries.length > 0
    ).length;

    csvContent +=
      [
        report.serialNumber,
        dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm"),
        report.status,
        report.errorCodes.join(" | "),
        `${mandatoryPassed}/${mandatoryTests.length}`,
        `${optionalPassed}/${optionalTests.length}`,
        testsWithRetries
      ].join(",") + "\n";
  });

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `qc-report-${new Date().toISOString().split("T")[0]}.csv`);
};

// Export data as PDF
export const exportToPDF = (data: QCReport[]) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("POS Devices QC Report", 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 14, 30);

  // Prepare table data
  const tableRows = data.map((report) => {
    const mandatoryTests = report.testResults.filter(
      (test) => test.testType === "mandatory"
    );
    const optionalTests = report.testResults.filter(
      (test) => test.testType === "optional"
    );
    const mandatoryPassed = mandatoryTests.filter(
      (test) => test.status === "pass"
    ).length;
    const optionalPassed = optionalTests.filter(
      (test) => test.status === "pass"
    ).length;

    // Count tests with retries
    const testsWithRetries = report.testResults.filter(test =>
      test.retries && test.retries.length > 0
    ).length;

    return [
      report.serialNumber,
      dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm"),
      report.status.toUpperCase(),
      report.errorCodes.join(", ") || "None",
      `${mandatoryPassed}/${mandatoryTests.length}`,
      `${optionalPassed}/${optionalTests.length}`,
      testsWithRetries > 0 ? `${testsWithRetries} tests` : "None"
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [
      [
        "Serial Number",
        "Test Date",
        "Status",
        "Error Codes",
        "Mandatory Tests",
        "Optional Tests",
        "Tests with Retries"
      ],
    ],
    body: tableRows,
    styles: {
      cellPadding: 3,
      fontSize: 10,
      lineColor: [44, 62, 80],
      lineWidth: 0.25,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 18 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 22 },
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Save the PDF
  doc.save(`qc-report-${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export single device data as CSV with detailed test retries
export const exportSingleDeviceToDetailedCSV = (report: QCReport) => {
  // First create a CSV with main test data
  let csvContent = "Test Name,Test Type,Status,Duration (s),Error Message,Number of Retries\n";

  // Add each test
  report.testResults.forEach((test) => {
    const retryCount = test.retries?.length || 0;

    csvContent +=
      [
        test.name,
        test.testType,
        test.status,
        test.duration,
        test.errorMessage || "None",
        retryCount
      ].join(",") + "\n";
  });

  // Add a separator
  csvContent += "\n\nRETRY DETAILS\n\n";
  csvContent += "Test Name,Retry Number,Timestamp,Status,Duration (s),Error Message\n";

  // Add detailed retry information for each test
  report.testResults.forEach((test) => {
    if (test.retries && test.retries.length > 0) {
      test.retries.forEach((retry) => {
        csvContent +=
          [
            test.name,
            retry.attemptNumber,
            dayjs(retry.timestamp).format("YYYY-MM-DD HH:mm:ss"),
            retry.status,
            retry.duration,
            retry.errorMessage || "None"
          ].join(",") + "\n";
      });
    }
  });

  // Add a separator
  csvContent += "\n\nDETAILED LOG DATA\n\n";

  // Add detailed log information for each retry that has details
  report.testResults.forEach((test) => {
    if (test.retries && test.retries.length > 0) {
      test.retries.forEach((retry) => {
        if (retry.details) {
          csvContent += `\nTest: ${test.name}, Attempt #${retry.attemptNumber}\n`;
          csvContent += "LOG BEGIN\n";
          csvContent += retry.details;
          csvContent += "\nLOG END\n";
        }
      });
    }
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(
    blob,
    `qc-report-detailed-${report.serialNumber}-${dayjs(report.testTimestamp).format(
      "YYYY-MM-DD"
    )}.csv`
  );
};
