const headersByReportType: Record<string, string> = {
  user_activity: "<th>#</th><th>Location</th><th>Report Count</th>",
  collection_efficiency:
    "<th>#</th><th>Total Reports</th><th>Collected Reports</th>",
  reward_engagement: "<th>#</th><th>Waste Type</th><th>Total Amount</th>",
  user_engagement_by_date: "<th>#</th><th>Date</th><th>Report Count</th>",
  average_waste_per_location:
    "<th>#</th><th>Location</th><th>Average Waste</th>",
  waste_type_by_location:
    "<th>#</th><th>Location</th><th>Waste Type</th><th>Report Count</th>",
  collector_efficiency:
    "<th>#</th><th>Collector ID</th><th>Collected Reports</th>",
};

export const getTableHeaders = (reportType: string) =>
  headersByReportType[reportType] ?? "";

export const generateHtmlContent = (
  data: Array<Record<string, unknown>>,
  reportType: string
) => {
  const tableRows = data
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        ${Object.values(item)
          .map((value) => `<td>${value}</td>`)
          .join("")}
      </tr>`
    )
    .join("");

  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        canvas { margin: 40px auto; display: block; }
      </style>
    </head>
    <body>
      <h1>${reportType.toUpperCase()} REPORT</h1>
      <canvas id="chart"></canvas>
      <table>
        <thead><tr>${getTableHeaders(reportType)}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const ctx = document.getElementById('chart').getContext('2d');
        const chartData = {
          labels: ${JSON.stringify(
            data.map((item) => item.location || item.wasteType)
          )},
          datasets: [{
            label: '${reportType} Data',
            data: ${JSON.stringify(
              data.map(
                (item) =>
                  item.reportCount || item.totalAmount || item.collectedReports
              )
            )},
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };
        new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: { scales: { y: { beginAtZero: true } } }
        });
      </script>
    </body>
  </html>`;
};
