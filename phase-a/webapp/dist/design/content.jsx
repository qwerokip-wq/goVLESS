// Shared content for the Home/Главная screen — all 12 variants render the same data.
const CONTENT = {
  appName: "goVLESS",
  status: "Защита активна",
  statusEn: "Protected",
  mode: "Lite",
  modeFull: "Reality · Cloudflare tunnel",
  server: "tunnel-fra-04.trycloudflare.com",
  uptime: "14д 06:22",
  clientsActive: 4,
  clientsTotal: 5,
  trafficMonth: "218.4 GB",
  trafficCap: "1 TB",
  trafficPct: 21,
  clients: [
    { name: "iPhone Anna",   used: "62.1 GB", days: "21д", on: true,  hue: 145 },
    { name: "MBP Sergey",    used: "44.7 GB", days: "21д", on: true,  hue: 200 },
    { name: "iPad Kids",     used: "12.0 GB", days: "5д",  on: false, hue: 30  },
  ],
};

window.CONTENT = CONTENT;
