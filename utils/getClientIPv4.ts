import os from "os";

// reference : how to get client IP address
// https://stackoverflow.com/questions/67778717/how-to-get-the-ip-address-in-node-js-express
export const getClientIPv4 = () => {
  const allNetworkInterfaces = os.networkInterfaces();
  const clientIP = allNetworkInterfaces.lo0;

  if (!clientIP) {
    throw new Error("클라이언트 IP 탐색 실패");
  }

  const clientIPv4 = clientIP[0].address;

  return clientIPv4;
};
