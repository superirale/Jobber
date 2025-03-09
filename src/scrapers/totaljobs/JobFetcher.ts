import puppeteer from "puppeteer-core";
import logger from "../../Logger";
import { format } from "date-fns";

interface ScrapedJob {
  title: string;
  url: string;
  location: string;
  salary: string;
  // date: string;
  company: string;
}

async function scrapeJobUrls(): Promise<ScrapedJob[]> {
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
    logger.debug("starting...");

    // Replace with actual URL or use local HTML file
    await page.goto("https://www.totaljobs.com/jobs/software-engineer", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for job listings to load
    await page.waitForSelector('article[data-at="job-item"]', {
      timeout: 15000,
    });

    const jobs = await page.evaluate(() => {
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

    await browser.close();
    return jobs.filter(
      (job) => job.url !== "https://www.totaljobs.comundefined"
    );
  } catch (error) {
    console.error("Scraping failed:", error);
    await browser.close();
    return [];
  }
}

// Run the scraper
scrapeJobUrls()
  .then((jobs) => {
    logger.info(`Found ${jobs.length} jobs:`);
    jobs.forEach((job, index) => {
      console.log(`#${index + 1} ${job.title}`);
      console.log(`🏢 Company: ${job.company}`);
      console.log(`📍 Location: ${job.location}`);
      console.log(`💰 Salary: ${job.salary}`);
      console.log(`🔗 URL: ${job.url}\n`);
    });
  })
  .catch(console.error);
