# EPOP Installation Instructions

## Step-by-Step Installation

### 1. Prerequisites Check

Verify you have the required software:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies

```bash
npm install
```

This will install approximately 1,500+ packages. It may take 2-5 minutes depending on your internet connection.

**Expected output:**
```
added 1500+ packages in 3m
```

### 3. Create Environment File

```bash
# Windows (PowerShell)
Copy-Item .env.local.example .env.local

# macOS/Linux
cp .env.local.example .env.local
```

### 4. Configure Environment Variables

Open `.env.local` and set:

```env
# Required - Change these in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Optional - Defaults are fine for development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REGISTRATION=false
```

**Important**: For development, you can leave the JWT secrets as-is. For production, generate strong secrets:

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
> epop-spa@0.1.0 dev
> node server.js

> Ready on http://localhost:3000
> Socket.IO server running
```

### 6. Open Browser

Navigate to: [http://localhost:3000](http://localhost:3000)

You should see the login page.

### 7. Login

Use the default credentials:
- **Email**: `admin@epop.com`
- **Password**: `password123`

You'll be redirected to the Dashboard.

## Verification Checklist

After installation, verify:

- [ ] Login page loads without errors
- [ ] Can login with default credentials
- [ ] Dashboard displays with cards
- [ ] Left rail navigation works
- [ ] Theme toggle works (light/dark)
- [ ] No console errors in browser DevTools
- [ ] Socket.IO connection established (check Network tab)

## Common Issues

### Port 3000 Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Change the port
```bash
# Windows
$env:PORT=3001; npm run dev

# macOS/Linux
PORT=3001 npm run dev
```

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**: Clear and reinstall
```bash
# Windows
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# macOS/Linux
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error**: Type errors in terminal

**Solution**: Run type check
```bash
npm run type-check
```

### Socket.IO Not Connecting

**Error**: WebSocket connection failed

**Solution**: Ensure you're running `npm run dev` (not `next dev`)
The custom server in `server.js` is required for Socket.IO.

### Build Errors

**Error**: Build fails

**Solution**: Check Node version
```bash
node --version  # Must be 18+
```

## Development Tools

### Recommended VS Code Extensions

Install these for the best experience:

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`
4. **TypeScript and JavaScript** - Built-in

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

After successful installation:

1. **Explore the Dashboard** - Check out the summary cards
2. **Review Documentation** - Read `README.md` and `docs/frontend/`
3. **Check Implementation Status** - See `IMPLEMENTATION_STATUS.md`
4. **Start Building Features** - Follow the guides in `docs/frontend/`

## Getting Help

If you encounter issues:

1. Check `SETUP.md` for detailed setup instructions
2. Review `README.md` for architecture overview
3. Check the browser console for errors
4. Check the terminal for server errors
5. Verify all dependencies installed correctly

## Production Deployment

For production deployment, see:
- `SETUP.md` - Production deployment section
- `README.md` - Deployment platforms

**Remember**: Change JWT secrets and configure all environment variables for production!

---

Installation complete! You're ready to build. 🚀
