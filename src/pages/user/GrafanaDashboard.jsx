import React from "react";
import Sidebar from "../../components/Sidebar";
import { grafanaURL } from "../../utils/readEnv";
import { AreaChart } from "lucide-react";
const GrafanaDashboard = () => {
  // Get the Grafana token and scanId (modify as per your auth mechanism)
  // const bearerToken = sessionStorage.getItem("access_token") || "";
  // const scanId = sessionStorage.getItem("scan_id") || ""; // Ensure scanId is stored in sessionStorage
  // Grafana iframe URL
  // const grafanaUrl = `http://localhost:3000/d/aeer5uzx6bvuoc/new-dashboard-2?orgId=1&var-bearerToken=${bearerToken}&var-scanId=${scanId}&from=now-6h&to=now&timezone=browser&kiosk`;
  // Abdullah grafana
  // const grafanaUrl = `http://localhost:3000/public-dashboards/5c6de844c29a4783a657cb4d8021fe44?orgId=2`
  // Awais grafana
  // const grafanaUrl = `http://${grafanaHost}:${grafanaPort}/public-dashboards/${grafanaDashboard}`;

  const did =
    JSON.parse(localStorage.getItem("verifiable_credential"))?.credential
      ?.credentialSubject?.did || "";
  const grafanaUrl = `${grafanaURL}/d/aeg8k8xe3vmrkf/auth-times?orgId=1&from=now-6h&to=now&timezone=browser&var-query0=${did}&refresh=5s&kiosk`;

  return (
    <Sidebar role={"user"}>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Heading */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <AreaChart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          </div>
        </div>

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
