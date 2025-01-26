import { DatabaseService, client } from './database/database.service'; 
import { ScrapingService } from './scraping/scraping.service';
import { DateUtils } from './utils/date.utils';
import { Student } from './interfaces';

async function processRollNumber(rollNumber: string): Promise<Student | null> {
  let result = await DatabaseService.findInDatabase(rollNumber);
  if (result) {
    return result;
  }

  let StartYear = 2000;
  let EndYear = 2004;

  for (let year = StartYear; year <= EndYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = DateUtils.getDaysInMonth(month, year);
      for (let day = 1; day <= daysInMonth; day++) {
        console.log(`Trying date: ${day}/${month}/${year}`);
        try {
          const parseResult = await ScrapingService.find(rollNumber, day, month, year);
          if (parseResult) {
            const result: Student = {
              ...parseResult,
              dob: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
            };

            console.log({
              name: result.name,
              applicationNumber: result.applicationNumber,
              dob: result.dob
            });

            await DatabaseService.saveToDatabase(result);
            return result;
          }
        } catch (error) {
          console.error('Error in execution:', error);
        }
      }
    }
  }

  console.log(`No result found for roll number ${rollNumber}`);
  return null;
}

async function main(rollNumbers: string[]) {
  try {
    const results = [];

    for (const rollNumber of rollNumbers) {
      console.log(`Processing ${rollNumber}`);
      const isValid = await ScrapingService.validateRollNumber(rollNumber);
      if (isValid) {
        const result = await processRollNumber(rollNumber);
        if (result) {
          results.push({
            name: result.name,
            applicationNumber: result.applicationNumber,
            dob: result.dob
          });
        } else {
          results.push({ rollNumber, result: null });
        }
      } else {
        console.log(`Skipping DOB search for invalid roll number: ${rollNumber}`);
        results.push({ rollNumber, result: "invalid" });
      }
    }
    console.log('Final results:', results);
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await client.close();
  }
}

const rollNumbersToSearch = ["ROLL_NUMBERS"];
main(rollNumbersToSearch);