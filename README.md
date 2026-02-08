# ReBento

A decentralized link-in-bio builder powered by Arweave. Create your personal page, import from Bento.me, and store it permanently on the permaweb.

## What is ReBento?

ReBento is a free, open-source alternative to link-in-bio tools like Linktree and Bento.me. Unlike traditional services that can shut down or delete your data, ReBento stores your profile permanently on Arweave — a decentralized storage network where data lives forever.

**Key Features:**
- Drag-and-drop bento grid editor
- Import existing Bento.me profiles
- Permanent storage via Arweave
- Custom profile URLs via ArLink (ar.io gateway)
- Social media cards with platform detection
- Rich text and media support
- Dark/light theme customization

## How It Works

### Claiming Your Username

1. Visit the landing page and enter your desired username
2. Click "Claim" to open the editor with your username pre-filled
3. Customize your grid with links, social cards, images, and text
4. Connect your Arweave wallet and publish

Your profile will be accessible at:
```
https://rebento_arlink.ar.io/yourname
```

### Importing from Bento.me

With Bento.me shutting down on February 13, 2025, ReBento makes it easy to migrate:

1. Click "Import from Bento" on the landing page
2. Enter your Bento username (e.g., `yourname` from `bento.me/yourname`)
3. Your cards, profile, and theme are automatically imported
4. Make any adjustments in the editor
5. Publish to Arweave for permanent storage

## Arweave & Permanent Storage

### Why Arweave?

Traditional web hosting is temporary — servers go offline, companies shut down, and data gets deleted. Arweave is different:

- **Permanent**: Data is stored forever through a one-time payment model
- **Decentralized**: No single point of failure
- **Immutable**: Once published, your profile can't be taken down or modified (you can publish updates)
- **Censorship-resistant**: No company can remove your content

### How Publishing Works

1. **Connect Wallet**: ReBento uses [Wander](https://wander.ar) to connect your Arweave wallet
2. **Sign Transaction**: Your profile data is bundled and signed with your wallet
3. **Upload to Arweave**: The signed data is uploaded to the Arweave network
4. **ArLink Gateway**: Your profile is served via ar.io's ArLink gateway for human-readable URLs

### Wallet Setup

To publish your profile, you'll need:

1. An Arweave wallet (create one at [arweave.app](https://arweave.app))
2. Some AR tokens for transaction fees (typically < $0.01)
3. The [Wander](https://wander.ar) browser extension installed

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Drag & Drop**: dnd-kit
- **Routing**: React Router DOM
- **Wallet**: @wanderapp/connect
- **Arweave**: arbundles for transaction bundling

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/rebento.git
cd rebento

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
src/
├── components/
│   └── bento/          # Grid editor components
│       ├── BentoGrid.tsx
│       ├── BentoCard.tsx
│       ├── ProfileSection.tsx
│       └── SocialCardContent.tsx
├── context/
│   └── WalletContext.tsx   # Arweave wallet provider
├── lib/
│   ├── bentoImporter.ts    # Bento.me data fetcher
│   └── bentoMapper.ts      # Bento to ReBento data mapper
├── pages/
│   ├── LandingPage.tsx
│   ├── EditorPage.tsx
│   └── ProfilePage.tsx
├── sections/               # Landing page sections
│   ├── Hero.tsx
│   ├── WidgetShowcase.tsx
│   ├── CTASection.tsx
│   └── Footer.tsx
└── types/
    └── index.ts            # TypeScript definitions
```

## Supported Card Types

| Type | Description |
|------|-------------|
| Social | Platform-specific cards with icons (Twitter, Instagram, GitHub, etc.) |
| Link | Generic link preview with favicon, title, and description |
| Image | Media cards with optional caption and click-through URL |
| Text | Rich text content with markdown support |
| Section Header | Full-width header to organize your grid |

## License

MIT

---

Built with love for the permanent web.
