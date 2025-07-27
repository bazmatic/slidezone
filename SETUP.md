# SlideZone Setup Guide

## Quick Start

1. **Install Dependencies** (already done)
   ```bash
   npm install
   ```

2. **Add Your Media Files**
   - Place your photos and videos in the `public/media/` folder
   - Supported formats:
     - Photos: .jpg, .jpeg, .png, .gif, .bmp, .webp
     - Videos: .mp4, .webm, .ogg, .mov, .avi

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - The slideshow will automatically start

## Features

### Controls
- **Space**: Play/Pause
- **← →**: Navigate between files
- **S**: Shuffle playlist
- **Settings**: Click the gear icon to adjust timing

### Configuration
- Photos display for 5 seconds (configurable)
- Videos loop until reaching 10 seconds (configurable)
- Smooth transitions between media files

### Display
- Fullscreen optimized
- Responsive design
- Progress indicators
- Video progress bars

## Example Usage

1. Add some sample images to `public/media/`:
   ```
   public/media/
   ├── vacation-photo-1.jpg
   ├── family-video.mp4
   ├── sunset.png
   └── party-clip.webm
   ```

2. The app will automatically:
   - Detect file types
   - Shuffle the order
   - Display photos for 5 seconds
   - Play videos for up to 10 seconds
   - Loop through all media files

## Customization

Edit `constants/config.ts` to change default settings:
```typescript
export const DEFAULT_CONFIG: SlideshowConfig = {
  photoDisplaySeconds: 8,    // Photos display for 8 seconds
  videoDisplaySeconds: 15,   // Videos max 15 seconds
  transitionDuration: 500,   // Faster transitions
};
```

## Troubleshooting

- **No media files showing**: Check that files are in `public/media/` and have supported extensions
- **Videos not playing**: Ensure video format is supported by your browser (MP4 recommended)
- **Performance issues**: Optimize image sizes and compress videos

## Development

- **Build for production**: `npm run build && npm start`
- **Lint code**: `npm run lint`
- **Type checking**: Built into the build process

The application is now ready to use! Add your media files and enjoy your slideshow. 