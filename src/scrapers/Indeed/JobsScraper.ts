import puppeteer from "puppeteer";
import { ScrapedJob } from "../../Contracts/IJobs";

async function scrapeJobs(url: string, pages: number): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for job cards to load
    await page.waitForSelector("li.css-1ac2h1w.eu4oa1w0");

    const jobs = await page.$$eval(
      "li.css-1ac2h1w.eu4oa1w0 div.cardOutline.tapItem",
      (cards) => {
        return cards.map((card) => {
          const title =
            card
              .querySelector("h2.jobTitle a.jcs-JobTitle")
              ?.textContent?.trim() || "";
          const url = `https://uk.indeed.com/${card
            .querySelector("h2.jobTitle a.jcs-JobTitle")
            ?.getAttribute("href")
            ?.trim()}`;

          const company =
            card
              .querySelector('[data-testid="company-name"]')
              ?.textContent?.trim() || "";
          const location =
            card
              .querySelector('[data-testid="text-location"]')
              ?.textContent?.trim() || "";
          const salary =
            card
              .querySelector('[data-testid="attribute_snippet_testid"]')
              ?.textContent?.trim() || "";

          return {
            title,
            company,
            location,
            url,
            salary,
            date: "",
          };
        });
      }
    );

    return jobs;
  } catch (error) {
    console.error("Scraping failed:", error);
    return [];
  } finally {
    await browser.close();
  }
}

export default scrapeJobs;
