# ChronoLingua - Natural Date Parsing Demo

A multilingual natural language date parser built with Next.js, React 19, and Sugar.js.

## Overview

ChronoLingua demonstrates natural language date parsing across multiple languages and locales. Users can enter date expressions like "tomorrow", "next week", or "in 3 days" in various languages, and the application will parse and format these expressions into actual dates.

### Features

- Natural language date parsing in multiple languages (English, German, French, Spanish, Italian, Japanese)
- Real-time date parsing and validation
- Responsive design that works on mobile and desktop
- Dark mode support
- Quick selection of common date expressions

## Tech Stack

- **Frontend**: React 19, Next.js 15
- **Styling**: Tailwind CSS, Shadcn UI
- **Date Parsing**: Sugar.js
- **Language Support**: Multiple locales via Sugar.js

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/natural-date-parsing-demo.git
cd natural-date-parsing-demo
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Select your preferred language from the dropdown
2. Enter a date expression in the input field (e.g., "tomorrow", "next week", "in 3 days")
3. Alternatively, click on one of the quick select options
4. View the parsed date result below

## Examples

Each language supports natural date expressions. Here are some examples:

- English: "tomorrow", "next week", "in 3 days"
- German: "morgen", "nächste woche", "in 3 tagen"
- French: "demain", "la semaine prochaine", "dans 3 jours"
- Spanish: "mañana", "la próxima semana", "en 3 días"
- Italian: "domani", "la prossima settimana", "tra 3 giorni"
- Japanese: "明日", "来週", "3日後"

## Project Structure

```
/
├── .cursor/rules/     # Cursor IDE rules for project consistency
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router components
│   │   ├── page.tsx   # Main application page
│   │   └── layout.tsx # Root layout component
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # Shadcn UI components
│   │   └── ...        # Application-specific components
```

## Cursor Rules

This project includes Cursor IDE rules to maintain code consistency. The rules are located in the `.cursor/rules/` directory and cover:

- General project guidelines
- React component structure and patterns
- Tailwind CSS styling conventions
- Sugar.js date parsing best practices

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Sugar.js](https://sugarjs.com/docs/)

## License

This project is MIT licensed.
