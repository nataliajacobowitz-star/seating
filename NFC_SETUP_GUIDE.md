# NFC Setup Guide: Universal iPhone + Android Support

This guide explains how to set up NFC tags that work on **both iPhone and Android devices** using the same method.

## How It Works

### Primary Method (Works on Both iPhone and Android):
- **Program each NFC tag with a URL** pointing to your website
- When users tap the tag, it opens the website automatically
- The URL contains the guest ID as a parameter: `?nfc=nfc_XXX`
- **Works on both iPhone and Android** - no special apps needed!

### Secondary Method (Android Only):
- Uses **Web NFC API** to read the NFC tag's serial number directly
- Only works on Android devices with Chrome/Edge
- Useful for discovering NFC IDs or scanning unprogrammed tags

## Setup Instructions

### Step 1: Get Your Website URL

You'll need your website's full URL. Examples:
- Local testing: `http://YOUR_IP:8000`
- Production: `https://yourweddingwebsite.com`

### Step 2: Program NFC Tags (Works on Both iPhone and Android)

**This is the primary method that works on both platforms!**

Each NFC tag needs to be programmed with a URL in this format:
```
https://yourwebsite.com?nfc=nfc_001
https://yourwebsite.com?nfc=nfc_002
https://yourwebsite.com?nfc=nfc_010
```

Replace `nfc_001`, `nfc_002`, etc. with the actual NFC IDs from your CSV file.

**Once programmed, these tags work on both iPhone and Android!**

### Step 3: How to Program NFC Tags

#### Option A: Using Android App (Recommended)
1. Download **"NFC Tools"** or **"TagWriter by NXP"** from Google Play Store
2. Open the app and select "Write"
3. Choose "Add a record" → "URL/URI"
4. Enter the URL: `https://yourwebsite.com?nfc=nfc_001`
5. Tap "Write" and then tap your NFC sticker
6. Repeat for each sticker with the corresponding NFC ID

#### Option B: Using This Website (Android only)
1. Use the "Discover NFC ID" button to find each sticker's serial number
2. Note which sticker corresponds to which guest
3. Program each sticker with: `https://yourwebsite.com?nfc=SERIAL_NUMBER`

### Step 4: Update Your CSV File

Your `guests.csv` should have the NFC ID that matches:
- **For Android**: The serial number (what Web NFC reads)
- **For iPhone**: The `nfc` parameter in the URL you programmed

Example CSV:
```csv
NFC ID,Name,Table
nfc_001,John Smith,5
nfc_002,Jane Doe,5
nfc_010,Jennifer Taylor,15
```

### Step 5: Test Both Methods

**Test Android:**
1. Open website on Android device
2. Click "Scan NFC Sticker"
3. Tap the NFC tag
4. Should display guest info

**Test iPhone:**
1. Program NFC tag with URL: `https://yourwebsite.com?nfc=nfc_010`
2. Tap the tag with iPhone (unlocked)
3. Website opens automatically
4. Should display guest info

## Important Notes

### iPhone Requirements:
- iPhone 7 or newer
- Phone must be **unlocked** (not locked screen)
- NFC tag must contain a **URL** (not just serial number)
- Works with Safari, Chrome, or any browser

### Android Requirements:
- Chrome or Edge browser
- Android device with NFC
- Can read serial numbers directly (no programming needed)

## Universal Approach Benefits

✅ **Works on both iPhone and Android** - same method for everyone!
✅ **Simple setup** - program once, works everywhere
✅ **No special apps needed** - just tap the tag
✅ **Same CSV file** works for all devices
✅ **Same website** handles all methods
✅ **Android bonus**: Can also use Web NFC API for advanced scanning

## Troubleshooting

### iPhone: "Tag not found"
- Make sure the tag is programmed with a URL
- Ensure the URL format is correct: `?nfc=nfc_XXX`
- Check that the NFC ID in the URL matches your CSV

### Android: "Web NFC not supported"
- Use Chrome or Edge browser
- Make sure NFC is enabled in phone settings
- Device must support NFC

### Both: "Guest not found"
- Verify NFC ID in CSV matches exactly
- Check for typos or extra spaces
- Ensure the ID format matches (case-sensitive)

## Quick Reference

**URL Format for iPhone Tags:**
```
https://yourwebsite.com?nfc=NFC_ID_FROM_CSV
```

**Example:**
```
https://wedding.example.com?nfc=nfc_010
```

This will automatically show Jennifer Taylor's table information when tapped on iPhone!

