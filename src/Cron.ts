import logger from "./Logger";
import "dotenv/config";
import scrapeJobs from "./Scrapers/Totaljobs/JobsScraper";
import {
  isJobInDB,
  loadSubscriptions,
  saveJobsInDB,
  sendJobsToTelegram,
} from "./Utils";
import { Subscription } from "./Contracts/IJobs";

(async () => {
  const subs: Subscription = await loadSubscriptions(
    process.env.SUBSCRIPTION_FILE || ""
  );

  logger.info("Starting scheduled job scraper");

  for await (let [chatId, subscriptions] of Object.entries(subs)) {
    for await (let subscription of subscriptions) {
      const { url, pages, keywords } = subscription;

      const scrapedJobs = await scrapeJobs(url, pages);
      const jobs = await Promise.all(
        scrapedJobs.map(async (sJob) => {
          if (keywords && !keywords.includes(sJob.title.toLowerCase())) {
            return;
          }
          const jobExists = await isJobInDB(sJob.url);
          if (!jobExists) {
            await saveJobsInDB(sJob);
            return sJob;
          }
        })
      ).then((results) => results.filter((job) => job !== undefined));
      if (jobs.length) {
        sendJobsToTelegram(chatId, jobs, {
          delayBetweenMessages: 2000, // 2 seconds between messages
          maxMessagesPerBatch: 10, // Send 5 messages at a time
        });
      }
    }
  }
  logger.info("ending scheduled job scraper");
})();
