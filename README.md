# CAD to USD Converter for EPTravelCards

A Chrome extension that adds USD values to CAD amounts on the EPTravelCards balance page.

## Features

- Automatically converts CAD values to USD on the EPTravelCards balance page
- Shows USD values next to the original CAD values in the Fees, Amount, and Balance Remaining columns
- Uses real-time exchange rates from exchangerate-api.com
- Includes a fallback exchange rate if the API is unavailable

## Installation

### Build from Source

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   npm run package
   ```
   This will create a `dist` folder with the compiled extension.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `dist` folder from this project
4. The extension is now installed and will automatically run when you visit https://eptravelcards.com/Account/Balance

## Usage

1. Log in to your EPTravelCards account
2. Navigate to the Balance page
3. The extension will automatically add USD values in green text next to the CAD amounts
4. A note with the current exchange rate will be displayed below the table

## Development

- After making changes to the JavaScript files, run `npm run build` to copy them to the dist folder
- Reload the extension in Chrome by clicking the refresh icon on the extension card in `chrome://extensions/`

## Notes

- This extension only works on the EPTravelCards balance page
- The exchange rate is fetched from exchangerate-api.com when the page loads
- If the API is unavailable, a fallback rate of 0.74 USD per CAD is used
- The extension includes safeguards to prevent duplicate USD values from being added to the same cell
