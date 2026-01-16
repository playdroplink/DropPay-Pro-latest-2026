# ⚡ RESEND ADVANCED FEATURES - QUICK START

**Enhanced**: January 3, 2026

---

## 🎯 NEW CAPABILITIES

Your `send-download-email` function now supports:

✅ **Batch Emails** - Send to multiple recipients  
✅ **Scheduling** - Schedule emails for later  
✅ **Attachments** - Attach files to emails  
✅ **CC/BCC** - Copy team members  
✅ **Personalization** - Recipient names in email  
✅ **Tags** - Track and analyze emails  

---

## 📝 USAGE EXAMPLES

### Send Email (Current - Still Works)
```javascript
const response = await supabase.functions.invoke('send-download-email', {
  body: {
    transactionId: 'txn-123',
    buyerEmail: 'user@example.com',
    paymentLinkId: 'link-456',
    downloadUrl: 'https://...',
    productTitle: 'My Product'
  }
});
```

### NEW: Send Batch Email
```javascript
const response = await supabase.functions.invoke('send-download-email', {
  body: {
    transactionId: 'txn-123',
    buyerEmail: 'organizer@example.com',
    paymentLinkId: 'link-456',
    downloadUrl: 'https://...',
    productTitle: 'Team License',
    batchEmails: [
      { email: 'user1@example.com', recipientName: 'Alice' },
      { email: 'user2@example.com', recipientName: 'Bob' },
      { email: 'user3@example.com', recipientName: 'Charlie' }
    ]
  }
});
```

### NEW: Schedule Email
```javascript
const scheduleTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const response = await supabase.functions.invoke('send-download-email', {
  body: {
    transactionId: 'txn-123',
    buyerEmail: 'user@example.com',
    paymentLinkId: 'link-456',
    downloadUrl: 'https://...',
    productTitle: 'Course Access',
    scheduleTime  // Tomorrow at same time
  }
});
```

### NEW: Email with Attachment
```javascript
const response = await supabase.functions.invoke('send-download-email', {
  body: {
    transactionId: 'txn-123',
    buyerEmail: 'user@example.com',
    paymentLinkId: 'link-456',
    downloadUrl: 'https://...',
    productTitle: 'Invoice + Product',
    attachmentUrl: 'https://storage.../invoice.pdf',
    attachmentFileName: 'invoice.pdf'
  }
});
```

### NEW: Email with CC/BCC + Tags
```javascript
const response = await supabase.functions.invoke('send-download-email', {
  body: {
    transactionId: 'txn-123',
    buyerEmail: 'user@example.com',
    paymentLinkId: 'link-456',
    downloadUrl: 'https://...',
    productTitle: 'Premium Access',
    ccEmails: ['support@droppay.space'],
    bccEmails: ['archive@droppay.space'],
    tags: {
      type: 'premium_purchase',
      plan: 'enterprise',
      amount: 'π500'
    }
  }
});
```

---

## 🔑 ALL PARAMETERS

```typescript
{
  // REQUIRED
  transactionId: string;         // Unique transaction ID
  buyerEmail: string;            // Main recipient
  paymentLinkId: string;         // Payment link identifier
  downloadUrl: string;           // Download link
  productTitle: string;          // Product name

  // OPTIONAL - NEW FEATURES
  batchEmails?: [                // Send to multiple people
    {
      email: string;
      recipientName?: string;    // "Hi Alice," in email
    }
  ];
  
  scheduleTime?: string;         // ISO 8601: "2026-01-27T10:00:00Z"
  
  attachmentUrl?: string;        // File URL to attach
  attachmentFileName?: string;   // Name for attachment
  
  ccEmails?: string[];           // Copy team members
  bccEmails?: string[];          // Hidden copies
  
  tags?: {                        // For analytics
    [key: string]: string;
  }
}
```

---

## 💡 COMMON SCENARIOS

### Scenario 1: Team License
```javascript
// One person buys, sends to whole team
{
  batchEmails: [
    { email: 'team-member-1@company.com', recipientName: 'Alice' },
    { email: 'team-member-2@company.com', recipientName: 'Bob' },
  ],
  ccEmails: ['manager@company.com']
}
```

### Scenario 2: Course Delivery
```javascript
// Schedule delivery for course start date
{
  scheduleTime: '2026-01-27T09:00:00Z',
  batchEmails: [
    { email: 'student1@example.com', recipientName: 'Alice' },
    { email: 'student2@example.com', recipientName: 'Bob' }
  ],
  tags: {
    course: 'python-101',
    cohort: 'jan-2026'
  }
}
```

### Scenario 3: Invoice + Product
```javascript
// Attach invoice PDF + send download link
{
  attachmentUrl: 'https://storage.../invoices/INV-001.pdf',
  attachmentFileName: 'invoice.pdf',
  ccEmails: ['accounting@droppay.space'],
  tags: {
    type: 'purchase_invoice',
    amount: 'π50'
  }
}
```

---

## ✅ BACKWARD COMPATIBLE

✅ All existing code still works  
✅ New parameters are optional  
✅ Single emails work as before  
✅ No migration needed  

---

## 📊 DATABASE UPDATES

New fields tracked automatically:

```sql
email_id              -- Resend email ID
email_batch_count    -- Number of batch recipients
scheduled_at         -- When email was scheduled
```

---

## 🚀 DEPLOYMENT

Already deployed! Function is ready to use with new features.

```bash
# Verify
supabase functions list
# Should show: send-download-email (HTTP, enabled)
```

---

## 📚 FULL DOCUMENTATION

See `RESEND_ADVANCED_FEATURES.md` for:
- Complete implementation details
- Security considerations
- Advanced use cases
- Testing examples
- API reference

---

**Status**: ✅ READY  
**Backward Compatible**: YES  
**Production Ready**: YES

