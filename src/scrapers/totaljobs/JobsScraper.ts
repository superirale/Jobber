import puppeteer from "puppeteer-core";
import "dotenv/config";
import { format } from "date-fns";
import { ScrapedJob } from "../../Contracts/IJobs";


async function scrapeJobs(url: string, pages: number): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();

  // Configure Puppeteer to mimic human-like behavior
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setViewport({ width: 1366, height: 768 });

  try {
    const jobs = [];

    for (let i = 0; i < pages; i++) {
      let fullUrl = i > 0 ? url + `&page=${i + 1}` : url;

      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for job listings to load
      await page.waitForSelector('article[data-at="job-item"]', {
        timeout: 15000,
      });

      const pageJobs = await page.evaluate(() => {
        const jobElements = Array.from(
          document.querySelectorAll<HTMLElement>('article[data-at="job-item"]')
        );

        return jobElements.map((job) => {
          const extractText = (selector: string) =>
            job.querySelector(selector)?.textContent?.trim() || "Not specified";
          const dateElement = job.querySelector(
            'time[data-at="job-item-timeago"]'
          );

          return {
            title: extractText("h2.res-1tassqi a.res-1foik6i"),
            company: extractText(
              'div.res-1r68twq [data-at="job-item-company-name"] span.res-btchsq'
            ),
            location: extractText(
              'div.res-qchjmw [data-at="job-item-location"] span.res-btchsq'
            ),
            salary: extractText(
              'div.res-lgmafx [data-at="job-item-salary-info"]'
            ),
            url: `https://www.totaljobs.com${job
              .querySelector("h2.res-1tassqi a.res-1foik6i")
              ?.getAttribute("href")}`,
            rawDate: dateElement?.getAttribute("datetime") || "",
          };
        });
      });

      const processedJobs = pageJobs
        .filter((job) => job.url !== "https://www.totaljobs.comundefined")
        .map((job) => ({
          ...job,
          date: job.rawDate
            ? format(new Date(job.rawDate), "yyyy-MM-dd")
            : "Date not available",
        }));
      jobs.push(...processedJobs);
    }
    await browser.close();
    return jobs;
  } catch (error) {
    console.error("Scraping failed:", error);
    await browser.close();
    return [];
  }
}

export default scrapeJobs;
// const url =
//   "https://www.totaljobs.com/jobs/software-engineer?sort=2&action=sort_publish";
// // Run the scraper
// scrapeJobs(url, 1)
//   .then((jobs) => {
//     logger.info(`Found ${jobs.length} jobs:`);
//     sendJobsToTelegram(chatId, jobs, {
//       delayBetweenMessages: 2000, // 2 seconds between messages
//       maxMessagesPerBatch: 5, // Send 5 messages at a time
//     })
//       .then(() => console.log("Notification process completed"))
//       .catch(console.error);
//   })
//   .catch(console.error);
