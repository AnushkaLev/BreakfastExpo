# Step 1: Clone from GitHub (downloads the code)
git clone https://github.com/YOUR_USERNAME/BreakfastExpo.git
cd BreakfastExpo

# Step 2: Install dependencies (creates node_modules/)
npm install

# Step 3: Start the HTTP server for preview.html
python3 -m http.server 8083 --bind 0.0.0.0

# Step 4: Start Expo (in another terminal)
npx expo start
