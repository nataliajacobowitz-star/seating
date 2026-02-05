# Complete Guide: Reading and Programming NFC Stickers

## Quick Answer: How to Find NFC IDs

**Easiest Method - Use This Website:**
1. Open the website on your Android phone (Chrome browser)
2. Click "Discover NFC ID" button
3. Tap your NFC sticker to the back of your phone
4. The NFC ID (serial number) will be displayed
5. Copy it and add it to your `guests.csv` file

## Understanding NFC Tags

NFC (Near Field Communication) tags have:
- **Serial Number (UID)**: Unique ID that cannot be changed - this is what you need!
- **NDEF Data**: Optional data that can be written/read (like URLs, text, etc.)

For this wedding place card system, you only need the **Serial Number** - you don't need to program the tags with any data.

## Method 1: Using This Website (Recommended)

### Steps:
1. **Serve the website** on your Android device:
   - Make sure your phone and computer are on the same WiFi
   - Start the server: `python3 server.py`
   - Find your computer's IP address (e.g., `192.168.1.100`)
   - On your phone, visit: `http://YOUR_IP:8000`

2. **Discover NFC IDs:**
   - Click "Discover NFC ID" button
   - Tap each NFC sticker to your phone
   - Copy each ID and note which sticker it belongs to
   - Add them to your `guests.csv` file

## Method 2: Using Android Apps

### Option A: NFC Tools (Free)
1. Download **"NFC Tools"** from Google Play Store
2. Open the app
3. Go to "Read" tab
4. Tap "Read" button
5. Tap your NFC sticker
6. Look for "Serial Number" or "UID" - this is your NFC ID
7. Write it down and add to your CSV

### Option B: NFC TagInfo by NXP (Free)
1. Download **"NFC TagInfo"** from Google Play Store
2. Open the app
3. Tap "Tag Information"
4. Tap your NFC sticker
5. Look for "UID" or "Serial Number"
6. Copy it to your CSV

### Option C: TagWriter by NXP (Free)
1. Download **"TagWriter"** from Google Play Store
2. Open the app
3. Tap "Read Tag"
4. Tap your NFC sticker
5. View the "Tag UID" or "Serial Number"

## Method 3: Using iPhone (Limited)

**Note:** iPhones have very limited NFC capabilities. You can only read NFC tags that contain specific data (like URLs) through the Shortcuts app, but you cannot easily read the serial number.

**Workaround for iPhone users:**
- Use an Android device to read the NFC IDs
- Or use the website method on an Android device
- Or borrow an Android phone temporarily

## Method 4: Using NFC Reader Hardware

If you have an NFC reader/writer device (like ACR122U, PN532, etc.):
- Use software like **NFC Tools** (desktop) or **libnfc** utilities
- Connect the reader to your computer
- Scan each tag to get the UID

## Programming NFC Tags (Optional)

**You don't need to program the tags for this project!** The website reads the serial number directly.

However, if you want to program tags with data (like URLs), here's how:

### Using Android Apps:

1. **NFC Tools** (Free):
   - Open app → "Write" tab
   - Choose what to write (URL, text, etc.)
   - Tap "Write"
   - Tap your NFC sticker

2. **TagWriter by NXP** (Free):
   - Open app → "Write Tags"
   - Choose content type
   - Follow prompts to write

### What to Write (if desired):
- **URL**: Point to your wedding website
- **Text**: Guest name and table number
- **vCard**: Contact information

**Important:** Writing data to tags doesn't change the serial number. The serial number is permanent and cannot be modified.

## Step-by-Step: Setting Up Your NFC Stickers

### 1. Get All NFC IDs
- Use the "Discover NFC ID" feature on the website
- Or use an Android app
- Create a list: `Sticker 1 → nfc_abc123`, `Sticker 2 → nfc_def456`, etc.

### 2. Match Stickers to Guests
- Decide which sticker goes to which guest
- Write it down: `John Smith → nfc_abc123 → Table 5`

### 3. Update CSV File
Edit `guests.csv`:
```csv
NFC ID,Name,Table
nfc_abc123,John Smith,5
nfc_def456,Jane Doe,5
nfc_ghi789,Michael Johnson,12
```

### 4. Test Each Sticker
- Use the website's test mode
- Or scan each sticker to verify it shows the correct guest

## Troubleshooting

### "Can't read NFC tag"
- Make sure NFC is enabled on your phone (Settings → NFC)
- Hold the sticker steady on the back of your phone
- Try different positions (NFC antenna location varies by phone)
- Some phones have NFC on the front (check your phone's manual)

### "NFC ID keeps changing"
- This shouldn't happen - serial numbers are permanent
- Make sure you're reading the Serial Number/UID, not NDEF data
- Try a different app if the current one shows inconsistent results

### "Tag not found in database"
- Double-check the NFC ID matches exactly in your CSV
- No extra spaces or characters
- Case-sensitive matching (nfc_001 vs NFC_001)

### "Web NFC not supported"
- Must use Chrome or Edge on Android
- Must be served over HTTPS (or localhost)
- Some older Android versions may not support Web NFC

## Recommended Workflow

1. **Preparation:**
   - Get all your NFC stickers
   - Have your guest list ready (names and table numbers)

2. **Discovery Phase:**
   - Use "Discover NFC ID" on the website
   - Scan each sticker and label it (e.g., put a number on the sticker)
   - Create a mapping: `Sticker #1 = nfc_xyz123 = John Smith`

3. **Data Entry:**
   - Update `guests.csv` with all NFC IDs and guest info
   - Double-check for typos

4. **Testing:**
   - Test each sticker using the website
   - Verify correct name and table appear

5. **Deployment:**
   - Place stickers on place cards
   - Set up the website on a tablet or phone at the wedding
   - Guests can tap their sticker to see their table number

## Quick Reference: NFC ID Format

NFC IDs can appear in different formats:
- Hexadecimal: `04A1B2C3D4E5F6`
- Decimal: `123456789012345`
- With prefix: `nfc_04A1B2C3D4E5F6`

**Important:** Use the exact format you see when reading the tag. The website will match it exactly as it appears in your CSV.

## Need Help?

- Check browser console (F12) for error messages
- Verify CSV file format is correct
- Make sure NFC is enabled on your device
- Test with the "Test Mode" dropdown first to verify the website works

