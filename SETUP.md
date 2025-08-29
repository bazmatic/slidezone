# SlideZone Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Choose Your Mode

#### Web App (Development)
```bash
npm run dev
```
Open http://localhost:5111 in your browser.

**Note**: In web mode, place your media files in the `public/media` folder.

#### Electron Desktop App (Recommended)
```bash
npm run electron-dev
```

This starts both the development server and the Electron app. The Electron app will open automatically and allow you to select any folder on your computer.

### 3. Using the Electron App

1. **Select a Folder**: Click "Choose Folder" to select any folder containing your photos and videos
2. **Browse Media**: The app automatically scans for supported media files
3. **Enjoy**: Your slideshow will start automatically
4. **Change Folders**: Use the "Change Folder" button to switch to a different folder

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

## Building for Distribution

### Development Build
```bash
npm run build
npm run electron
```

### Production Package
```bash
npm run dist
```

This creates distributable packages in the `dist` folder for:
- macOS (.dmg)
- Windows (.exe)
- Linux (.AppImage)

## Configuration

Edit `constants/config.ts` to customize:
- Photo display duration
- Video display duration
- Transition effects
- Ken Burns effect settings

## Troubleshooting

### Electron App Not Opening
- Ensure Node.js 18+ is installed
- Try running `npm run electron-dev` instead
- Check console for error messages

### Media Files Not Loading
- Verify file formats are supported
- Check file permissions
- Try a different folder

### Performance Issues
- Optimize image sizes (max 1920x1080 recommended)
- Compress video files
- Use WebP format for images when possible

## Development

### Project Structure
```
slidezone/
├── app/                 # Next.js app directory
├── components/          # React components
├── electron/            # Electron main process
├── types/              # TypeScript definitions
└── public/             # Static assets
```

### Available Scripts
- `npm run dev` - Next.js development server
- `npm run build` - Build Next.js app
- `npm run electron-dev` - Electron development mode
- `npm run electron` - Run built Electron app
- `npm run dist` - Create distributable packages 