# SlideZone

A beautiful slideshow application that displays photos and videos with smooth transitions and Ken Burns effects. Available as both a web app and an Electron desktop application.

## Features

- **Photo & Video Support**: Displays JPG, PNG, GIF, BMP, WebP, MP4, WebM, OGG, MOV, and AVI files
- **Ken Burns Effect**: Smooth zoom effects for photos
- **Customizable Timing**: Adjust display duration for photos and videos
- **Smooth Transitions**: Configurable transition effects between media
- **Folder Selection**: Choose any folder on your computer (Electron app)
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd slidezone
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Web App (Development)

Run the development server:
```bash
npm run dev
```

Open [http://localhost:5111](http://localhost:5111) in your browser.

**Note**: In web mode, media files should be placed in the `public/media` folder.

### Electron Desktop App

#### Development Mode
```bash
npm run electron-dev
```

This will start both the Next.js development server and the Electron app.

#### Production Build
```bash
# Build the app
npm run electron-build

# Or create a distributable package
npm run dist
```

The built app will be available in the `dist` folder.

## Electron App Features

The Electron version allows you to:

1. **Select Any Folder**: Click "Choose Folder" to select any folder on your computer
2. **Browse Media**: The app will automatically scan for supported media files
3. **Change Folders**: Use the "Change Folder" button to switch to a different folder
4. **Desktop App**: Runs as a native desktop application

## Configuration

You can customize the slideshow behavior by modifying `constants/config.ts`:

```typescript
export const DEFAULT_CONFIG: SlideshowConfig = {
  photoDisplaySeconds: 10,      // How long to show each photo
  videoDisplaySeconds: 30,      // How long to show each video
  transitionDuration: 1000,     // Transition duration in milliseconds
  enableKenBurns: true,         // Enable Ken Burns effect for photos
  kenBurnsDuration: 5000,       // Ken Burns effect duration
};
```

## Supported File Formats

### Photos
- JPG/JPEG
- PNG
- GIF
- BMP
- WebP

### Videos
- MP4
- WebM
- OGG
- MOV
- AVI

## Development

### Project Structure

```
slidezone/
├── app/                 # Next.js app directory
├── components/          # React components
├── constants/           # Configuration constants
├── electron/            # Electron main process
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── public/             # Static assets
```

### Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js app
- `npm run electron` - Run Electron app (requires built app)
- `npm run electron-dev` - Run Electron app in development mode
- `npm run electron-build` - Build Electron app
- `npm run dist` - Create distributable package

## Building for Distribution

### macOS
```bash
npm run dist
```

### Windows
```bash
npm run dist
```

### Linux
```bash
npm run dist
```

The distributable packages will be created in the `dist` folder.

## License

This project is licensed under the MIT License. 