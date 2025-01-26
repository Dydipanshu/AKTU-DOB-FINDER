# AKTU OneView DOB Finder 🔍

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?logo=mongodb)](https://www.mongodb.com/)
[![GitHub License](https://img.shields.io/github/license/Dydipanshu/AKTU-DOB-FINDER)](https://github.com/Dydipanshu/AKTU-DOB-FINDER/blob/main/LICENSE)

**Repository**: [https://github.com/Dydipanshu/AKTU-DOB-FINDER](https://github.com/Dydipanshu/AKTU-DOB-FINDER)

A secure TypeScript solution to find AKTU student details while maintaining privacy and data protection.

![Workflow Diagram](https://i.imgur.com/mV8pD5a.png)

## Security First 🔒
- `.env` file gitignored by default
- Database credentials via environment variables
- No hardcoded sensitive information
- Random User-Agent rotation
- Rate-limited requests

## Installation 💻
```bash
git clone https://github.com/Dydipanshu/AKTU-DOB-FINDER.git
cd AKTU-DOB-FINDER
npm install
cp .env.example .env
```

## Configuration ⚙️
Edit `.env` file:
```env
MONGO_DB_URI=""
DATABASE_NAME = ""
VIEWSTATE = ""
VIEWSTATEGENERATOR = ""
EVENTVALIDATION = ""

```

## Usage 🚀
```bash
# Build project
npm run build

# Run scraper
npm start
```

## Project Structure 🗂️
```
AKTU-DOB-FINDER/
├── src/
│   ├── config/        # Environment config
│   ├── database/      # MongoDB operations
│   ├── scraping/      # Web scraping logic
│   ├── utils/         # Helper functions
│   ├── interfaces/    # Type definitions
│   └── main.ts        # Entry point
├── .env.example       # Env template
├── tsconfig.json      # TS config
└── package.json       # Dependencies
```

## Scripts 📜
```bash
npm run build   # Compile TS to JS
npm start       # Run application
npm run clean   # Remove build artifacts
```

## Contributing 🤝
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## License 📄
MIT License - See [LICENSE](https://github.com/Dydipanshu/AKTU-DOB-FINDER/blob/main/LICENSE)

## Disclaimer ⚠️
This tool is for educational purposes only. Ensure compliance with:
- AKTU website terms of service
- Data protection laws (GDPR, CCPA)
- Ethical hacking guidelines

**Never use this to access data without proper authorization**