import React from "react";
import Sidebar from "../../components/Sidebar";
const TestDashboard = () => {
  // Get the Grafana token and scanId (modify as per your auth mechanism)
  // const bearerToken = sessionStorage.getItem("access_token") || "";
  // const scanId = sessionStorage.getItem("scan_id") || ""; // Ensure scanId is stored in sessionStorage
  // Grafana iframe URL
  // const grafanaUrl = `http://localhost:3000/d/aeer5uzx6bvuoc/new-dashboard-2?orgId=1&var-bearerToken=${bearerToken}&var-scanId=${scanId}&from=now-6h&to=now&timezone=browser&kiosk`;
  // Abdullah grafana
  // const grafanaUrl = `http://localhost:3000/public-dashboards/5c6de844c29a4783a657cb4d8021fe44?orgId=2`
  // Awais grafana
  //   const did = localStorage.getItem("did");
  //   const grafanaUrl = `http://${grafanaHost}:${grafanaPort}/d/aeg8k8xe3vmrkf/auth-times?orgId=1&from=now-6h&to=now&timezone=browser&var-query0=${did}&refresh=5s&kiosk`;
  return (
    <Sidebar role={"user"}>
      {/* Main Content */}
      <div className="col-span-12 p-6">
        {/* Heading */}
              <h1 className="text-3xl font-bold text-[#333333] mb-4">Test Page</h1>
              {/* Add form + submit button for generating X users */}
                <form>
                    <label htmlFor="numUsers">Number of Users:</label>
                    <input type="number" id="numUsers" name="numUsers" min="1" max="1000" />
                  <button type="submit">Generate Users</button>
              </form>
              {/* Add form + submit button for verifying X users */}
                <form>
                    <label htmlFor="numUsers">Number of Users:</label>
                    <input type="number" id="numUsers" name="numUsers" min="1" max="1000" />
                  <button type="submit">Verify Users</button>
              </form>
              
      </div>
    </Sidebar>
  );
};

export default TestDashboard;
