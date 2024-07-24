# AKTU DOB FINDER

AKTU DOB FINDER is a Node.js application designed to find the date of birth (DOB) of students enrolled in Dr. A.P.J. Abdul Kalam Technical University (AKTU) using their roll numbers. The application automates the process of querying the AKTU OneView portal to retrieve student information.

## Features

- Searches for student information using roll numbers
- Attempts various date combinations to find the correct DOB
- Stores successful results in a CSV file
- Implements rate limiting to avoid overwhelming the server
- Uses random user agents to mimic different browsers

## Prerequisites

Before running this application, make sure you have Node.js installed on your system. You'll also need to install the following npm packages:

- axios
- cheerio
- qs

You can install these dependencies by running:

```
npm install axios cheerio qs
```

## Installation

1. Clone this repository or download the source code.
2. Navigate to the project directory in your terminal.
3. Install the required dependencies as mentioned in the prerequisites.

## Usage

1. Open the main script file (usually named `index.js` or similar).
2. Locate the `rollNumbersToSearch` array near the bottom of the file.
3. Replace `"ENTER ROLL NUMBER HERE"` with the actual roll numbers you want to search for. You can add multiple roll numbers to the array.
4. Run the script using Node.js:

```
node index.js
```

The script will process each roll number, attempting to find the student's information and DOB. Results will be displayed in the console and saved to a file named `successful_results.csv`.

## How It Works

1. The script iterates through a range of possible birth dates for each roll number.
2. It sends POST requests to the AKTU OneView portal for each date combination.
3. The HTML response is parsed to extract student information.
4. If a match is found, the information is logged to the console and saved to the CSV file.
5. The process continues until all roll numbers have been processed or a match is found.

## Configuration

You can modify the following parameters in the script to adjust its behavior:

- `userAgents`: Array of user agent strings to randomize request headers
- Date range: Currently set to years 2003-2006, can be adjusted if needed
- Delay between requests: Currently set to 5 seconds between roll numbers

## Output

Successful results are saved in `successful_results.csv` with the following format:

```
roll_number,name,date_of_birth
```

## Limitations and Legal Considerations

This script is for educational purposes only. Be aware that automated querying of the AKTU OneView portal may be against their terms of service. Use this script responsibly and consider the ethical implications of automated data retrieval.

## Contributing

Contributions to improve the script are welcome. Please fork the repository and submit a pull request with your changes.

## Disclaimer

This software is provided as-is, without any warranties or guarantees. The authors are not responsible for any misuse or damage caused by this software. Use at your own risk.
