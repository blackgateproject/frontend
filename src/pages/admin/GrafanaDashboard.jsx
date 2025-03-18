import React from "react";
import Sidebar from "../../components/Sidebar";
import { grafanaHost,grafanaPort } from "../../utils/readEnv";
const GrafanaDashboard = () => {
  // Get the Grafana token and scanId (modify as per your auth mechanism)
  // const bearerToken = sessionStorage.getItem("access_token") || "";
  // const scanId = sessionStorage.getItem("scan_id") || ""; // Ensure scanId is stored in sessionStorage
  const bearerToken = "glsa_PEZcopwSHn6bbUPUxsENkhqaPU9uDx6e_ad04e6b4"; // Replace with actual token
  const scanId = "12345"; // Replace with actual scanId

  // Grafana iframe URL
  // const grafanaUrl = `http://localhost:3000/d/aeer5uzx6bvuoc/new-dashboard-2?orgId=1&var-bearerToken=${bearerToken}&var-scanId=${scanId}&from=now-6h&to=now&timezone=browser&kiosk`;
  // Abdullah grafana
  // const grafanaUrl = `http://localhost:3000/public-dashboards/5c6de844c29a4783a657cb4d8021fe44?orgId=2`
  // Awais grafana
  const grafanaUrl = `http://${grafanaHost}:${grafanaPort}/public-dashboards/2f6d020c730c45fc8878c2a2cade0539`;
  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="col-span-12 p-6">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#333333] mb-4">
          Grafana Dashboard
        </h1>

        {/* Grafana Dashboard Embed */}
        <iframe
          title="grafana-dashboard"
          // src="http://arborjs.org"
          src={grafanaUrl}
          width="100%"
          height="900px"
          frameBorder="0"
        />
      </div>
    </Sidebar>
  );
};

export default GrafanaDashboard;
