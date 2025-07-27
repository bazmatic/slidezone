# SlideZone - Media Slideshow App

A simple Next.js application that displays photos and videos as a slideshow in random order. Photos display for a configurable number of seconds, while videos loop until they reach a separately configurable duration.

## Features

- **Random Order**: Media files are shuffled and displayed in random order
- **Configurable Timing**: 
  - Photos display for a set number of seconds (default: 5 seconds)
  - Videos loop until they reach a configurable duration (default: 10 seconds)
- **Ken Burns Effect**: Cinematic zoom and pan effects for photos
  - Multiple effect types: zoom in/out, pan in all directions, combined zoom-pan
  - Configurable duration and intensity
  - Can be enabled/disabled per user preference
- **Fullscreen Display**: Optimized for fullscreen viewing
- **Keyboard Controls**:
  - `Space`: Play/Pause slideshow
  - `←` `→`: Navigate between media files
  - `S`: Shuffle the playlist
- **Touch Controls**: On-screen controls for mobile devices
- **Progress Tracking**: Shows current position and time remaining
- **Video Progress Bar**: Visual progress indicator for videos

## Supported File Types

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

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Media Files**
   - Create a `public/media` folder in your project
   - Place your photos and videos in this folder
   - Supported formats will be automatically detected

3. **Configuration**
   - Edit `constants/config.ts` to customize timing settings:
     ```typescript
     export const DEFAULT_CONFIG: SlideshowConfig = {
       photoDisplaySeconds: 5,    // How long photos display
       videoDisplaySeconds: 10,   // Max duration for videos
       transitionDuration: 1000,  // Transition animation duration
       enableKenBurns: true,      // Enable Ken Burns effect for photos
       kenBurnsDuration: 5000,    // Ken Burns effect duration
     };
     ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - The slideshow will automatically start

## Usage

### Basic Controls
- **Play/Pause**: Click the play/pause button or press `Space`
- **Next**: Click the next button or press `→`
- **Previous**: Click the previous button or press `←`
- **Shuffle**: Click the shuffle button or press `S`

### Fullscreen Mode
- Press `F11` to enter fullscreen mode for the best viewing experience
- The app is optimized for fullscreen display

### Mobile Support
- Touch-friendly controls
- Responsive design
- Swipe gestures (coming soon)

## Project Structure

```
slidezone/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Slideshow.tsx      # Main slideshow component
│   ├── MediaDisplay.tsx   # Media rendering component
│   └── Controls.tsx       # Control interface
├── types/                 # TypeScript type definitions
│   └── media.ts
├── constants/             # Configuration constants
│   └── config.ts
├── utils/                 # Utility functions
│   └── mediaLoader.ts
└── public/               # Static files
    └── media/            # Place your media files here
```

## Customization

### Changing Display Times
Edit the configuration in `constants/config.ts`:

```typescript
export const DEFAULT_CONFIG: SlideshowConfig = {
  photoDisplaySeconds: 8,    // Photos display for 8 seconds
  videoDisplaySeconds: 15,   // Videos max 15 seconds
  transitionDuration: 500,   // Faster transitions
  enableKenBurns: true,      // Enable Ken Burns effect
  kenBurnsDuration: 4000,   // Ken Burns duration
};
```

### Adding New File Types
Update the supported extensions in `constants/config.ts`:

```typescript
export const SUPPORTED_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'];
export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
```

### Ken Burns Effects
The Ken Burns effect adds cinematic movement to still photos:

- **Zoom In**: Gradually zooms into the image
- **Zoom Out**: Gradually zooms out from the image
- **Pan Left/Right/Up/Down**: Moves the view in different directions
- **Zoom Pan**: Combines zoom and pan for dynamic movement
- **Random Selection**: Each photo gets a random effect for variety

Configure the effects in the settings panel or in `constants/config.ts`:
```typescript
export const DEFAULT_CONFIG: SlideshowConfig = {
  enableKenBurns: true,      // Enable/disable Ken Burns effects
  kenBurnsDuration: 5000,    // Duration of the effect in milliseconds
};
```

### Styling
- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for custom Tailwind configurations
- Component-specific styles are in each component file

## Development

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Media Files Not Loading
- Ensure files are in the `public/media` folder
- Check file extensions are supported
- Verify file permissions

### Videos Not Playing
- Ensure video format is supported by the browser
- Check video files are not corrupted
- Try converting to MP4 format

### Performance Issues
- Optimize image sizes (recommended max: 1920x1080)
- Compress video files
- Use WebP format for images when possible

## License

MIT License - feel free to use and modify as needed. 