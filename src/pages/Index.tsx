import React from "react";
import QCDashboard from "../components/QCDashboard/QCDashboard";
import { Box, Heading } from "@razorpay/blade/components";

const Index: React.FC = () => {
  return (
    <Box backgroundColor="surface.background.gray.subtle">
      <Box backgroundColor="surface.background.gray.subtle" elevation="lowRaised">
        <Box maxWidth="1280px" marginX="auto" paddingY="spacing.4" paddingX="spacing.4">
          <Heading size="xlarge">
            QC Device Insight Board
          </Heading>
        </Box>
      </Box>
      <Box>
        <Box maxWidth="1280px" marginX="auto" paddingY="spacing.6" paddingX={{ base: "spacing.4", s: "spacing.6", l: "spacing.8" }}>
          <QCDashboard />
        </Box>
      </Box>
    </Box>
  );
};

export default Index;
