import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';
import { AKTU_URL, getRandomHeaders } from '../config';
import { ViewStateParams, ParseResult, Student } from '../interfaces';
import { DatabaseService } from '../database/database.service';

export class ScrapingService {
  static async extractViewStateParams(htmlText: string): Promise<ViewStateParams> {
    const viewState = htmlText.match(/name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)"/)?.[1] || '';
    const viewStateGenerator = htmlText.match(/name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="([^"]+)"/)?.[1] || '';
    const eventValidation = htmlText.match(/name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)"/)?.[1] || '';
    return { viewState, viewStateGenerator, eventValidation };
  }

  static async find(rollNumber: string, day: number, month: number, year: number): Promise<ParseResult | null> {
    const data = qs.stringify({
      '__EVENTTARGET': '',
      '__EVENTARGUMENT': '',
      '__VIEWSTATE': process.env.VIEWSTATE,
      '__VIEWSTATEGENERATOR': process.env.VIEWSTATEGENERATOR,
      '__EVENTVALIDATION': process.env.EVENTVALIDATION,
      'txtRollNo': rollNumber,
      'txtDOB': `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
      'btnSearch': 'खोजें',
      'hidForModel': ''
    });
  
    try {
      const response = await axios.post(AKTU_URL, data, { headers: getRandomHeaders() });
      return ScrapingService.parseHtml(response.data);
    } catch (error) {
      console.error('Error in find function:', error);
      return null;
    } 
  }
  

  static parseHtml(htmlContent: string): ParseResult | null {
    const $ = cheerio.load(htmlContent);
    const applicationNumber = $('#lblRollNo').text().trim() || 'N/A';
    const name = $('#lblFullName').text().trim() || 'N/A';
    const COP = $('#ctl04_lblCOP').text().trim() || 'N/A';
    const sgpaValues: string[] = [];

    $('td > span:contains("SGPA")').each((index, element) => {
      const sgpaValue = $(element).parent().next('td').next('td').find('span').text().trim();
      sgpaValues.push(sgpaValue);
    });

    if (applicationNumber === 'N/A' && name === 'N/A' && sgpaValues.length === 0) {
      return null;
    }

    return {
      success: true,
      applicationNumber,
      name,
      COP,
      sgpaValues
    };
  }

  static async validateRollNumber(rollNumber: string): Promise<Student | boolean> {
    const alreadyInDb = await DatabaseService.findInDatabase(rollNumber);
    if (alreadyInDb) {
      console.log(`${rollNumber} found in DB.....skipping Validation`);
      return alreadyInDb;
    }

    const cleanRollNumber = rollNumber.replace(/^0+/, '');
    if (!/^\d+$/.test(cleanRollNumber) || cleanRollNumber.length < 10 || cleanRollNumber.length > 13) {
      console.log('Invalid roll number format.');
      return false;
    }

    try {
      const response = await axios.get(AKTU_URL, { headers: getRandomHeaders() });
      const { viewState, viewStateGenerator, eventValidation } = await ScrapingService.extractViewStateParams(response.data);

      const formData = qs.stringify({
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        'txtRollNo': rollNumber,
        'btnProceed': 'आगे बढ़े',
        '__VIEWSTATE': viewState,
        '__VIEWSTATEGENERATOR': viewStateGenerator,
        '__EVENTVALIDATION': eventValidation
      });

      const validationResponse = await axios.post(AKTU_URL, formData, {
        headers: {
          ...getRandomHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const invalidMessages = [
        'गलत अनुक्रमांक',
        'आपके द्वारा प्रदान किया गया अनुक्रमांक गलत है'
      ];

      if (invalidMessages.some(msg => validationResponse.data.includes(msg))) {
        console.log('Invalid roll number.');
        return false;
      }

      console.log('Roll number is valid!');
      return true;
    } catch (error) {
      console.error('Error during validation:', error);
      return false;
    }
  }
}