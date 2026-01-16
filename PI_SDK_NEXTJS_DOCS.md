# 📚 Pi SDK Next.js Documentation Summary

## 📍 Repository
**URL:** https://github.com/pi-apps/pi-sdk-nextjs  
**Language:** TypeScript (50.5%) + JavaScript (49.5%)  
**Updated:** January 10, 2026 (17 hours ago)

---

## 🎯 What It Does

The **Pi SDK Next.js** is a package that helps you quickly scaffold and integrate Pi Network payments, authentication, and user flows into a Next.js project.

### Key Features:
- ✅ Automatic component generation (PiButton)
- ✅ API route scaffolding for payment lifecycle
- ✅ Works with both App Router and Pages Router
- ✅ Minimal boilerplate setup
- ✅ TypeScript support
- ✅ Production-ready

---

## 📦 Installation & Setup

### Step 1: Install Dependencies
```bash
yarn add pi-sdk-nextjs pi-sdk-react pi-sdk-js
# or
npm install pi-sdk-nextjs pi-sdk-react pi-sdk-js
```

### Step 2: Run the CLI Scaffolder
```bash
yarn pi-sdk-nextjs-install
```

**This generates:**
- ✅ `components/PiButton.tsx` - Ready-to-use React component
- ✅ API endpoints in `app/api/pi_payment/<event>/route.ts`:
  - `approve` - Payment approval
  - `complete` - Payment completion
  - `cancel` - Payment cancellation
  - `error` - Error handling
  - `incomplete` - Incomplete payment

### Step 3: Load Pi SDK Script
Add to your document head (e.g., `app/layout.tsx`):
```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

Or with Next.js Script component:
```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 4: Use PiButton in Your Components
```tsx
import { PiButton } from "@/components/PiButton";

export default function HomePage() {
  return (
    <div>
      <h1>My App</h1>
      <PiButton />
    </div>
  );
}
```

---

## 🎬 Video Script - Full Setup Commands

Here are all the commands from the official setup video:

```bash
# Create a new Next.js app
yarn create next-app tmtt_nextjs --yes

cd tmtt_nextjs

# Add the Pi SDK for Next.js
yarn add pi-sdk-nextjs@https://github.com/pi-apps/pi-sdk-nextjs

# Generate routes and PiButton component
yarn pi-sdk-nextjs-install

# Add Pi SDK script to layout (macOS/Linux syntax)
sed -i '' '3i\
import Script from "next/script";\
' app/layout.tsx

# Insert Script component in head
sed -i '' '28i\
       <head>\
          <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />\
        </head>\
' app/layout.tsx

# Import PiButton in home page
sed -i '' '2i\
import { PiButton } from "@/components/PiButton";\
' app/page.tsx

# Add PiButton to page
sed -i '' '38i\
   <PiButton/>\
' app/page.tsx

# Build the app
yarn build
```

---

## ❓ Frequently Asked Questions

### 1. **What does the CLI do?**
- Generates a ready-to-use `PiButton` component
- Creates stubbed/pluggable API routes for all payment lifecycle events
- Handles directory creation and "use client" directives

### 2. **How do I customize the generated code?**
- Edit `components/PiButton.tsx` and API route files directly
- New SDK versions won't overwrite existing files (unless you delete them first)
- Add a force flag to CLI if you want to regenerate

### 3. **Can I run the CLI multiple times?**
- ✅ Yes, it's safe
- CLI checks for pre-existing files and won't overwrite by default
- Useful for regenerating when updating the SDK

### 4. **Is this production-safe?**
- ✅ Yes, but always audit generated code before shipping
- Follow security best practices for payment handling
- Verify all API routes have proper validation

### 5. **What about advanced use cases?**
- Leverage hooks from `pi-sdk-react`
- Use server helpers from the SDKs
- Access the underlying `pi-sdk-js` and `pi-sdk-react` for custom flows
- Build custom payment flows beyond the PiButton

---

## 📚 Related SDKs & Resources

### Core SDKs
1. **pi-sdk-nextjs** (This package)
   - Next.js integration layer
   - CLI scaffolding
   - Component generation

2. **pi-sdk-react**
   - React hooks and components
   - Payment management
   - Authentication helpers
   - GitHub: https://github.com/pi-apps/pi-sdk-react

3. **pi-sdk-js**
   - Core JavaScript SDK
   - Low-level API access
   - Browser environment compatible
   - GitHub: https://github.com/pi-apps/pi-sdk-js

### Official Resources
- **Official Pi SDK Docs:** https://developer.minepi.com/
- **Pi Platform Docs:** https://github.com/pi-apps/pi-platform-docs
- **Community Developer Guide:** https://pi-apps.github.io/community-developer-guide/

---

## 🔧 Generated File Structure

After running `yarn pi-sdk-nextjs-install`, your project will have:

```
your-nextjs-app/
├── components/
│   └── PiButton.tsx          ← Ready-to-use component
├── app/
│   ├── api/
│   │   └── pi_payment/
│   │       ├── approve/route.ts
│   │       ├── complete/route.ts
│   │       ├── cancel/route.ts
│   │       ├── error/route.ts
│   │       └── incomplete/route.ts
│   └── layout.tsx            ← Add Pi SDK script here
└── package.json
```

---

## 💳 Payment Flow

### How It Works:

1. **User clicks PiButton** in your UI
2. **Pi Browser opens** payment dialog
3. **User approves payment** → calls `/api/pi_payment/approve`
4. **Transaction completes** → calls `/api/pi_payment/complete`
5. **Success handling** → customize the route to update your DB

### API Route Template:
```typescript
// app/api/pi_payment/complete/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate payment
  // Record in database
  // Send confirmation
  // Return response
}
```

---

## 🚀 Use Cases

### What You Can Build:
- ✅ Simple payment checkout page
- ✅ Subscription management
- ✅ Donation system
- ✅ Freemium app with paid features
- ✅ Digital product store
- ✅ Service payment system
- ✅ In-app purchases
- ✅ Reward system

---

## 🔐 Security Considerations

### Important:
1. **Validate all payments** server-side in your API routes
2. **Use environment variables** for sensitive data
3. **Verify payment amounts** before updating database
4. **Log all transactions** for auditing
5. **Implement rate limiting** on payment endpoints
6. **Handle errors gracefully** without exposing sensitive info

---

## 📊 Comparison: Your Current Setup vs Pi SDK Next.js

### Your Current Setup (DropPay):
```
✅ Custom React implementation
✅ Edge functions for payment handling
✅ Supabase for database
✅ Manual API integration
✅ Custom error handling
```

### Pi SDK Next.js Alternative:
```
✅ Automatic component generation
✅ Built-in API scaffolding
✅ Standard Next.js patterns
✅ Less boilerplate code
✅ Opinionated but flexible
```

---

## 🤔 Should You Use This for DropPay?

### Pros:
- ✅ Faster initial setup
- ✅ Less code to maintain
- ✅ Automatic component generation
- ✅ Community support
- ✅ Follows Next.js conventions

### Cons:
- ❌ Less customization (you have more control in your current setup)
- ❌ You'd need to refactor existing code
- ❌ Your current setup is already working perfectly
- ❌ More opinionated (your setup is more flexible)

### Recommendation:
**STICK WITH YOUR CURRENT SETUP** because:
1. ✅ It's already production-ready
2. ✅ You have more control
3. ✅ You've invested in custom features
4. ✅ Your code is tested and verified
5. ✅ You support both Pi Network AND DropPay payments
6. ✅ You have Supabase integration

This Pi SDK Next.js would be better for **new projects** starting from scratch.

---

## 🎓 Learning Path

If you want to learn more:

1. **Start Here:** Official docs at https://developer.minepi.com/
2. **For React:** https://github.com/pi-apps/pi-sdk-react
3. **For JavaScript:** https://github.com/pi-apps/pi-sdk-js
4. **Community Guide:** https://pi-apps.github.io/community-developer-guide/
5. **This Repository:** https://github.com/pi-apps/pi-sdk-nextjs

---

## 📝 Summary

The **Pi SDK Next.js** is a scaffolding tool that:
- Generates components and API routes
- Reduces boilerplate for new Next.js projects
- Provides a standardized payment flow
- Supports both App Router and Pages Router
- Is production-ready but should be audited

For DropPay specifically, your current custom implementation is superior because it's already working, tested, and has more flexibility!

---

**Date:** January 10, 2026  
**Status:** Current DropPay setup is optimal  
**Recommendation:** No migration needed
