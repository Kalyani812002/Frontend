const monthSelect = document.getElementById("month-select");
const searchBox = document.getElementById("search-box");
const transactionsBody = document.getElementById("transactions-body");
const totalSales = document.getElementById("total-sales");
const totalSoldItems = document.getElementById("total-sold-items");
const totalNotSoldItems = document.getElementById("total-not-sold-items");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const transactionsBarChart = document.getElementById("transactions-bar-chart");

let currentPage = 1;
let selectedMonth = 3; // Default month is March

// Fetch transactions for the selected month
function fetchTransactions(month, page, searchQuery = '') {
    fetch(`api/transactions?month=${month}&page=${page}&search=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            // Populate the table
            transactionsBody.innerHTML = '';
            data.transactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.title}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.price}</td>
                    <td>${transaction.date}</td>
                `;
                transactionsBody.appendChild(row);
            });

            // Update statistics
            totalSales.textContent = data.totalSales;
            totalSoldItems.textContent = data.totalSoldItems;
            totalNotSoldItems.textContent = data.totalNotSoldItems;

            // Update chart
            updateChart(data.priceRanges);
        })
        .catch(error => console.error('Error fetching transactions:', error));
}

// Fetch transaction statistics
function fetchTransactionStatistics(month) {
    fetch(`api/transactions/stats?month=${month}`)
        .then(response => response.json())
        .then(data => {
            totalSales.textContent = data.totalSales;
            totalSoldItems.textContent = data.totalSoldItems;
            totalNotSoldItems.textContent = data.totalNotSoldItems;
        })
        .catch(error => console.error('Error fetching transaction statistics:', error));
}

// Update bar chart with price range data
function updateChart(priceRanges) {
    const ctx = transactionsBarChart.getContext('2d');
    const chartData = {
        labels: priceRanges.map(range => `${range.min} - ${range.max}`),
        datasets: [{
            label: 'Number of Items',
            data: priceRanges.map(range => range.count),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// Handle month change
monthSelect.addEventListener('change', (e) => {
    selectedMonth = parseInt(e.target.value);
    fetchTransactions(selectedMonth, currentPage);
    fetchTransactionStatistics(selectedMonth);
});

// Handle search input
searchBox.addEventListener('input', (e) => {
    const searchQuery = e.target.value;
    fetchTransactions(selectedMonth, currentPage, searchQuery);
});

// Handle pagination
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchTransactions(selectedMonth, currentPage);
    }
});

nextBtn.addEventListener('click', () => {
    currentPage++;
    fetchTransactions(selectedMonth, currentPage);
});

// Initial data load
fetchTransactions(selectedMonth, currentPage);
fetchTransactionStatistics(selectedMonth);
