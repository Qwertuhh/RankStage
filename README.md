# RankStage

A modern web application for ranking stages in a game.

## Features

- **User Authentication** - Secure login and registration system
- **Email Verification** - Account verification via email
- **Docker Support** - Containerized development environment
- **TypeScript** - Type-safe JavaScript development
- **React** - Modern frontend framework
- **SMTP Integration** - For sending transactional emails

## Tech Stack

- **Frontend**: React, TypeScript, Redux, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Email**: SMTP with Mailpit for development
- **Containerization**: Docker
- **Security**: HTTPS with mkcert for local development

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker & Docker Compose
- mkcert (for local HTTPS)
- Chocolatey (Windows package manager)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rankstage.git
cd rankstage
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
# Add other environment variables here
```

### 4. Set Up HTTPS (Local Development)

#### Install Chocolatey (Windows)

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### Install mkcert

```powershell
choco install mkcert
```

#### Generate SSL Certificates

```bash
mkcert -install
mkcert -cert-file cert.pem -key-file key.pem localhost
```

### 5. Start Development Environment

```bash
# Start Docker containers
docker compose up -d

# Start development server
npm run dev
# or
yarn dev
```

Visit: `https://localhost:3000`

## Testing

```bash
npm test
# or
yarn test
```

## Build

```bash
npm run build
# or
yarn build
```

## Learning Journey

### Technologies Learned

- **TypeScript**: Improved type safety and developer experience
- **Docker**: Containerization and service orchestration
- **SMTP**: Email delivery system implementation
- **React Hooks**: Modern React patterns and state management
- **Environment Configuration**: Managing different environments

### Challenges Overcome

1. **Email Delivery**: Implemented a reliable email verification system
2. **HTTPS Setup**: Configured local development with trusted certificates
3. **Docker Integration**: Containerized the application for consistent environments
4. **Type Safety**: Improved code quality with TypeScript

## Project Structure

```
rankstage/
├── src/                    # Source files
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   │   ├── mailer.ts       # Email functionality
│   │   └── templates/      # Email templates
│   └── ...
├── public/                 # Static files
├── docker-compose.yaml     # Docker Compose configuration
├── Dockerfile              # Docker configuration
└── ...
```

## Development Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature`
2. Make your changes and commit them
3. Push to the branch: `git push origin feature/your-feature`
4. Create a Pull Request

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Mailpit](https://github.com/axllent/mailpit) - Email testing tool
- [mkcert](https://github.com/FiloSottile/mkcert) - Local SSL certificates
- [Create React App](https://create-react-app.dev/) - Project bootstrapping
- [Docker](https://www.docker.com/) - Containerization platform

## Contact

[Qwertuhh](https://github.com/qwertuhh)

Project Link: [RankStage](https://github.com/qwertuhh/rankstage)