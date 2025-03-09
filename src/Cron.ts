import cron from "node-cron";
import logger from "./Logger";
import "dotenv/config";
import scrapeJobs from "./Scrapers/Totaljobs/JobsScraper";
import { sendJobsToTelegram } from "./Utils";

const chatId = process.env.TELEGRAM_CHAT_ID || "";
const urls: string[] = [
  "https://www.totaljobs.com/jobs/software-engineer?sort=2&action=sort_publish",
];

// Run every 30 minutes
cron.schedule("*/1 * * * *", async () => {
  logger.info("Starting scheduled scrape");
  for await (let url of urls) {
    const jobs = await scrapeJobs(url, 3);

    sendJobsToTelegram(chatId, jobs, {
      delayBetweenMessages: 2000, // 2 seconds between messages
      maxMessagesPerBatch: 5, // Send 5 messages at a time
    });
  }
});
