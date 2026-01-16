import React, { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { buildCheckoutQr } from '@/lib/qr';

// Step components (to be implemented in detail later)
function ProductStep({ data, onChange, onNext }: any) {
  const [images, setImages] = useState<File[]>([]);
  const [variantList, setVariantList] = useState([
    { name: '', options: '' },
  ]);
  const [errors, setErrors] = useState<any>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setErrors((prev: any) => ({ ...prev, images: 'Max 5 images allowed.' }));
      return;
    }
    setImages((prev) => [...prev, ...files].slice(0, 5));
    setErrors((prev: any) => ({ ...prev, images: undefined }));
    onChange({ images: [...images, ...files].slice(0, 5) });
  };

  const handleRemoveImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    onChange({ images: newImages });
  };

  const handleVariantChange = (idx: number, field: string, value: string) => {
    const newVariants = variantList.map((v, i) =>
      i === idx ? { ...v, [field]: value } : v
    );
    setVariantList(newVariants);
    onChange({ variants: newVariants });
  };

  const addVariant = () => {
    if (variantList.length < 3) {
      setVariantList([...variantList, { name: '', options: '' }]);
    }
  };

  const removeVariant = (idx: number) => {
    setVariantList(variantList.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs: any = {};
    if (!data.name) errs.name = 'Item name is required.';
    if (!data.price) errs.price = 'Price is required.';
    if (images.length > 5) errs.images = 'Max 5 images allowed.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Product Details</h2>
      <div className="mb-4">
        <label className="block font-medium">Item name *</label>
        <input
          className="input input-bordered w-full"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          maxLength={128}
        />
        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Description</label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={data.description || ''}
          onChange={e => onChange({ description: e.target.value })}
          maxLength={2048}
        />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Price *</label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={data.price || ''}
            onChange={e => onChange({ price: e.target.value })}
            min={0}
            step={0.01}
          />
          {errors.price && <div className="text-red-500 text-sm">{errors.price}</div>}
        </div>
        <div className="flex-1">
          <label className="block font-medium">Currency</label>
          <select
            className="select select-bordered w-full"
            value={data.currency || 'USD'}
            onChange={e => onChange({ currency: e.target.value })}
          >
            <option value="USD">$ USD - US Dollar</option>
            <option value="PHP">₱ PHP - Philippine Peso</option>
            <option value="EUR">€ EUR - Euro</option>
            <option value="GBP">£ GBP - British Pound</option>
            <option value="JPY">¥ JPY - Japanese Yen</option>
            <option value="CNY">¥ CNY - Chinese Yuan</option>
            <option value="KRW">₩ KRW - South Korean Won</option>
            <option value="INR">₹ INR - Indian Rupee</option>
            <option value="AUD">A$ AUD - Australian Dollar</option>
            <option value="CAD">C$ CAD - Canadian Dollar</option>
            <option value="SGD">S$ SGD - Singapore Dollar</option>
            <option value="HKD">HK$ HKD - Hong Kong Dollar</option>
            <option value="THB">฿ THB - Thai Baht</option>
            <option value="MYR">RM MYR - Malaysian Ringgit</option>
            <option value="IDR">Rp IDR - Indonesian Rupiah</option>
            <option value="VND">₫ VND - Vietnamese Dong</option>
            <option value="NZD">NZ$ NZD - New Zealand Dollar</option>
            <option value="CHF">CHF - Swiss Franc</option>
            <option value="SEK">kr SEK - Swedish Krona</option>
            <option value="NOK">kr NOK - Norwegian Krone</option>
            <option value="DKK">kr DKK - Danish Krone</option>
            <option value="RUB">₽ RUB - Russian Ruble</option>
            <option value="BRL">R$ BRL - Brazilian Real</option>
            <option value="ZAR">R ZAR - South African Rand</option>
            <option value="SAR">﷼ SAR - Saudi Riyal</option>
            <option value="AED">د.إ AED - UAE Dirham</option>
            <option value="TRY">₺ TRY - Turkish Lira</option>
            <option value="MXN">$ MXN - Mexican Peso</option>
            <option value="PLN">zł PLN - Polish Zloty</option>
            <option value="EGP">£ EGP - Egyptian Pound</option>
            <option value="PKR">₨ PKR - Pakistani Rupee</option>
            <option value="BDT">৳ BDT - Bangladeshi Taka</option>
            <option value="ILS">₪ ILS - Israeli Shekel</option>
            <option value="ARS">$ ARS - Argentine Peso</option>
            <option value="CLP">$ CLP - Chilean Peso</option>
            <option value="COP">$ COP - Colombian Peso</option>
            <option value="CZK">Kč CZK - Czech Koruna</option>
            <option value="HUF">Ft HUF - Hungarian Forint</option>
            <option value="RON">lei RON - Romanian Leu</option>
            <option value="UAH">₴ UAH - Ukrainian Hryvnia</option>
            <option value="NGN">₦ NGN - Nigerian Naira</option>
            <option value="KES">KSh KES - Kenyan Shilling</option>
            <option value="GHS">₵ GHS - Ghanaian Cedi</option>
            <option value="TZS">TSh TZS - Tanzanian Shilling</option>
            <option value="UGX">USh UGX - Ugandan Shilling</option>
            <option value="MAD">د.م. MAD - Moroccan Dirham</option>
            <option value="QAR">﷼ QAR - Qatari Riyal</option>
            <option value="OMR">﷼ OMR - Omani Rial</option>
            <option value="KWD">د.ك KWD - Kuwaiti Dinar</option>
            <option value="BHD">.د.ب BHD - Bahraini Dinar</option>
            <option value="JOD">د.ا JOD - Jordanian Dinar</option>
            <option value="LBP">ل.ل LBP - Lebanese Pound</option>
            <option value="SDG">ج.س SDG - Sudanese Pound</option>
            <option value="DZD">دج DZD - Algerian Dinar</option>
            <option value="TND">د.ت TND - Tunisian Dinar</option>
            <option value="ETB">Br ETB - Ethiopian Birr</option>
            <option value="XOF">CFA XOF - West African CFA franc</option>
            <option value="XAF">CFA XAF - Central African CFA franc</option>
            <option value="MZN">MT MZN - Mozambican Metical</option>
            <option value="ZMW">ZK ZMW - Zambian Kwacha</option>
            <option value="BWP">P BWP - Botswana Pula</option>
            <option value="MUR">₨ MUR - Mauritian Rupee</option>
            <option value="SCR">₨ SCR - Seychellois Rupee</option>
            <option value="LKR">₨ LKR - Sri Lankan Rupee</option>
            <option value="MMK">K MMK - Myanmar Kyat</option>
            <option value="KHR">៛ KHR - Cambodian Riel</option>
            <option value="LAK">₭ LAK - Lao Kip</option>
            <option value="BND">B$ BND - Brunei Dollar</option>
            <option value="PGK">K PGK - Papua New Guinean Kina</option>
            <option value="FJD">$ FJD - Fijian Dollar</option>
            <option value="WST">WS$ WST - Samoan Tala</option>
            <option value="TOP">T$ TOP - Tongan Paʻanga</option>
            <option value="VUV">Vt VUV - Vanuatu Vatu</option>
            <option value="SBD">$ SBD - Solomon Islands Dollar</option>
            <option value="KZT">₸ KZT - Kazakhstani Tenge</option>
            <option value="UZS">soʻm UZS - Uzbekistani Soʻm</option>
            <option value="AZN">₼ AZN - Azerbaijani Manat</option>
            <option value="GEL">₾ GEL - Georgian Lari</option>
            <option value="AMD">֏ AMD - Armenian Dram</option>
            <option value="IRR">﷼ IRR - Iranian Rial</option>
            <option value="IQD">ع.د IQD - Iraqi Dinar</option>
            <option value="AFN">؋ AFN - Afghan Afghani</option>
            <option value="MNT">₮ MNT - Mongolian Tögrög</option>
            <option value="KGS">с KGS - Kyrgyzstani Som</option>
            <option value="TJS">ЅМ TJS - Tajikistani Somoni</option>
            <option value="MDL">L MDL - Moldovan Leu</option>
            <option value="ALL">L ALL - Albanian Lek</option>
            <option value="MKD">ден MKD - Macedonian Denar</option>
            <option value="HRK">kn HRK - Croatian Kuna</option>
            <option value="BAM">KM BAM - Bosnia-Herzegovina Convertible Mark</option>
            <option value="RSD">дин. RSD - Serbian Dinar</option>
            <option value="BGN">лв BGN - Bulgarian Lev</option>
            <option value="ISK">kr ISK - Icelandic Krona</option>
            <option value="DOP">RD$ DOP - Dominican Peso</option>
            <option value="JMD">J$ JMD - Jamaican Dollar</option>
            <option value="TTD">TT$ TTD - Trinidad and Tobago Dollar</option>
            <option value="BSD">B$ BSD - Bahamian Dollar</option>
            <option value="BBD">Bds$ BBD - Barbadian Dollar</option>
            <option value="KYD">CI$ KYD - Cayman Islands Dollar</option>
            <option value="XCD">EC$ XCD - East Caribbean Dollar</option>
            <option value="HTG">G HTG - Haitian Gourde</option>
            <option value="SRD">$ SRD - Surinamese Dollar</option>
            <option value="ANG">ƒ ANG - Netherlands Antillean Guilder</option>
            <option value="AWG">ƒ AWG - Aruban Florin</option>
            <option value="BZD">BZ$ BZD - Belize Dollar</option>
            <option value="GYD">G$ GYD - Guyanese Dollar</option>
            <option value="PEN">S/ PEN - Peruvian Sol</option>
            <option value="BOB">Bs. BOB - Bolivian Boliviano</option>
            <option value="PYG">₲ PYG - Paraguayan Guarani</option>
            <option value="UYU">$ UYU - Uruguayan Peso</option>
            <option value="VEF">Bs. VEF - Venezuelan Bolívar</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Quantity</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.quantity || 1}
          min={1}
          onChange={e => onChange({ quantity: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Images (max 5)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        {errors.images && <div className="text-red-500 text-sm">{errors.images}</div>}
        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => handleRemoveImage(idx)}
              >×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium">Product ID / SKU</label>
        <input
          className="input input-bordered w-full"
          value={data.productId || ''}
          onChange={e => onChange({ productId: e.target.value })}
          maxLength={64}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Variants (up to 3)</label>
        {variantList.map((variant, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              className="input input-bordered flex-1"
              placeholder="Variant name (e.g. Color)"
              value={variant.name}
              onChange={e => handleVariantChange(idx, 'name', e.target.value)}
              maxLength={32}
            />
            <input
              className="input input-bordered flex-1"
              placeholder="Options (comma separated)"
              value={variant.options}
              onChange={e => handleVariantChange(idx, 'options', e.target.value)}
              maxLength={128}
            />
            {variantList.length > 1 && (
              <button type="button" className="btn btn-xs btn-error" onClick={() => removeVariant(idx)}>Remove</button>
            )}
          </div>
        ))}
        {variantList.length < 3 && (
          <button type="button" className="btn btn-xs btn-outline" onClick={addVariant}>Add Variant</button>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Inventory (track stock)</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.inventory || ''}
          min={0}
          onChange={e => onChange({ inventory: e.target.value })}
        />
      </div>
      <button className="btn btn-primary mt-4" onClick={handleNext}>Next: Checkout</button>
    </div>
  );
}

function CheckoutStep({ data, onChange, onNext, onBack }: any) {
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const errs: any = {};
    if (data.shippingFee && isNaN(Number(data.shippingFee))) errs.shippingFee = 'Invalid shipping fee.';
    if (data.taxRate && (isNaN(Number(data.taxRate)) || Number(data.taxRate) < 0)) errs.taxRate = 'Invalid tax rate.';
    if (data.discount && isNaN(Number(data.discount))) errs.discount = 'Invalid discount.';
    if (data.handlingFee && isNaN(Number(data.handlingFee))) errs.handlingFee = 'Invalid handling fee.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Checkout Options</h2>
      <div className="mb-4">
        <label className="block font-medium">Collect shipping address?</label>
        <input
          type="checkbox"
          checked={!!data.collectShipping}
          onChange={e => onChange({ collectShipping: e.target.checked })}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Shipping fee</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.shippingFee || ''}
          min={0}
          onChange={e => onChange({ shippingFee: e.target.value })}
        />
        {errors.shippingFee && <div className="text-red-500 text-sm">{errors.shippingFee}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Tax rate (%)</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.taxRate || ''}
          min={0}
          max={100}
          onChange={e => onChange({ taxRate: e.target.value })}
        />
        {errors.taxRate && <div className="text-red-500 text-sm">{errors.taxRate}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Discount (%)</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.discount || ''}
          min={0}
          max={100}
          onChange={e => onChange({ discount: e.target.value })}
        />
        {errors.discount && <div className="text-red-500 text-sm">{errors.discount}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Handling fee</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={data.handlingFee || ''}
          min={0}
          onChange={e => onChange({ handlingFee: e.target.value })}
        />
        {errors.handlingFee && <div className="text-red-500 text-sm">{errors.handlingFee}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium">Auto-return URL</label>
        <input
          type="url"
          className="input input-bordered w-full"
          value={data.autoReturnUrl || ''}
          onChange={e => onChange({ autoReturnUrl: e.target.value })}
          placeholder="https://yourwebsite.com/thank-you"
        />
      </div>
      <button className="btn btn-secondary mr-2" onClick={onBack}>Back</button>
      <button className="btn btn-primary" onClick={handleNext}>Next: Confirmation</button>
    </div>
  );
}

import { useRef, useState as useState2, useEffect as useEffect2 } from "react";
function ConfirmationStep({ data, onBack, onSubmit, createdLink, loading }: any) {
  const [copied, setCopied] = useState2(false);
  const [qrUrl, setQrUrl] = useState2<string | null>(null);
  const [generatingQr, setGeneratingQr] = useState2(false);

  // Generate QR code with logo when link is created
  useEffect2(() => {
    if (createdLink && !qrUrl) {
      setGeneratingQr(true);
      buildCheckoutQr(createdLink)
        .then((qr) => setQrUrl(qr))
        .catch((error) => {
          console.error("Failed to generate QR code:", error);
          // Fallback to Google Charts API
          setQrUrl(`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(createdLink)}`);
        })
        .finally(() => setGeneratingQr(false));
    }
  }, [createdLink, qrUrl]);

  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Confirmation</h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Summary</h3>
        <ul className="list-disc ml-6 text-sm">
          <li><b>Name:</b> {data.name}</li>
          {data.description && <li><b>Description:</b> {data.description}</li>}
          <li><b>Price:</b> {data.price} {data.currency || "PHP"}</li>
          {data.quantity && <li><b>Quantity:</b> {data.quantity}</li>}
          {data.productId && <li><b>Product ID:</b> {data.productId}</li>}
          {data.variants && data.variants.length > 0 && (
            <li><b>Variants:</b> {data.variants.map((v: any) => `${v.name}: ${v.options}`).join(", ")}</li>
          )}
          {data.inventory && <li><b>Inventory:</b> {data.inventory}</li>}
          {data.collectShipping && <li><b>Collect shipping address</b></li>}
          {data.shippingFee && <li><b>Shipping fee:</b> {data.shippingFee}</li>}
          {data.taxRate && <li><b>Tax rate:</b> {data.taxRate}%</li>}
          {data.discount && <li><b>Discount:</b> {data.discount}%</li>}
          {data.handlingFee && <li><b>Handling fee:</b> {data.handlingFee}</li>}
          {data.autoReturnUrl && <li><b>Auto-return URL:</b> {data.autoReturnUrl}</li>}
        </ul>
      </div>
      <div className="mb-4">
        <button className="btn btn-success mr-2" onClick={onSubmit} disabled={!!createdLink || loading}>{loading ? 'Building...' : 'Build It'}</button>
        <button className="btn btn-secondary mr-2" onClick={onBack} disabled={loading}>Back</button>
      </div>
      {createdLink && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="mb-2 font-semibold">Your Payment Link:</div>
          <div className="flex items-center gap-2">
            <input className="input input-bordered flex-1" value={createdLink} readOnly />
            <button className="btn btn-outline btn-xs" onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
          </div>
          <div className="mt-4">
            <div className="mb-2 font-semibold">QR Code:</div>
            {generatingQr && <div className="text-sm text-gray-500">Generating QR code with logo...</div>}
            {qrUrl && <img src={qrUrl} alt="QR Code" className="w-32 h-32" />}
          </div>
        </div>
      )}
    </div>
  );
}

const steps = ["Product", "Checkout", "Confirmation"];

export default function PaymentLinkBuilder() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (changes: any) => {
    setFormData((prev: any) => ({ ...prev, ...changes }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  // Helper: upload images to Supabase Storage
  const uploadImages = async (images: File[], slug: string) => {
    const urls: string[] = [];
    const storageUrl = 'https://xoofailhzhfyebzpzrfs.storage.supabase.co/storage/v1/s3';
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${slug}/${Date.now()}-${i}-${file.name}`;
      
      try {
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('payment-link-images')
          .upload(fileName, file, { 
            cacheControl: '3600',
            upsert: true 
          });

        if (error) {
          console.error('❌ Image upload error:', error);
          continue;
        }

        // Get public URL and validate it
        const { data: publicUrl } = supabase.storage
          .from('payment-link-images')
          .getPublicUrl(fileName);
          
        if (publicUrl?.publicUrl) {
          // Ensure URL uses the correct S3 storage endpoint
          const finalUrl = publicUrl.publicUrl.includes(storageUrl) 
            ? publicUrl.publicUrl 
            : `${storageUrl}/payment-link-images/${fileName}`;
            
          console.log('✅ Image uploaded and accessible:', finalUrl);
          urls.push(finalUrl);
        }
      } catch (uploadError) {
        console.error('❌ Upload exception for file', file.name, ':', uploadError);
      }
    }
    return urls;
  };

  // Helper: generate a unique slug
  const generateSlug = (name: string) => {
    return (
      name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')?.replace(/(^-|-$)/g, '') +
      '-' + uuidv4().slice(0, 8)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Generate slug
      const slug = generateSlug(formData.name);
      // 2. Upload images if any
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images, slug);
      }
      // 3. Save to DB
      const { error, data } = await supabase.from('payment_links').insert([
        {
          title: formData.name,
          description: formData.description,
          amount: Number(formData.price),
          currency: formData.currency || 'PHP',
          product_id: formData.productId,
          variants: formData.variants,
          inventory: formData.inventory ? Number(formData.inventory) : null,
          shipping_fee: formData.shippingFee ? Number(formData.shippingFee) : null,
          tax_rate: formData.taxRate ? Number(formData.taxRate) : null,
          discount: formData.discount ? Number(formData.discount) : null,
          handling_fee: formData.handlingFee ? Number(formData.handlingFee) : null,
          auto_return_url: formData.autoReturnUrl,
          collect_shipping: !!formData.collectShipping,
          images: imageUrls,
          slug,
          is_active: true,
          merchant_id: null, // Set to null or fetch from context if available
        },
      ]).select('slug').single();
      if (error) throw error;
      // 4. Show the real payment link
      setCreatedLink(`${window.location.origin}/pay/${data.slug}`);
    } catch (e: any) {
      alert('Error creating payment link: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Build Your Payment Links and Buttons</h1>
      <div className="mb-6 flex space-x-4">
        {steps.map((label, idx) => (
          <div key={label} className={`step ${step === idx ? "font-bold" : "text-gray-400"}`}>{label}</div>
        ))}
      </div>
      {step === 0 && (
        <ProductStep data={formData} onChange={handleChange} onNext={handleNext} />
      )}
      {step === 1 && (
        <CheckoutStep data={formData} onChange={handleChange} onNext={handleNext} onBack={handleBack} />
      )}
      {step === 2 && (
        <ConfirmationStep data={formData} onBack={handleBack} onSubmit={handleSubmit} createdLink={createdLink} loading={loading} />
      )}
    </div>
  );
}
