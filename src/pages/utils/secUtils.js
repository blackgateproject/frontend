export const logUserInfo = async () => {
  const userInfo = {};

  // Log User Agent
  userInfo.userAgent = navigator.userAgent;

  // Log Language
  userInfo.userLanguage = navigator.language || navigator.userLanguage;

  // Log Geolocation
  if (navigator.geolocation) {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userInfo.latitude = position.coords.latitude;
          userInfo.longitude = position.coords.longitude;
          resolve();
        },
        (error) => {
          console.error("Error obtaining geolocation:", error);
          resolve();
        }
      );
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // Log IP Address
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    userInfo.ipAddress = data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
  }

  console.log("Network Info:", JSON.stringify(userInfo, null, 2));
};
