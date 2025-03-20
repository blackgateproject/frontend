import React from "react";
import Sidebar from "../../components/Sidebar";
import { grafanaHost, grafanaPort } from "../../utils/readEnv";
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
  const did = localStorage.getItem("did");
  if (!did) {
    console.error("DID not found in localStorage");
    return <div>Error: DID not found</div>;
  }
  const grafanaUrl = `http://${grafanaHost}:${grafanaPort}/d/aeg8k8xe3vmrkf/blackgate?orgId=1&from=now-6h&to=now&timezone=browser&var-query0=${did}&refresh=5s&kiosk`;
  // const grafanaUrl = `http://${grafanaHost}:${grafanaPort}/public-dashboards/${grafanaDashboard}?var-query0=${did}`;
  // http://localhost:3000/public-dashboards/4cfe527e24b14ea7981f0216bff5046f?var-query0=did:ethr:blackgate:0x02b68a7089375398902d830d76f1df427e81f060e7e4f4784e4d0accfbd660bc86
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
