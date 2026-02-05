# Wedding Place Cards - NFC Reader

A web application that displays personalized guest information when an NFC sticker is tapped.

## Features

- Reads NFC stickers using the Web NFC API
- Displays guest name and table number based on NFC ID
- **NFC ID Discovery Mode**: Easily find the serial numbers of your NFC stickers
- Test mode for simulating NFC taps without physical stickers
- Modern, responsive UI design
- CSV-based guest database

## Requirements

- **Browser**: Chrome (Android) or Edge (Android) - Web NFC API is only supported on Android devices
- **HTTPS**: The site must be served over HTTPS (or localhost) for Web NFC to work
- **NFC-enabled device**: Android device with NFC capability

## Setup

1. **Update the CSV file**: Edit `guests.csv` with your actual guest data. The CSV should have three columns:
   - `NFC ID`: The unique identifier from your NFC stickers
   - `Name`: Guest's name
   - `Table`: Table number

2. **Serve the files**: You need to serve the files over HTTPS (or localhost). You can use:

   **Option A: Python HTTP Server (for localhost testing)**
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in Chrome on your Android device (make sure your phone and computer are on the same network, and use your computer's IP address).

   **Option B: Deploy to a web server** (for production)
   - Upload all files to your web server
   - Ensure HTTPS is enabled
   - Access the site from your Android device

## Usage

### Discovering NFC IDs (First Time Setup)

1. Open the website on an Android device with Chrome or Edge
2. Click the **"Discover NFC ID"** button
3. Tap an NFC sticker to the back of your device
4. The NFC ID (serial number) will be displayed - copy it!
5. Repeat for all stickers and add the IDs to your `guests.csv` file

### Viewing Guest Information

1. Open the website on an Android device with Chrome or Edge
2. Click the **"Scan NFC Sticker"** button
3. Tap an NFC sticker to the back of your device
4. The guest's name and table number will be displayed

## CSV Format

The `guests.csv` file should follow this format:

```csv
NFC ID,Name,Table
nfc_001,John Smith,5
nfc_002,Jane Doe,5
nfc_003,Michael Johnson,12
```

**Important Notes:**
- Column names are case-insensitive and can include variations (e.g., "NFC ID", "nfc id", "NFCID" all work)
- The NFC ID must match exactly what the NFC sticker returns (usually a serial number)
- Make sure there are no extra spaces in the CSV values

## Finding NFC IDs

**Easiest Method - Use the Website:**
1. Click the **"Discover NFC ID"** button on the website
2. Tap your NFC sticker
3. Copy the displayed NFC ID
4. Add it to your `guests.csv` file

**Alternative Methods:**
- Use an NFC reader app on your phone (see `NFC_GUIDE.md` for recommendations)
- Check the browser console when scanning (though the Discover button is easier)

For detailed instructions, see `NFC_GUIDE.md` - a complete guide to reading and programming NFC stickers.

## Browser Compatibility

- ✅ Chrome (Android) - Full support
- ✅ Edge (Android) - Full support
- ❌ iOS Safari - No Web NFC support
- ❌ Desktop browsers - Limited support (NFC hardware required)

## Troubleshooting

- **"Web NFC is not supported"**: Make sure you're using Chrome or Edge on an Android device
- **"NFC permission denied"**: Allow NFC permissions when prompted
- **"Guest not found"**: Check that the NFC ID in your CSV matches the actual sticker ID
- **"Error loading CSV"**: Ensure `guests.csv` is in the same directory as `index.html`

## License

Free to use for your wedding!

