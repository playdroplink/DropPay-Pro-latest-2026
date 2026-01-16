# InstructionModal Component Usage Guide

## Overview
The `InstructionModal` is a reusable React component that displays payment instructions and guidance to users. It was created to replace the hardcoded modal in PayPage.tsx and can be used across the application for consistent payment instruction experiences.

## Location
```
src/components/InstructionModal.tsx
```

## Props Interface

```typescript
interface InstructionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  steps?: string[];
  linkUrl?: string;
  showCopyButton?: boolean;
  showDownloadLink?: boolean;
  downloadLink?: string;
  downloadLinkText?: string;
  securityNote?: string;
}
```

## Props Detail

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility (required) |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when modal state changes (required) |
| `title` | `string` | "Payment Instructions" | Modal title |
| `description` | `string` | Default Pi Browser message | Main description text |
| `steps` | `string[]` | Default 4-step payment flow | Array of instruction steps |
| `linkUrl` | `string` | undefined | URL to copy when "Copy Link" clicked |
| `showCopyButton` | `boolean` | true | Show/hide copy button |
| `showDownloadLink` | `boolean` | true | Show/hide download link |
| `downloadLink` | `string` | "https://minepi.com/download" | Link for "Download" button |
| `downloadLinkText` | `string` | "Download Pi Browser here" | Text for download link |
| `securityNote` | `string` | Pi Browser security message | Security/info note box text |

## Usage Examples

### Basic Usage (Default Pi Payment Instructions)
```tsx
import { InstructionModal } from '@/components/InstructionModal';
import { useState } from 'react';

export function MyPaymentPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Show Payment Instructions
      </button>

      <InstructionModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        linkUrl={window.location.href}
      />
    </>
  );
}
```

### Custom Instructions
```tsx
<InstructionModal
  isOpen={showModal}
  onOpenChange={setShowModal}
  title="Ad Network Instructions"
  description="Watch ads in Pi Browser to earn Drop rewards."
  steps={[
    'Authenticate with your Pi Network account',
    'Navigate to Watch Ads section',
    'Watch the complete video ad',
    'Earn Drop rewards automatically'
  ]}
  showCopyButton={false}
  securityNote="Your rewards are verified on the blockchain."
/>
```

### Minimal Version
```tsx
<InstructionModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Custom Title"
  showDownloadLink={false}
/>
```

### With Custom Download Link
```tsx
<InstructionModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  downloadLink="https://custom-download-link.com"
  downloadLinkText="Get the App Now"
/>
```

## Features

### 1. Copy Link Functionality
- When `linkUrl` is provided and `showCopyButton={true}`
- Automatically copies URL to clipboard
- Shows success toast notification

### 2. Download Link
- Opens in new tab (`target="_blank"`)
- Styled with orange accent color
- Icon indicates external link

### 3. Security Note
- Optional blue info box
- Positioned below steps
- Uses Shield icon for emphasis

### 4. Responsive Design
- Works on mobile and desktop
- Dialog constrains to `max-w-md`
- Touch-friendly button sizing

### 5. Accessibility
- Built on shadcn/ui Dialog component
- Proper semantic HTML
- Keyboard navigation support
- Focus management

## Current Integration

### In PayPage.tsx
```tsx
import { InstructionModal } from '@/components/InstructionModal';

// Usage in PayPage component
<InstructionModal
  isOpen={showBrowserModal}
  onOpenChange={setShowBrowserModal}
  title="Payment Instructions"
  description="This payment link works best in the Pi Browser."
  steps={[
    'Copy this payment link using the copy button above',
    'Open the Pi Browser app on your device',
    'Paste the link in Pi Browser\'s address bar',
    'Complete your secure Pi payment'
  ]}
  linkUrl={window?.location?.href}
  showCopyButton={true}
  showDownloadLink={true}
  downloadLink="https://minepi.com"
  downloadLinkText="Don't have Pi Browser? Download here"
  securityNote="Pi Browser ensures secure authentication and blockchain-verified transactions."
/>
```

## Styling

### Theme Support
- Dark mode compatible
- Uses tailwindcss utilities
- Respects system theme via dark: prefix

### Color Scheme
- **Primary:** Used for the main button
- **Orange:** Download link and icon accents
- **Blue:** Security note background
- **Background:** Modal content area

## Dependencies

```typescript
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Icons (lucide-react)
import { Shield, ExternalLink, Copy, Info } from 'lucide-react';

// Toast notifications (sonner)
import { toast } from 'sonner';
```

## API Reference

### `copyToClipboard(text: string)`
Internal function that:
- Uses Clipboard API
- Shows success toast
- Message: "Link copied! Open it in Pi Browser"

## Best Practices

1. **Always provide required props:**
   ```tsx
   <InstructionModal
     isOpen={isOpen}           // Required
     onOpenChange={setIsOpen}  // Required
   />
   ```

2. **Use with state management:**
   ```tsx
   const [showModal, setShowModal] = useState(false);
   
   <button onClick={() => setShowModal(true)}>Open Instructions</button>
   <InstructionModal isOpen={showModal} onOpenChange={setShowModal} />
   ```

3. **Customize for context:**
   - Use different titles for different flows
   - Tailor steps to your specific process
   - Provide context-appropriate security notes

4. **Handle copy functionality:**
   - Always provide `linkUrl` when `showCopyButton={true}`
   - Ensure URL is valid and accessible

## Common Patterns

### Modal Triggered by Button
```tsx
<div>
  <Button onClick={() => setShowModal(true)}>
    <HelpCircle className="w-4 h-4 mr-2" />
    Show Instructions
  </Button>

  <InstructionModal
    isOpen={showModal}
    onOpenChange={setShowModal}
    linkUrl={window.location.href}
  />
</div>
```

### Auto-show on Page Load
```tsx
useEffect(() => {
  if (!isPiBrowser) {
    setShowModal(true); // Show if not in Pi Browser
  }
}, [isPiBrowser]);
```

### Conditional Rendering
```tsx
{!hasSeenInstructions && (
  <InstructionModal
    isOpen={true}
    onOpenChange={setHasSeenInstructions}
  />
)}
```

## Troubleshooting

### Copy Button Not Working
- Check `linkUrl` is provided
- Verify Clipboard API is available
- Check browser console for errors

### Modal Not Showing
- Ensure `isOpen={true}`
- Check `onOpenChange` callback is working
- Verify Dialog component is properly rendered

### Styling Issues
- Check tailwindcss is configured
- Verify dark mode CSS is applied
- Clear browser cache if styles don't update

## Migration Guide

### From Inline Dialog to InstructionModal
**Before:**
```tsx
<Dialog open={showBrowserModal} onOpenChange={setShowBrowserModal}>
  <DialogContent className="max-w-md">
    {/* 70+ lines of JSX */}
  </DialogContent>
</Dialog>
```

**After:**
```tsx
<InstructionModal
  isOpen={showBrowserModal}
  onOpenChange={setShowBrowserModal}
  title="Payment Instructions"
  linkUrl={window.location.href}
/>
```

## Version History

- **v1.0** (Jan 9, 2026) - Initial release
  - Basic modal structure
  - Copy link functionality
  - Download link support
  - Security note box
  - Full customization support

## Support

For issues or feature requests, refer to:
- Component location: `src/components/InstructionModal.tsx`
- Usage example: `src/pages/PayPage.tsx`
- Documentation: This file
