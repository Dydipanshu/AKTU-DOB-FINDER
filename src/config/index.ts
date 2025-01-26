import dotenv from 'dotenv';

dotenv.config();

export const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://localhost:27017';
export const AKTU_URL = 'https://oneview.aktu.ac.in/WebPages/aktu/OneView.aspx';

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
];

export const getRandomHeaders = () => ({
  'DNT': '1',
  'Origin': 'https://oneview.aktu.ac.in',
  'Referer': AKTU_URL,
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
});