import puppeteer from "puppeteer-core";
import "dotenv/config";
import { format } from "date-fns";
import { ScrapedJob } from "../../Contracts/IJobs";
import logger from "../../Logger";

async function scrapeJobs(url: string, pages: number): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
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
      await page
        .waitForSelector("", {
          timeout: 30000,
        })
        .catch((err) => {
          logger.info("no results found");
        });

      const pageJobs = await page.evaluate(() => {
        const jobElements = Array.from(
          document.querySelectorAll<HTMLElement>("")
        );

        return jobElements.map((job) => {
          const extractText = (selector: string) =>
            job.querySelector(selector)?.textContent?.trim() || "Not specified";
          const dateElement = job.querySelector("");

          return {
            title: extractText(""),
            company: extractText(""),
            location: extractText(""),
            salary: extractText(""),
            url: `${job.querySelector("")?.getAttribute("href")}`,
            rawDate: dateElement?.getAttribute("") || "",
            date: "",
          };
        });
      });

      jobs.push(...pageJobs);
    }
    return jobs;
  } catch (error) {
    console.error("Scraping failed:", error);
    return [];
  } finally {
    await browser.close();
  }
}

export default scrapeJobs;
