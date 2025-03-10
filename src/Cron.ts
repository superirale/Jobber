import cron from "node-cron";
import logger from "./Logger";
import "dotenv/config";
import scrapeJobs from "./Scrapers/Totaljobs/JobsScraper";
import { isJobInDB, saveJobsInDB, sendJobsToTelegram } from "./Utils";
import { JobSite, ScrapedJob, Subscription } from "./Contracts/IJobs";

const subs: Subscription = {
  174068618: [
    {
      url: "https://www.totaljobs.com/jobs/software-engineer?sort=2&action=sort_publish",
      site: JobSite.totaljobs,
      pages: 1,
    },
  ],
};

// Run every 30 minutes
cron.schedule("*/1 * * * *", async () => {
  logger.info("Starting scheduled job scraper");
  for await (let [chatId, subscriptions] of Object.entries(subs)) {
    for await (let subscription of subscriptions) {
      const { url, pages } = subscription;

      const scrapedJobs = await scrapeJobs(url, pages);
      const jobs = await Promise.all(
        scrapedJobs.map(async (sJob) => {
          const jobExists = await isJobInDB(sJob.url);
          if (!jobExists) {
            await saveJobsInDB(sJob);
            return sJob;
          }
        })
      ).then((results) => results.filter((job) => job !== undefined));

      sendJobsToTelegram(chatId, jobs, {
        delayBetweenMessages: 2000, // 2 seconds between messages
        maxMessagesPerBatch: 10, // Send 5 messages at a time
      });
    }
  }
});
