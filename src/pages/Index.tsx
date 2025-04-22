import React from "react";
import QCDashboard from "../components/QCDashboard/QCDashboard";

const Index: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            QC Device Insight Board
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <QCDashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
