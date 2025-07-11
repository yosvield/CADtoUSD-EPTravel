/**
 * Content script for CAD to USD Converter Chrome Extension
 * This script runs on https://eptravelcards.com/Account/Balance
 * It adds USD values to the CAD amounts in the balance table
 */

// Flag to prevent observer from triggering while we're updating
let isUpdating = false;

// Function to check if a cell already has USD value
function hasUSDValue(cell) {
    return cell.innerHTML.includes('USD') || cell.querySelector('span') !== null;
}

// Function to fetch the CAD to USD exchange rate
async function getExchangeRate() {
    try {
        // Using exchangerate-api.com for exchange rates
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/CAD');
        const data = await response.json();
        return data.rates.USD;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Default fallback rate if API fails
        return 0.74;
    }
}

// Function to convert CAD to USD
function convertCADtoUSD(cadAmount, exchangeRate) {
    // Remove currency symbol and commas, then parse as float
    const numericValue = parseFloat(cadAmount.replace(/[^\d.-]/g, ''));
    if (isNaN(numericValue)) return '';

    // Convert to USD and format with 2 decimal places
    const usdValue = numericValue * exchangeRate;
    return `${usdValue.toFixed(2)} USD`;
}

// Function to update the table with USD values
async function updateTableWithUSDValues() {
    // If we're already updating, don't do it again
    if (isUpdating) return;

    try {
        // Set flag to prevent observer from triggering
        isUpdating = true;

        // Wait for the table to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the exchange rate
        const exchangeRate = await getExchangeRate();

        // Find and update the balance div at the top of the page
        const balanceDiv = document.querySelector('div[style*="padding:10px"]');
        if (balanceDiv && balanceDiv.textContent.includes('Balance:') && !hasUSDValue(balanceDiv)) {
            const balanceText = balanceDiv.textContent.trim();
            const usdValue = convertCADtoUSD(balanceText, exchangeRate);
            if (usdValue) {
                balanceDiv.innerHTML = `${balanceText} <span style="color: green;">(${usdValue})</span>`;
            }
        }

        // Find the table rows
        const tableRows = document.querySelectorAll('table.table tbody tr');

        if (tableRows.length === 0) {
            console.log('No table rows found. The page might not be fully loaded or the structure has changed.');
            isUpdating = false;
            return;
        }

        // Process each row
        tableRows.forEach(row => {
            // Get the cells containing CAD values (Fees, Amount, Balance Remaining)
            const cells = row.querySelectorAll('td');

            // Check if we have enough cells
            if (cells.length >= 6) {
                // Fees column (index may vary based on actual table structure)
                const feesCell = cells[3];
                // Only update if the cell doesn't already have USD value
                if (!hasUSDValue(feesCell)) {
                    const feesText = feesCell.textContent?.trim() || '';
                    if (feesText && feesText !== '0') {
                        const usdValue = convertCADtoUSD(feesText, exchangeRate);
                        feesCell.innerHTML = `${feesText} <span style="color: green;">(${usdValue})</span>`;
                    }
                }

                // Amount column
                const amountCell = cells[4];
                // Only update if the cell doesn't already have USD value
                if (!hasUSDValue(amountCell)) {
                    const amountText = amountCell.textContent?.trim() || '';
                    if (amountText && amountText !== '0') {
                        const usdValue = convertCADtoUSD(amountText, exchangeRate);
                        amountCell.innerHTML = `${amountText} <span style="color: green;">(${usdValue})</span>`;
                    }
                }

                // Balance Remaining column (corrected index from 4 to 5)
                const balanceCell = cells[5];
                // Only update if the cell doesn't already have USD value
                if (!hasUSDValue(balanceCell)) {
                    const balanceText = balanceCell.textContent?.trim() || '';
                    if (balanceText && balanceText !== '0') {
                        const usdValue = convertCADtoUSD(balanceText, exchangeRate);
                        balanceCell.innerHTML = `${balanceText} <span style="color: green;">(${usdValue})</span>`;
                    }
                }
            }
        });

        // Add a note about the exchange rate above the table (only if it doesn't exist yet)
        if (!document.querySelector('.exchange-rate-note')) {
            const table = document.querySelector('table.table');
            if (table) {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'exchange-rate-note';
                noteDiv.style.marginBottom = '10px';
                noteDiv.style.fontSize = '12px';
                noteDiv.style.color = '#666';
                noteDiv.innerHTML = `Exchange rate: 1 CAD = ${exchangeRate.toFixed(4)} USD (Data from exchangerate-api.com)`;
                table.parentNode?.insertBefore(noteDiv, table);
            }
        }
    }
    catch (error) {
        console.error('Error updating table with USD values:', error);
    }
    finally {
        // Reset flag when done
        isUpdating = false;
    }
}

// Run the main function when the page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateTableWithUSDValues);
}
else {
    updateTableWithUSDValues();
}

// Also run the function when the page content changes (for dynamic content)
const observer = new MutationObserver(() => {
    updateTableWithUSDValues();
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });
