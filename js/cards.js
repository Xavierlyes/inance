// Dummy data for demonstration purposes, mimicking shared-data.js and session storage
const users = [{
    id: 'user123',
    username: 'john.doe@example.com',
    balance: 10000.00,
    compensationBalance: 2500.00,
    kycStatus: 'Verified',
    assets: {
        BTC: { amount: 0.5, usdValue: 35000.00, currentPrice: 70000.00 },
        ETH: { amount: 2.0, usdValue: 6000.00, currentPrice: 3000.00 },
    },
    transactions: []
}];

// Initialize session storage with a dummy user if not already set
if (!sessionStorage.getItem('activeUser')) {
    sessionStorage.setItem('activeUser', JSON.stringify(users[0]));
}

// --- Utility function for Toast messages (simplified for this example) ---
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const body = document.querySelector('body');
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'fixed bottom-4 right-4 z-[10000] flex flex-col gap-2';
        body.appendChild(div);
    }

    const toast = document.createElement('div');
    toast.className = `p-3 rounded-md shadow-lg text-white max-w-xs transition-all duration-300 ease-in-out transform translate-y-full opacity-0`;

    if (type === 'success') {
        toast.classList.add('bg-green-500');
    } else if (type === 'error') {
        toast.classList.add('bg-red-500');
    } else {
        toast.classList.add('bg-gray-700');
    }

    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-full', 'opacity-0');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

/**
 * Initializes the card request modal functionality.
 */
function initializeCardRequestModal() {
    const requestCardButton = document.getElementById('request-new-card-button');
    const requestCardModal = document.getElementById('request-card-modal');
    const closeRequestCardModalButton = document.getElementById('close-request-card-modal');
    const backButton = document.getElementById('back-button');
    const nextButton = document.getElementById('next-button');
    const submitRequestButton = document.getElementById('submit-request-button');
    const currentStepSpan = document.getElementById('current-step');
    const progressBar = document.getElementById('progress-bar');
    const modalErrorMessage = document.getElementById('modal-error-message');

    // Early return if required elements don't exist
    if (!requestCardButton || !requestCardModal) {
        return;
    }

    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4'),
        document.getElementById('step-5')
    ];
    const stepIcons = [
        document.getElementById('step-icon-1'),
        document.getElementById('step-icon-2'),
        document.getElementById('step-icon-3'),
        document.getElementById('step-icon-4'),
        document.getElementById('step-icon-5')
    ];

    let currentStep = 0;

    const cardTypeSelect = document.getElementById('card-type');
    const cardholderNameInput = document.getElementById('cardholder-name');
    const deliveryMethodSelect = document.getElementById('delivery-method');
    const deliveryAddressGroup = document.getElementById('delivery-address-group');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const cityInput = document.getElementById('city');
    const zipCodeInput = document.getElementById('zip-code');
    const stateProvinceInput = document.getElementById('state-province');

    const confirmCardType = document.getElementById('confirm-card-type');
    const confirmCardholderName = document.getElementById('confirm-cardholder-name');
    const confirmUsage = document.getElementById('confirm-usage');
    const confirmCountry = document.getElementById('confirm-country');
    const confirmSpendingRange = document.getElementById('confirm-spending-range');
    const confirmDailyLimit = document.getElementById('confirm-daily-limit');
    const confirmDeliveryMethod = document.getElementById('confirm-delivery-method');
    const confirmDeliveryAddress = document.getElementById('confirm-delivery-address');
    const confirmDeliveryMethodLine = document.getElementById('confirm-delivery-method-line');
    const confirmAddressLine = document.getElementById('confirm-address-line');

    const showStep = (stepIndex) => {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index !== stepIndex);
        });
        stepIcons.forEach((icon, index) => {
            icon.classList.remove('step-icon-active', 'step-icon-completed', 'step-icon-inactive');
            if (index < stepIndex) {
                icon.classList.add('step-icon-completed');
            } else if (index === stepIndex) {
                icon.classList.add('step-icon-active');
            } else {
                icon.classList.add('step-icon-inactive');
            }
        });

        currentStepSpan.textContent = stepIndex + 1;
        progressBar.style.transform = `translateX(-${100 - (stepIndex + 1) * 20}%)`;

        backButton.classList.toggle('hidden', stepIndex === 0);
        nextButton.classList.toggle('hidden', stepIndex === steps.length - 1);
        submitRequestButton.classList.toggle('hidden', stepIndex !== steps.length - 1);

        // Handle physical card specific fields
        if (stepIndex === 3) { // Delivery step
            toggleDeliveryAddressFields();
        } else {
            deliveryAddressGroup.classList.add('hidden');
        }

        if (stepIndex === 4) { // Confirm step
            populateConfirmationDetails();
        }
        hideErrorMessage();
    };

    const validateStep = (stepIndex) => {
        let isValid = true;
        let errorMessage = '';

        if (stepIndex === 0) { // Card Type
            if (!cardholderNameInput.value.trim()) {
                isValid = false;
                errorMessage = 'Cardholder name is required.';
            }
        } else if (stepIndex === 1) { // Usage
            const primaryUseCountryInput = document.getElementById('primary-use-country');
            if (!primaryUseCountryInput.value.trim()) {
                isValid = false;
                errorMessage = 'Country of primary use is required.';
            }
        } else if (stepIndex === 2) { // Spending Range
            // No specific validation needed beyond selection, as inputs are optional or select
        } else if (stepIndex === 3) { // Delivery
            if (cardTypeSelect.value === 'physical' && deliveryMethodSelect.value === 'express-delivery') {
                if (!deliveryAddressInput.value.trim() || !cityInput.value.trim() || !zipCodeInput.value.trim() || !stateProvinceInput.value.trim()) {
                    isValid = false;
                    errorMessage = 'All delivery address fields are required for express delivery of a physical card.';
                }
            }
        }
        
        if (!isValid) {
            showErrorMessage(errorMessage);
        } else {
            hideErrorMessage();
        }
        return isValid;
    };

    const showErrorMessage = (message) => {
        modalErrorMessage.textContent = message;
        modalErrorMessage.classList.remove('hidden');
    };

    const hideErrorMessage = () => {
        modalErrorMessage.classList.add('hidden');
        modalErrorMessage.textContent = '';
    };

    const toggleDeliveryAddressFields = () => {
        if (cardTypeSelect.value === 'physical' && deliveryMethodSelect.value === 'express-delivery') {
            deliveryAddressGroup.classList.remove('hidden');
        } else {
            deliveryAddressGroup.classList.add('hidden');
        }
    };

    const populateConfirmationDetails = () => {
        confirmCardType.textContent = cardTypeSelect.value === 'virtual' ? 'Virtual Debit' : 'Physical Debit';
        confirmCardholderName.textContent = cardholderNameInput.value || 'N/A';
        confirmUsage.textContent = document.getElementById('card-usage').value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        confirmCountry.textContent = document.getElementById('primary-use-country').value || 'N/A';
        confirmSpendingRange.textContent = document.getElementById('spending-range').value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        confirmDailyLimit.textContent = document.getElementById('daily-limit').value ? `$${parseFloat(document.getElementById('daily-limit').value).toLocaleString()}` : 'No Limit';

        confirmDeliveryMethod.textContent = deliveryMethodSelect.value === 'standard-mail' ? 'Standard Mail (7-10 business days)' : 'Express Delivery (2-3 business days)';
        
        if (cardTypeSelect.value === 'physical' && deliveryMethodSelect.value === 'express-delivery') {
            const address = `${deliveryAddressInput.value}, ${cityInput.value}, ${stateProvinceInput.value} ${zipCodeInput.value}`;
            confirmDeliveryAddress.textContent = address || 'N/A';
            confirmDeliveryMethodLine.classList.remove('hidden');
            confirmAddressLine.classList.remove('hidden');
        } else {
            confirmDeliveryMethodLine.classList.add('hidden');
            confirmAddressLine.classList.add('hidden');
        }
    };

    const openModal = () => {
        requestCardModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        currentStep = 0;
        showStep(currentStep);
    };

    const closeModal = () => {
        requestCardModal.classList.add('hidden');
        document.body.style.overflow = '';
        hideErrorMessage();
    };

    requestCardButton.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    if (closeRequestCardModalButton) {
        closeRequestCardModalButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking overlay
    requestCardModal.addEventListener('click', (e) => {
        if (e.target === requestCardModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !requestCardModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    if (submitRequestButton) {
        submitRequestButton.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                // Simulate API call for card request
                showToast('Card request submitted successfully!', 'success');
                closeModal();
                // In a real app, you'd send data to a backend here.
                console.log('Card Request Details:', {
                    cardType: cardTypeSelect.value,
                    cardholderName: cardholderNameInput.value,
                    usage: document.getElementById('card-usage').value,
                    country: document.getElementById('primary-use-country').value,
                    spendingRange: document.getElementById('spending-range').value,
                    dailyLimit: document.getElementById('daily-limit').value,
                    deliveryMethod: deliveryMethodSelect.value,
                    deliveryAddress: deliveryAddressInput.value,
                    city: cityInput.value,
                    zipCode: zipCodeInput.value,
                    stateProvince: stateProvinceInput.value
                });
            }
        });
    }

    // Event listener for card type change to show/hide delivery method
    cardTypeSelect.addEventListener('change', () => {
        if (cardTypeSelect.value === 'virtual') {
            deliveryMethodSelect.value = 'standard-mail'; // Virtual cards don't have express delivery
            deliveryMethodSelect.disabled = true;
        } else {
            deliveryMethodSelect.disabled = false;
        }
        toggleDeliveryAddressFields();
    });

    // Event listener for delivery method change
    deliveryMethodSelect.addEventListener('change', toggleDeliveryAddressFields);

    // Initial state for delivery fields based on default card type
    if (cardTypeSelect.value === 'virtual') {
        deliveryMethodSelect.disabled = true;
    } else {
        deliveryMethodSelect.disabled = false;
    }
    toggleDeliveryAddressFields(); // Call once on load to set initial visibility
}

// Initialize components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCardRequestModal();
});