# Urology Residency Review System

A comprehensive React-based application for managing the review process of urology residency applicants. Built with TypeScript, Tailwind CSS, and Lucide React icons.

## Features

- **Secure Authentication**: Single password-based access system
- **Applicant Management**: Distribute applicants evenly among reviewers
- **Comprehensive Scoring**: 7-category scoring system with visual indicators
- **Review Interface**: Intuitive UI for scoring and decision-making
- **Admin Dashboard**: Monitor review progress and export data
- **Progress Tracking**: Real-time completion status for all reviewers
- **Data Export**: CSV export functionality for completed reviews

## Project Structure

```
urology-review-system/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── types.ts            # TypeScript type definitions
│   ├── UrologicalReviewSystem.tsx  # Main application component
│   └── index.tsx           # Application entry point
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The application will open in your default browser at `http://localhost:1234`

## Usage

### Authentication
- Enter the system password: `Urology2026`
- This provides access to the reviewer selection screen

### Reviewer Login
- Select your name from the list of reviewers
- The system will display your assigned applicants

### Reviewing Applicants
- Navigate through applicants using the review interface
- Score each applicant on 7 categories (1-5 scale):
  - Preference for Program
  - Ability to Handle Pressure
  - Commitment to Underserved
  - Leadership
  - Academic Performance
  - Research
  - Personal Attributes/Grit
- Add reviewer notes
- Make interview recommendation:
  - Definitely Interview
  - Maybe
  - Do Not Interview

### Admin Dashboard
- Access via "Admin Dashboard" button on login screen
- View overall progress and reviewer statistics
- Export all review data to CSV

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint (if configured)

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Parcel** - Build tool

## TypeScript Setup

The project uses strict TypeScript configuration with:
- JSX support for React
- Strict type checking
- Source maps for debugging
- ES2020 target for modern JavaScript features

## Troubleshooting

### Common Issues

1. **Dependencies not found**
   - Ensure you've run `npm install`
   - Check that Node.js and npm are installed

2. **TypeScript errors**
   - Run `npm run type-check` to see detailed errors
   - Ensure all imports are correct

3. **Build issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Parcel version compatibility

4. **Styling not loading**
   - Tailwind CSS is loaded via CDN in `public/index.html`
   - Ensure internet connection for CDN

### Password Issues
- The system uses a single password for all users
- Contact administrator if password needs to be changed

## Development

To modify the application:
1. Edit files in the `src/` directory
2. The development server will hot-reload changes
3. Run `npm run type-check` to ensure type safety

## Data Export

The admin dashboard allows exporting all review data to CSV format, including:
- Applicant information
- All scoring categories
- Reviewer notes
- Interview recommendations
- Total scores

## Security Note

This application uses a simple password system for demonstration purposes. In production, implement proper authentication and authorization mechanisms.