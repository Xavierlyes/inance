// Dummy data for demonstration
const CRYPTO_BALANCES = {
    BTC: 2.50000000,
    ETH: 15.00000000,
    BNB: 100.00000000,
    XRP: 5000.00000000,
    ADA: 10000.00000000
};

const FIAT_BALANCE = 1500.00;

const EXCHANGE_RATES = {
    BTC_USD: 40000.00,
    ETH_USD: 2500.00,
    BNB_USD: 400.00,
    XRP_USD: 0.50,
    ADA_USD: 0.30,
    USD_BTC: 1 / 40000.00,
    USD_ETH: 1 / 2500.00,
    USD_BNB: 1 / 400.00,
    USD_XRP: 1 / 0.50,
    USD_ADA: 1 / 0.30
};

const TRANSACTION_HISTORY = [
    { id: 'TXN001', type: 'Convert', from: 'BTC', to: 'USD', amount: 0.05, date: '2024-07-01', status: 'completed' },
    { id: 'TXN002', type: 'Deposit', to: 'BTC', amount: 0.1, date: '2024-06-28', status: 'completed' },
    { id: 'TXN003', type: 'Withdraw', from: 'ETH', amount: 0.5, date: '2024-06-25', status: 'pending' },
    { id: 'TXN004', type: 'Convert', from: 'USD', to: 'BNB', amount: 100, date: '2024-06-20', status: 'completed' },
    { id: 'TXN005', type: 'Deposit', to: 'USD', amount: 500, date: '2024-06-15', status: 'completed' }
];

// Elements
const convertFromAssetButton = document.getElementById('convert-from-asset-button');
const convertToAssetButton = document.getElementById('convert-to-asset-button');
const convertFromAmountInput = document.getElementById('convert-from-amount');
const convertToAmountInput = document.getElementById('convert-to-amount');
const swapAssetsButton = document.getElementById('swap-assets-button');
const exchangeRateDisplay = document.getElementById('exchange-rate-display');
const convertNowButton = document.getElementById('convert-now-button');
const convertFromBalanceSpan = document.getElementById('convert-from-balance');
const convertToBalanceSpan = document.getElementById('convert-to-balance');
const convertSidebarBtcBalance = document.getElementById('convert-sidebar-btc-balance');
const convertSidebarFiatBalance = document.getElementById('convert-sidebar-fiat-balance');
const recentTransactionsList = document.getElementById('recent-transactions-list');

let fromAsset = 'BTC';
let toAsset = 'USD';

// Function to format currency
function formatCurrency(amount, currency) {
    if (currency === 'USD') {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency}`;
}

// Function to update balances in the sidebar
function updateSidebarBalances() {
    if (convertSidebarBtcBalance && convertSidebarFiatBalance) {
        convertSidebarBtcBalance.textContent = formatCurrency(CRYPTO_BALANCES.BTC, 'BTC');
        convertSidebarFiatBalance.textContent = formatCurrency(FIAT_BALANCE, 'USD');
    }
}

// Function to update transaction history
function updateTransactionHistory() {
    if (recentTransactionsList) {
        recentTransactionsList.innerHTML = ''; // Clear existing list
        TRANSACTION_HISTORY.slice(0, 5).forEach(tx => { // Show only top 5
            const transactionItem = document.createElement('div');
            transactionItem.className = 'flex items-center justify-between p-3 rounded-lg bg-[var(--background-light)] border border-[var(--border-color)]';
            transactionItem.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8 bg-accent-yellow text-background-dark flex items-center justify-center text-sm font-bold">
                        ${tx.type === 'Convert' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-left w-4 h-4"><path d="m16 3 4 4-4 4"></path><path d="M20 7H4"></path><path d="m8 21-4-4 4-4"></path><path d="M4 17h16"></path></svg>' :
                         tx.type === 'Deposit' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-to-line w-4 h-4"><path d="M12 17V3"></path><path d="m6 11 6 6 6-6"></path><path d="M5 21h14"></path></svg>' :
                         tx.type === 'Withdraw' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-from-line w-4 h-4"><path d="m18 9-6-6-6 6"></path><path d="M12 3v14"></path><path d="M5 21h14"></path></svg>' : ''}
                    </span>
                    <div>
                        <div class="text-sm font-medium text-text-primary">${tx.type}</div>
                        <div class="text-xs text-muted-binance">${tx.date}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-text-primary">${tx.type === 'Convert' ? `${tx.amount} ${tx.from}` : `${tx.amount} ${tx.to}`}</div>
                    <div class="text-xs ${tx.status === 'completed' ? 'text-accent-green' : tx.status === 'pending' ? 'text-status-pending' : 'text-accent-red'} capitalize">${tx.status}</div>
                </div>
            `;
            recentTransactionsList.appendChild(transactionItem);
        });
    }
}

// Function to calculate and display conversion
function calculateConversion() {
    if (!convertFromAmountInput) return; // Guard against running on other pages

    const fromAmount = parseFloat(convertFromAmountInput.value);
    if (isNaN(fromAmount) || fromAmount <= 0) {
        convertToAmountInput.value = '';
        exchangeRateDisplay.textContent = 'Enter amount to convert';
        convertNowButton.disabled = true;
        return;
    }

    const rateKey = `${fromAsset}_${toAsset}`;
    const rate = EXCHANGE_RATES[rateKey];

    if (rate) {
        const toAmount = fromAmount * rate;
        convertToAmountInput.value = toAmount.toFixed(8); // Display with more precision
        exchangeRateDisplay.textContent = `1 ${fromAsset} = ${formatCurrency(rate, toAsset)} ${toAsset}`;
        
        // Enable convert button if amount is within balance
        if (fromAsset === 'USD') {
            convertNowButton.disabled = fromAmount > FIAT_BALANCE;
        } else {
            convertNowButton.disabled = fromAmount > CRYPTO_BALANCES[fromAsset];
        }

    } else {
        convertToAmountInput.value = 'N/A';
        exchangeRateDisplay.textContent = 'Exchange rate not available';
        convertNowButton.disabled = true;
    }
}

// Function to update asset selectors and balances
function updateAssetSelectors() {
    if (!convertFromAssetButton) return; // Guard against running on other pages

    convertFromAssetButton.textContent = fromAsset;
    convertToAssetButton.textContent = toAsset;

    convertFromBalanceSpan.textContent = fromAsset === 'USD' ? `Balance: ${formatCurrency(FIAT_BALANCE, 'USD')}` : `Balance: ${formatCurrency(CRYPTO_BALANCES[fromAsset], fromAsset)}`;
    convertToBalanceSpan.textContent = toAsset === 'USD' ? `Balance: ${formatCurrency(FIAT_BALANCE, 'USD')}` : `Balance: ${formatCurrency(CRYPTO_BALANCES[toAsset], toAsset)}`;
    
    calculateConversion();
}

// Event Listeners
if (convertFromAssetButton) {
    convertFromAssetButton.addEventListener('click', () => {
        // In a real app, this would open a modal to select an asset
        // For now, let's cycle through some options
        const assets = Object.keys(CRYPTO_BALANCES).concat(['USD']);
        let currentIndex = assets.indexOf(fromAsset);
        fromAsset = assets[(currentIndex + 1) % assets.length];
        if (fromAsset === toAsset) { // Avoid same asset for from and to
            currentIndex = assets.indexOf(fromAsset);
            fromAsset = assets[(currentIndex + 1) % assets.length];
        }
        updateAssetSelectors();
    });
}

if (convertToAssetButton) {
    convertToAssetButton.addEventListener('click', () => {
        // In a real app, this would open a modal to select an asset
        // For now, let's cycle through some options
        const assets = Object.keys(CRYPTO_BALANCES).concat(['USD']);
        let currentIndex = assets.indexOf(toAsset);
        toAsset = assets[(currentIndex + 1) % assets.length];
        if (fromAsset === toAsset) { // Avoid same asset for from and to
            currentIndex = assets.indexOf(toAsset);
            toAsset = assets[(currentIndex + 1) % assets.length];
        }
        updateAssetSelectors();
    });
}

if (swapAssetsButton) {
    swapAssetsButton.addEventListener('click', () => {
        [fromAsset, toAsset] = [toAsset, fromAsset]; // Swap values
        convertFromAmountInput.value = ''; // Clear input on swap
        updateAssetSelectors();
    });
}

if (convertFromAmountInput) {
    convertFromAmountInput.addEventListener('input', calculateConversion);
}

if (convertNowButton) {
    convertNowButton.addEventListener('click', () => {
        // Implement conversion logic here
        // For demonstration, just log the conversion
        const fromAmount = parseFloat(convertFromAmountInput.value);
        const toAmount = parseFloat(convertToAmountInput.value);

        if (fromAmount > 0 && !isNaN(toAmount)) {
            let currentBalance = fromAsset === 'USD' ? FIAT_BALANCE : CRYPTO_BALANCES[fromAsset];
            if (fromAmount <= currentBalance) {
                console.log(`Converting ${fromAmount} ${fromAsset} to ${toAmount} ${toAsset}`);
                // In a real app, update balances and add to transaction history
                // For now, just a dummy update
                if (fromAsset === 'USD') {
                    // FIAT_BALANCE -= fromAmount; // This would require actual state management
                } else {
                    // CRYPTO_BALANCES[fromAsset] -= fromAmount;
                }
                // Add a dummy transaction for the conversion
                TRANSACTION_HISTORY.unshift({
                    id: `TXN${Math.floor(Math.random() * 10000)}`,
                    type: 'Convert',
                    from: fromAsset,
                    to: toAsset,
                    amount: fromAmount,
                    date: new Date().toISOString().slice(0, 10),
                    status: 'completed'
                });
                updateSidebarBalances();
                updateTransactionHistory();
                convertFromAmountInput.value = '';
                calculateConversion(); // Recalculate and disable button
                alert('Conversion successful!'); // Using alert for simplicity, replace with custom modal in real app
            } else {
                alert('Insufficient balance for this conversion.'); // Using alert for simplicity
            }
        }
    });
}

// Initial load for convert page
if (document.getElementById('convert-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        updateSidebarBalances();
        updateTransactionHistory();
        updateAssetSelectors(); // Set initial asset displays and balances
    });
}