# MotionAI - Image to Video Generator

Transform your static images into stunning animated videos using AI. Upload an image, choose a motion style, and watch as AI brings your photos to life.

## Features

- 🖼️ **Image Upload** - Easy drag-and-drop image upload interface
- 🎬 **Motion Styles** - Choose from preset motion styles or create custom prompts
- ⚡ **Fast Processing** - Quick video generation with real-time status updates
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 📱 **Mobile Friendly** - Works seamlessly on all devices

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-image-to-video
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # Shadcn UI components
│   └── ...        # Feature components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── main.tsx       # Application entry point
```

## Usage

1. **Upload Image** - Click or drag-and-drop an image to upload
2. **Select Motion Style** - Choose from preset motion styles or leave empty
3. **Custom Prompt** (Optional) - Add your own detailed motion description
4. **Generate** - Click the generate button and wait for your video
5. **Download** - View and download your generated video

## Development

The app uses Vite for fast hot module replacement (HMR) during development. Any changes you make will be reflected immediately in the browser.

## License

MIT
