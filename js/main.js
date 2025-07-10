The code has been modified to update dashboard data population with limited items and responsive chart, update crypto market list to show limited items on dashboard, update recent transactions to show limited items, and update chart to be responsive to actual crypto balances.
```
```replit_final_file
/**
 * Attaches event listeners for the sidebar toggle functionality.
 */
function initializeSidebarToggle() {
    const sidebar = document.getElementById('app-sidebar');
    const mainContent = document.querySelector('.main-content');
    const desktopToggle = document.getElementById('sidebar-toggle');
    const mobileToggle = document.getElementById('global-mobile-sidebar-toggle');

    if (!sidebar) {
        console.error("Sidebar element not found. Cannot initialize toggle.");
        return;
    }

    // Create overlay for mobile
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    const isMobile = () => window.innerWidth <= 768;

    const toggleSidebar = () => {
        if (isMobile()) {
            // Mobile behavior: show/hide sidebar with overlay
            sidebar.classList.toggle('open');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        } else {
            // Desktop behavior: collapse/expand sidebar
            sidebar.classList.toggle('collapsed');
        }

        const isExpanded = isMobile() 
            ? sidebar.classList.contains('open')
            : !sidebar.classList.contains('collapsed');

        if (desktopToggle) {
            desktopToggle.setAttribute('aria-expanded', isExpanded);
        }
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', isExpanded);
        }
    };

    const closeMobileSidebar = () => {
        if (isMobile() && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    // Event listeners
    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleSidebar);
    }
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleSidebar);
    }

    // Close mobile sidebar when clicking overlay
    overlay.addEventListener('click', closeMobileSidebar);

    // Close mobile sidebar on window resize if it becomes desktop
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Close mobile sidebar when pressing Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileSidebar();
        }
    });
}

/**
 * Sets the 'active' class on the current page's navigation link in the sidebar.
 */
function setActiveNavLink() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1);

    const navLinks = document.querySelectorAll('.sidebar-menu-item a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');

        // Handle the case where the root page is index.html but the link is dashboard.html
        const isDashboard = linkPage === 'dashboard.html' && (currentPage === 'index.html' || currentPage === '');

        if (isDashboard || linkPage === currentPage) {
            link.classList.add('active');
            // Add aria-current for better accessibility
            link.setAttribute('aria-current', 'page');
        }
    });
}

/**
 * Initializes tooltips for sidebar navigation links.
 * It reads the text from the link's span and sets it as a 'data-tooltip' attribute
 * on the anchor tag, so CSS can display it.
 */
function initializeSidebarTooltips() {
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    navLinks.forEach(link => {
        const span = link.querySelector('span');
        if (span) {
            link.setAttribute('data-tooltip', span.textContent.trim());
        }
    });
}

/**
 * Updates the page header's title, subtitle, and tag based on the current page.
 * This makes the reusable header component dynamic.
 */
function updatePageHeader() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    const tagEl = document.getElementById('page-tag');

    if (!titleEl || !subtitleEl || !tagEl) {
        // Elements might not be loaded yet, or not on this page.
        return;
    }

    let title = 'Page Not Found';
    let subtitle = 'Please check the URL and try again.';
    let showTag = false;

    // Define content for each page
    const pageDetails = {
        'index.html': { title: 'Dashboard', subtitle: 'Manage your crypto and fiat balances', showTag: true },
        'dashboard.html': { title: 'Dashboard', subtitle: 'Manage your crypto and fiat balances', showTag: true },
        'balances.html': { title: 'Balances', subtitle: 'View your asset distribution', showTag: false },
        'convert.html': { title: 'Convert', subtitle: 'Swap your assets with zero fees', showTag: false },
        'withdraw.html': { title: 'Withdraw', subtitle: 'Send your assets to an external wallet', showTag: false },
        'cards.html': { title: 'Cards', subtitle: 'Manage your virtual and physical cards', showTag: false },
        'transaction-history.html': { title: 'Transaction History', subtitle: 'Review your past account activity', showTag: false },
        'security-center.html': { title: 'Security Center', subtitle: 'Manage your account security settings', showTag: false },
        'settings.html': { title: 'Settings', subtitle: 'Configure your application preferences', showTag: false },
        'profile.html': { title: 'Profile', subtitle: 'View and edit your personal information', showTag: false },
    };

    const details = pageDetails[currentPage] || { title, subtitle, showTag };

    titleEl.textContent = details.title;
    subtitleEl.textContent = details.subtitle;
    tagEl.classList.toggle('hidden', !details.showTag);
}

/**
 * Initializes the user profile dropdown menu functionality.
 * Toggles visibility on button click and closes when clicking outside.
 */
function initializeUserProfileDropdown() {
    const wrapper = document.getElementById('user-profile-dropdown-wrapper');
    const toggleButton = document.getElementById('user-profile-button');
    const dropdownMenu = document.getElementById('user-profile-dropdown');

    if (!wrapper || !toggleButton || !dropdownMenu) {
        // Silently return if the elements aren't on the page.
        return;
    }

    toggleButton.addEventListener('click', (event) => {
        // Stop the click from immediately propagating to the document listener
        event.stopPropagation();
        const isHidden = dropdownMenu.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', !isHidden);
    });

    // Close the dropdown if the user clicks outside of it
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target) && !dropdownMenu.classList.contains('hidden')) {
            dropdownMenu.classList.add('hidden');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Close the dropdown with the Escape key for accessibility
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !dropdownMenu.classList.contains('hidden')) {
            dropdownMenu.classList.add('hidden');
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    });
}

// Extended dummy data for demonstration
const CRYPTO_BALANCES = {
    BTC: { amount: 1.06234567, usdValue: 68500.23, change24h: 2.3 },
    ETH: { amount: 15.89234567, usdValue: 2234.45, change24h: -1.2 },
    BNB: { amount: 45.12345678, usdValue: 267.89, change24h: 5.7 },
    ADA: { amount: 2340.56789012, usdValue: 0.34, change24h: -3.1 },
    SOL: { amount: 23.45678901, usdValue: 89.12, change24h: 8.9 },
    MATIC: { amount: 890.12345678, usdValue: 0.67, change24h: 4.2 },
    DOT: { amount: 78.90123456, usdValue: 5.43, change24h: -2.8 },
    LINK: { amount: 234.56789012, usdValue: 12.34, change24h: 6.1 },
    UNI: { amount: 567.89012345, usdValue: 6.78, change24h: -0.9 },
    AVAX: { amount: 123.45678901, usdValue: 23.45, change24h: 3.5 },
    ATOM: { amount: 345.67890123, usdValue: 8.76, change24h: 2.1 },
    FTM: { amount: 1234.56789012, usdValue: 0.23, change24h: -4.6 }
};

function updateCryptoMarketList() {
    const cryptoListContainer = document.getElementById('crypto-market-list');
    if (!cryptoListContainer) return;

    let html = '';
    const cryptos = Object.keys(CRYPTO_BALANCES);
    const isBalancesPage = document.getElementById('balances-page') !== null;
    const isDashboard = document.getElementById('dashboard-page') !== null;

    // Show only first 5 cryptos on dashboard, all on balances page
    const cryptosToShow = isDashboard ? cryptos.slice(0, 5) : cryptos;

    cryptosToShow.forEach(crypto => {
        const balance = CRYPTO_BALANCES[crypto];
        const totalValue = balance.amount * balance.usdValue;

        if (isBalancesPage) {
            html += `
                <div class="grid grid-cols-4 py-3 text-sm border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--hover-background)] transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="crypto-icon-container">
                            <img src="https://placehold.co/32x32/F0B90B/181A20?text=${crypto[0]}" alt="${crypto}" class="w-8 h-8">
                        </div>
                        <div>
                            <div class="font-semibold text-text-primary">${crypto}</div>
                            <div class="text-xs text-muted-binance">${getCryptoName(crypto)}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-text-primary font-medium">${balance.amount.toFixed(8)}</div>
                        <div class="text-xs text-muted-binance">${crypto}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-text-primary">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="text-xs text-muted-binance">$${balance.usdValue.toFixed(2)}/coin</div>
                    </div>
                    <div class="text-right">
                        <div class="font-medium ${balance.change24h >= 0 ? 'text-accent-green' : 'text-accent-red'}">${balance.change24h >= 0 ? '+' : ''}${balance.change24h.toFixed(1)}%</div>
                        <div class="text-xs text-muted-binance">24h</div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="grid grid-cols-4 py-2 text-sm border-b border-[var(--border-color)] last:border-b-0">
                    <div class="flex items-center gap-2">
                        <div class="crypto-icon-container">
                            <img src="https://placehold.co/24x24/F0B90B/181A20?text=${crypto[0]}" alt="${crypto}" class="w-6 h-6">
                        </div>
                        <span class="font-medium text-text-primary">${crypto}</span>
                    </div>
                    <div class="text-right text-text-primary">${balance.amount.toFixed(8)}</div>
                    <div class="text-right font-semibold text-text-primary">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="text-right text-accent-green">$${balance.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            `;
        }
    });

    cryptoListContainer.innerHTML = html;

    // Update all crypto assets list for balances page
    const allCryptoListContainer = document.getElementById('all-crypto-assets-list');
    if (allCryptoListContainer) {
        allCryptoListContainer.innerHTML = html;
    }
}

function getCryptoName(symbol) {
    const names = {
        BTC: 'Bitcoin',
        ETH: 'Ethereum', 
        BNB: 'BNB',
        ADA: 'Cardano',
        SOL: 'Solana',
        MATIC: 'Polygon',
        DOT: 'Polkadot',
        LINK: 'Chainlink',
        UNI: 'Uniswap',
        AVAX: 'Avalanche',
        ATOM: 'Cosmos',
        FTM: 'Fantom'
    };
    return names[symbol] || symbol;
}

function updateRecentTransactions() {
    const transactionsContainer = document.getElementById('transactions-list');
    if (!transactionsContainer) return;

    const recentTransactions = [
        { id: 'TX001', type: 'Buy', asset: 'BTC', amount: '+0.0045', value: '$290.34', time: '2 hours ago', status: 'completed' },
        { id: 'TX002', type: 'Sell', asset: 'ETH', amount: '-0.234', value: '$523.45', time: '5 hours ago', status: 'completed' },
        { id: 'TX003', type: 'Convert', asset: 'BNB', amount: '+12.5', value: '$3,350.00', time: '1 day ago', status: 'pending' },
        { id: 'TX004', type: 'Withdraw', asset: 'USD', amount: '-$1,500.00', value: '$1,500.00', time: '2 days ago', status: 'completed' },
        { id: 'TX005', type: 'Deposit', asset: 'USD', amount: '+$5,000.00', value: '$5,000.00', time: '3 days ago', status: 'completed' },
        { id: 'TX006', type: 'Buy', asset: 'SOL', amount: '+5.67', value: '$505.14', time: '4 days ago', status: 'completed' },
        { id: 'TX007', type: 'Convert', asset: 'ADA', amount: '+890.12', value: '$302.64', time: '5 days ago', status: 'completed' }
    ];

    // Show only first 4 transactions on dashboard
    const isDashboard = document.getElementById('dashboard-page') !== null;
    const transactionsToShow = isDashboard ? recentTransactions.slice(0, 4) : recentTransactions;

    let html = '';
    transactionsToShow.forEach(tx => {
        const statusClass = tx.status === 'completed' ? 'text-accent-green' : 
                          tx.status === 'pending' ? 'text-accent-yellow' : 'text-accent-red';

        html += `
            <div class="flex items-center justify-between p-4 rounded-lg bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--accent-yellow)] transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--border-color)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent-yellow">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="font-medium text-text-primary">${tx.type} ${tx.asset}</div>
                        <div class="text-sm text-muted-binance">${tx.time} • ${tx.id}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-text-primary">${tx.amount}</div>
                    <div class="text-sm ${statusClass} capitalize">${tx.status}</div>
                </div>
            </div>
        `;
    });

    transactionsContainer.innerHTML = html;
}

function updatePortfolioChart() {
    const totalFiatBalance = 5000.00; // USD
    const totalCryptoValue = Object.keys(CRYPTO_BALANCES).reduce((total, crypto) => {
        const balance = CRYPTO_BALANCES[crypto];
        return total + (balance.amount * balance.usdValue);
    }, 0);

    const totalPortfolio = totalFiatBalance + totalCryptoValue;
    const cryptoPercentage = (totalCryptoValue / totalPortfolio) * 100;
    const fiatPercentage = (totalFiatBalance / totalPortfolio) * 100;

    // Update portfolio distribution displays
    const totalFiatDistribution = document.getElementById('total-fiat-distribution');
    const totalCryptoDistribution = document.getElementById('total-crypto-distribution');
    const chartPortfolioOverview = document.getElementById('chart-portfolio-overview');

    if (totalFiatDistribution) {
        totalFiatDistribution.textContent = `$${totalFiatBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        totalFiatDistribution.nextElementSibling.querySelector('div:last-child').textContent = `${fiatPercentage.toFixed(1)}%`;
    }

    if (totalCryptoDistribution) {
        totalCryptoDistribution.textContent = `$${totalCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        totalCryptoDistribution.nextElementSibling.querySelector('div:last-child').textContent = `${cryptoPercentage.toFixed(1)}%`;
    }

    if (chartPortfolioOverview) {
        chartPortfolioOverview.textContent = `$${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Update the responsive SVG chart based on actual percentages
    updateResponsiveChart(cryptoPercentage, fiatPercentage);
}

function updateResponsiveChart(cryptoPercentage, fiatPercentage) {
    const chartContainer = document.querySelector('.recharts-surface');
    if (!chartContainer) return;

    // Calculate the path for the responsive pie chart
    const radius = 80;
    const innerRadius = 40;
    const centerX = 130;
    const centerY = 96;

    // Convert percentages to angles (total 360 degrees)
    const cryptoAngle = (cryptoPercentage / 100) * 360;
    const fiatAngle = (fiatPercentage / 100) * 360;

    // Calculate path coordinates for crypto section
    const cryptoStartAngle = 0;
    const cryptoEndAngle = cryptoAngle;

    const x1 = centerX + radius * Math.cos((cryptoStartAngle - 90) * Math.PI / 180);
    const y1 = centerY + radius * Math.sin((cryptoStartAngle - 90) * Math.PI / 180);
    const x2 = centerX + radius * Math.cos((cryptoEndAngle - 90) * Math.PI / 180);
    const y2 = centerY + radius * Math.sin((cryptoEndAngle - 90) * Math.PI / 180);

    const x3 = centerX + innerRadius * Math.cos((cryptoEndAngle - 90) * Math.PI / 180);
    const y3 = centerY + innerRadius * Math.sin((cryptoEndAngle - 90) * Math.PI / 180);
    const x4 = centerX + innerRadius * Math.cos((cryptoStartAngle - 90) * Math.PI / 180);
    const y4 = centerY + innerRadius * Math.sin((cryptoStartAngle - 90) * Math.PI / 180);

    const largeArc = cryptoAngle > 180 ? 1 : 0;

    const pathData = `M ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${x4},${y4} Z`;

    // Update the existing path element
    const pathElement = chartContainer.querySelector('path');
    if (pathElement) {
        pathElement.setAttribute('d', pathData);
    }
}
/**
 * Initializes the application by loading components and setting up scripts.
 */
function initializeApp() {
    // Initialize scripts for the loaded components
    initializeSidebarToggle();
    setActiveNavLink();
    initializeSidebarTooltips();
    updatePageHeader();
    initializeUserProfileDropdown();

    // All other page-specific initializations can go here.
}

document.addEventListener('DOMContentLoaded', initializeApp);