#!/bin/bash
# Simple script to start the local server

echo "Starting wedding place cards server..."
echo ""
echo "The website will open automatically in your browser."
echo "To test nfc_010, visit: http://localhost:8000?test=nfc_010"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python
if command -v python3 &> /dev/null; then
    python3 server.py
elif command -v python &> /dev/null; then
    python server.py
else
    echo "Error: Python is not installed. Please install Python 3 to run the server."
    echo ""
    echo "Alternatively, you can use any HTTP server:"
    echo "  - Python: python3 -m http.server 8000"
    echo "  - Node.js: npx http-server -p 8000"
    echo "  - PHP: php -S localhost:8000"
    exit 1
fi

