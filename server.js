const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Sample data (Replace this with database queries in a real app)
const transactionsData = [
  { title: 'Product 1', description: 'Description 1', price: 100, date: '2024-03-01', sold: true },
  { title: 'Product 2', description: 'Description 2', price: 200, date: '2024-03-05', sold: true },
  { title: 'Product 3', description: 'Description 3', price: 50, date: '2024-03-10', sold: false },
  // More transaction objects
];

const ITEMS_PER_PAGE = 5;

app.use(bodyParser.json());

// Endpoint to get transactions with pagination and search
app.get('/api/transactions', (req, res) => {
    const { month, page = 1, search = '' } = req.query;
    const monthNumber = parseInt(month);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({ error: 'Invalid month' });
    }

    // Filter transactions for the selected month (ignore year)
    const filteredTransactions = transactionsData.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() + 1 === monthNumber;
    });

    // Search filter
    const searchQuery = search.toLowerCase();
    const searchFilteredTransactions = filteredTransactions.filter(transaction => {
        return transaction.title.toLowerCase().includes(searchQuery) ||
               transaction.description.toLowerCase().includes(searchQuery) ||
               transaction.price.toString().includes(searchQuery);
    });

    // Pagination
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = searchFilteredTransactions.slice(startIndex, endIndex);

    // Calculate statistics
    const totalSales = searchFilteredTransactions.reduce((acc, transaction) => acc + transaction.price, 0);
    const totalSoldItems = searchFilteredTransactions.filter(transaction => transaction.sold).length;
    const totalNotSoldItems = searchFilteredTransactions.length - totalSoldItems;

    // Price range data
    const priceRanges = [
        { min: 0, max: 50, count: searchFilteredTransactions.filter(t => t.price <= 50).length },
        { min: 51, max: 100, count: searchFilteredTransactions.filter(t => t.price <= 100 && t.price > 50).length },
        { min: 101, max: 200, count: searchFilteredTransactions.filter(t => t.price <= 200 && t.price > 100).length }
        // Add more price ranges as needed
    ];

    res.json({
        transactions: paginatedTransactions,
        totalSales,
        totalSoldItems,
        totalNotSoldItems,
        priceRanges
    });
});

// Endpoint to get statistics for a month
app.get('/api/transactions/stats', (req, res) => {
    const { month } = req.query;
    const monthNumber = parseInt(month);

    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({ error: 'Invalid month' });
    }

    const filteredTransactions = transactionsData.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() + 1 === monthNumber;
    });

    const totalSales = filteredTransactions.reduce((acc, transaction) => acc + transaction.price, 0);
    const totalSoldItems = filteredTransactions.filter(transaction => transaction.sold).length;
    const totalNotSoldItems = filteredTransactions.length - totalSoldItems;

    res.json({
        totalSales,
        totalSoldItems,
        totalNotSoldItems
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
