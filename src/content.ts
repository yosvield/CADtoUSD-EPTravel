/**
 * Content script for CAD to USD Converter Chrome Extension
 * This script runs on https://eptravelcards.com/Account/Balance
 * It adds USD values to the CAD amounts in the balance table
 */

// Function to fetch the CAD to USD exchange rate
async function getExchangeRate(): Promise<number> {
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
function convertCADtoUSD(cadAmount: string, exchangeRate: number): string {
  // Remove currency symbol and commas, then parse as float
  const numericValue = parseFloat(cadAmount.replace(/[^\d.-]/g, ''));
  if (isNaN(numericValue)) return '';
  
  // Convert to USD and format with 2 decimal places
  const usdValue = numericValue * exchangeRate;
  return `$${usdValue.toFixed(2)} USD`;
}

// Function to update the table with USD values
async function updateTableWithUSDValues() {
  try {
    // Wait for the table to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the exchange rate
    const exchangeRate = await getExchangeRate();
    
    // Find the table rows
    const tableRows = document.querySelectorAll('table.table tbody tr');
    
    if (tableRows.length === 0) {
      console.log('No table rows found. The page might not be fully loaded or the structure has changed.');
      return;
    }
    
    // Process each row
    tableRows.forEach(row => {
      // Get the cells containing CAD values (Fees, Amount, Balance Remaining)
      const cells = row.querySelectorAll('td');
      
      // Check if we have enough cells
      if (cells.length >= 5) {
        // Fees column (index may vary based on actual table structure)
        const feesCell = cells[2];
        const feesText = feesCell.textContent?.trim() || '';
        if (feesText && feesText !== '$0.00') {
          const usdValue = convertCADtoUSD(feesText, exchangeRate);
          feesCell.innerHTML = `${feesText} <span style="color: green;">(${usdValue})</span>`;
        }
        
        // Amount column
        const amountCell = cells[3];
        const amountText = amountCell.textContent?.trim() || '';
        if (amountText && amountText !== '$0.00') {
          const usdValue = convertCADtoUSD(amountText, exchangeRate);
          amountCell.innerHTML = `${amountText} <span style="color: green;">(${usdValue})</span>`;
        }
        
        // Balance Remaining column
        const balanceCell = cells[4];
        const balanceText = balanceCell.textContent?.trim() || '';
        if (balanceText && balanceText !== '$0.00') {
          const usdValue = convertCADtoUSD(balanceText, exchangeRate);
          balanceCell.innerHTML = `${balanceText} <span style="color: green;">(${usdValue})</span>`;
        }
      }
    });
    
    // Add a note about the exchange rate
    const table = document.querySelector('table.table');
    if (table) {
      const noteDiv = document.createElement('div');
      noteDiv.style.marginTop = '10px';
      noteDiv.style.fontSize = '12px';
      noteDiv.style.color = '#666';
      noteDiv.innerHTML = `Exchange rate: 1 CAD = ${exchangeRate.toFixed(4)} USD (Data from exchangerate-api.com)`;
      table.parentNode?.insertBefore(noteDiv, table.nextSibling);
    }
    
  } catch (error) {
    console.error('Error updating table with USD values:', error);
  }
}

// Run the main function when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateTableWithUSDValues);
} else {
  updateTableWithUSDValues();
}

// Also run the function when the page content changes (for dynamic content)
const observer = new MutationObserver(() => {
  updateTableWithUSDValues();
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });
