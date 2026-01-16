# Verify Ad Reward Edge Function

This function verifies Pi Ad Network rewards and credits users accordingly.

## Environment Variables

Add to your Supabase project secrets:

```bash
PI_API_KEY=your_pi_api_key_here
```

## Deployment

```bash
supabase functions deploy verify-ad-reward
```

## Usage

The function is called automatically by the WatchAds component after a user watches an ad.

### Request

```json
{
  "adId": "ad_123456",
  "merchantId": "merchant-uuid",
  "piUsername": "username"
}
```

### Response

```json
{
  "verified": true,
  "reward_amount": 0.005,
  "status": "granted",
  "message": "Reward granted successfully!"
}
```

## Pi Platform API Integration

The function verifies ads using:
- Endpoint: `https://api.minepi.com/v2/ads_network/status/{adId}`
- Auth: `Authorization: Key {PI_API_KEY}`
- Status codes: `granted`, `revoked`, `pending`
