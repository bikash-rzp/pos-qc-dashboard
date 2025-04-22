import { saveAs } from "file-saver";
import { QCReport, TestResult } from "../types/qc";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

// Export single device data as CSV
export const exportSingleDeviceToCSV = (report: QCReport) => {
  let csvContent = "Test Name,Test Type,Status,Duration (s),Error Message\n";

  report.testResults.forEach((test) => {
    csvContent +=
      [
        test.name,
        test.testType,
        test.status,
        test.duration,
        test.errorMessage || "None",
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
    ]);
  };

  // Mandatory Tests Table
  doc.text("Mandatory Tests", 14, 68);
  autoTable(doc, {
    startY: 72,
    head: [["Test Name", "Status", "Duration", "Error Message"]],
    body: createTestTable(mandatoryTests),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Optional Tests Table
  const finalY = (doc as any).lastAutoTable.finalY || 72;
  doc.text("Optional Tests", 14, finalY + 10);
  autoTable(doc, {
    startY: finalY + 14,
    head: [["Test Name", "Status", "Duration", "Error Message"]],
    body: createTestTable(optionalTests),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 204, 113] },
  });

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
    "Serial Number,Test Timestamp,Status,Error Codes,Mandatory Tests Passed,Optional Tests Passed\n";

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

    csvContent +=
      [
        report.serialNumber,
        dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm"),
        report.status,
        report.errorCodes.join(" | "),
        `${mandatoryPassed}/${mandatoryTests.length}`,
        `${optionalPassed}/${optionalTests.length}`,
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

    return [
      report.serialNumber,
      dayjs(report.testTimestamp).format("YYYY-MM-DD HH:mm"),
      report.status.toUpperCase(),
      report.errorCodes.join(", ") || "None",
      `${mandatoryPassed}/${mandatoryTests.length}`,
      `${optionalPassed}/${optionalTests.length}`,
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
      0: { cellWidth: 30 },
      1: { cellWidth: 28 },
      2: { cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
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
