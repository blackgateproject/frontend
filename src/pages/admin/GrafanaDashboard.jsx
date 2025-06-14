import React from "react";
import Sidebar from "../../components/Sidebar";
import { grafanaURL } from "../../utils/readEnv";
import { Database } from "lucide-react";
const GrafanaDashboard = () => {
  // Get the Grafana token and scanId (modify as per your auth mechanism)

  const did =
    JSON.parse(localStorage.getItem("verifiable_credential"))?.credential
      ?.credentialSubject?.did || "";
  if (!did) {
    console.error("DID not found in localStorage");
    alert("DID not found in localStorage");
  }
  const grafanaUrl = `${grafanaURL}/d/aeg8k8xe3vmrkf/blackgate?orgId=1&from=now-6h&to=now&timezone=browser&var-query0=${did}&refresh=5s&kiosk`;
  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Heading */}
        <div className="flex flex-wrap items-center justify-between mb-8 mt-2">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Grafana Dashboard</h1>
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
