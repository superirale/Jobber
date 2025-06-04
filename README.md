# Jobber - Job Scraping & Notification Bot 🤖

## Overview
Jobber is a TypeScript-based application that automatically scrapes job postings from multiple job boards and sends notifications through Telegram. Perfect for job seekers who want to stay updated with the latest opportunities.

## 🚀 Features

- 🔍 Multi-site job scraping (Indeed, TotalJobs, CWJobs)
- 🔎 Keyword-based job filtering
- 📱 Real-time Telegram notifications
- 🔄 Duplicate prevention using CouchDB
- ⏰ Configurable scraping intervals
- 📋 Multiple subscription support

## 📋 Prerequisites

- Node.js
- Google Chrome
- CouchDB
- Telegram Bot Token
- TypeScript

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jobber
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.sample .env
```

Update `.env` with your settings:
```env
CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SCRAPE_INTERVAL=0 10 * * *
COUCHDB_URL=your_couchdb_url
SUBSCRIPTION_FILE=path_to_subscriptions.json
```

4. Create `subscriptions.json`:
```json
{
  "telegram_chat_id": [
    {
      "url": "job_search_url",
      "site": "totaljobs",
      "pages": 2,
      "keywords": ["typescript", "javascript"]
    }
  ]
}
```

## 🏗️ Building

```bash
npm run build
```

## 🚀 Running

```bash
chmod +x run-bot.sh
./run-bot.sh
```

## 📁 Project Structure

```
/src
├── /Contracts       # TypeScript interfaces and types
├── /Scrapers       # Job site specific scrapers
├── Cron.ts         # Scheduling logic
├── Logger.ts       # Logging configuration
└── Utils.ts        # Helper functions & Telegram integration
```

## 🛠️ Technologies

- TypeScript
- Puppeteer
- Node-Telegram-Bot-API
- Winston (logging)
- CouchDB
- date-fns

## 🔒 Security

Never commit sensitive information in:
- `.env` file
- `subscriptions.json`
- Any configuration files

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
