import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36'
];

const aktuUrl = 'https://oneview.aktu.ac.in/WebPages/aktu/OneView.aspx' ;

const headers = {
    'DNT': '1',
    'Origin': 'https://oneview.aktu.ac.in',
    'Referer': aktuUrl,
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
};

async function extractViewStateParams(htmlText) {
    return {
        viewState: htmlText.match(/name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)"/)?.[1] || '',
        viewStateGenerator: htmlText.match(/name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="([^"]+)"/)?.[1] || '',
        eventValidation: htmlText.match(/name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)"/)?.[1] || ''
    };
}

async function find(rollnumber, day, month, year) {
    const data = qs.stringify({
        '__EVENTTARGET': '', '__EVENTARGUMENT': '',
        '__VIEWSTATE': '/wEPDwULLTExMDg0MzM4NTIPZBYCAgMPZBYEAgMPZBYEAgkPDxYCHgdWaXNpYmxlaGRkAgsPDxYCHwBnZBYCAgEPDxYCHwBnZBYCAgMPDxYCHgdFbmFibGVkZ2RkAgkPZBYCAgEPZBYCZg9kFgICAQ88KwARAgEQFgAWABYADBQrAABkGAEFEmdyZFZpZXdDb25mbGljdGlvbg9nZI39oJgydt1DpqkTbfYVCIehpm4TLMtdl7PeRLzN+5Jy',
        '__VIEWSTATEGENERATOR': 'FF2D60E4',
        '__EVENTVALIDATION': '/wEdAAbVARScphHwmjwD865sI1EeWB/t8XsfPbhKtaDxBSD9Lx25Lt8Vu4DZSHACA6NZjXuO1N1XNFmfsMXJasjxX85jSqX/wPN6qcfKF0mMYn5Pzrqic3S0ZDjCzqE9M2ZhdeRT68jJfo8Qy8cvEUD7m7ars0BV+cLKRjL8DPXKB3128Q==',
        'txtRollNo': rollnumber,
        'txtDOB': `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
        'btnSearch': 'खोजें',
        'hidForModel': ''
    });

    try {
        const { data: responseData } = await axios.post(aktuUrl, data, { headers });
        const parseData = parseHtml(responseData);
        
        if (parseData?.success) {
            console.log(`Found result: ${JSON.stringify(parseData)}`);
        }
        
        return parseData;
    } catch (error) {
        console.error('Error in find function:', error);
        return null;
    }
}
async function validateRollNumber(rollNumber) {
    // Validate roll number format
    const cleanRollNumber = rollNumber.replace(/^0+/, '');
    if (!/^\d+$/.test(cleanRollNumber) || cleanRollNumber.length < 10 || cleanRollNumber.length > 13) {
        console.log('Invalid roll number format.');
        return false;
    }

    try {
        // Fetch initial page to get view state parameters
        const response = await axios.get(aktuUrl, { headers });
        const htmlText = response.data;

        // Extract view state parameters using regex
        const { viewState, viewStateGenerator, eventValidation } = await extractViewStateParams(htmlText);

        // Prepare form data using qs
        const formData = qs.stringify({
            '__EVENTTARGET': '',
            '__EVENTARGUMENT': '',
            'txtRollNo': rollNumber,
            'btnProceed': 'आगे बढ़े', // Hindi text for 'Proceed'
            '__VIEWSTATE': viewState,
            '__VIEWSTATEGENERATOR': viewStateGenerator,
            '__EVENTVALIDATION': eventValidation
        });

        // Send validation request
        const validationResponse = await axios.post(aktuUrl, formData, { 
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const responseText = validationResponse.data;

        // Check if roll number is invalid
        const invalidMessages = [
            'गलत ���नुक्रमांक', 
            'आपके द्वारा प्रदान किया गया अनुक्रमांक गलत है'
        ];

        if (invalidMessages.some(msg => responseText.includes(msg))) {
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

    return {
        success: true,
        applicationNumber,
        name,
        COP,
        sgpaValues
    };
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

async function processRollNumber(rollnumber) {
    for (let year = 2003; year <= 2005; year++) {
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = getDaysInMonth(month, year);
            for (let day = 1; day <= daysInMonth; day++) {
                console.log(`Trying date: ${day}/${month}/${year}`);
                try {
                    const result = await find(rollnumber, day, month, year);
                    if (result) {
                        result.dob = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                        console.log({
                            name: result.name,
                            applicationNumber: result.applicationNumber,
                            dob: result.dob
                        });

                        return result;
                    }
                } catch (error) {
                    console.error('Error in execution:', error);
                }
            }
        }
    }

    console.log(`No result found for roll number ${rollnumber}`);
    return null;
}

async function main(rollNumbers) {
    try {
        const results = [];

        for (const rollNumber of rollNumbers) {
            console.log(`Processing ${rollNumber}`);
            const isValid = await validateRollNumber(rollNumber);
            if (isValid) {
                const result = await processRollNumber(rollNumber);
                if (result) {
                    results.push({
                        name: result.name,
                        applicationNumber: result.applicationNumber,
                        dob: result.dob,
                        COP: result.COP,
                        SGPA: result.sgpaValues
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
    }
}

const rollNumbersToSearch = ["Enter roll number here"];
main(rollNumbersToSearch);
