import TelegramBot from "node-telegram-bot-api";
import { ScrapedJob } from "./Contracts/IJobs";

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new TelegramBot(telegramBotToken, { polling: false });

const formatJobMessage = (job: ScrapedJob, index: number): string => {
  return `
  <b>#${index + 1} ${job.title}</b>
  🏢 <b>Company:</b> ${job.company}
  📍 <b>Location:</b> ${job.location}
  💰 <b>Salary:</b> ${job.salary}
  📅 <b>Date Posted:</b> ${job.date}
  🔗 <a href="${job.url}">View Job</a>
    `.trim();
};

export const sendJobsToTelegram = async (
  chatId: string,
  jobs: ScrapedJob[],
  options: {
    delayBetweenMessages?: number; // in milliseconds
    maxMessagesPerBatch?: number;
  } = {}
): Promise<void> => {
  const { delayBetweenMessages = 1500, maxMessagesPerBatch = 10 } = options;

  try {
    // Send summary message first
    await bot.sendMessage(
      chatId,
      `🚨 Found ${jobs.length} new jobs!\n` +
        `---------------------------------`,
      { parse_mode: "HTML" }
    );

    // Send jobs in batches
    for (let i = 0; i < jobs.length; i += maxMessagesPerBatch) {
      const batch = jobs.slice(i, i + maxMessagesPerBatch);

      for (const [index, job] of batch.entries()) {
        const message = formatJobMessage(job, i + index);

        await bot.sendMessage(chatId, message, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });

        // Add delay if not last message
        if (i + index < jobs.length - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenMessages)
          );
        }
      }
    }

    console.log(`Successfully sent ${jobs.length} jobs to Telegram`);
  } catch (error) {
    console.error("Failed to send jobs to Telegram:", error);
    throw error;
  }
};

export const saveJobsInDB = (data: ScrapedJob): void => {};

export const IsJobinDB = (url: string): boolean => {
  return true;
};
