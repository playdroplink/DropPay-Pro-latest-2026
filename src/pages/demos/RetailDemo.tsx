import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shirt, Package, MapPin, Star, Users, Sparkles, ShoppingBag, Camera } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';

const clothingItems = [
  {
    id: 'summer-dress',
    name: 'Summer Floral Dress',
    description: 'Beautiful flowing dress perfect for warm weather and special occasions',
    price: 89.99,
    category: 'Dresses',
    colors: ['Blue', 'Pink', 'Yellow', 'White'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    popular: true,
    material: 'Cotton Blend'
  },
  {
    id: 'classic-jeans',
    name: 'Classic Slim Jeans',
    description: 'Comfortable and stylish jeans that pair with everything',
    price: 79.99,
    category: 'Bottoms',
    colors: ['Dark Blue', 'Light Blue', 'Black'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    popular: false,
    material: 'Denim'
  },
  {
    id: 'designer-top',
    name: 'Designer Silk Blouse',
    description: 'Elegant silk blouse for professional and formal occasions',
    price: 129.99,
    category: 'Tops',
    colors: ['Ivory', 'Navy', 'Burgundy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    popular: true,
    material: 'Pure Silk'
  },
  {
    id: 'casual-sneakers',
    name: 'Casual Sneakers',
    description: 'Comfortable everyday sneakers with premium cushioning',
    price: 119.99,
    category: 'Shoes',
    colors: ['White', 'Black', 'Gray', 'Navy'],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    popular: false,
    material: 'Synthetic Leather'
  }
];

export function RetailDemo() {
  const [selectedItem, setSelectedItem] = useState(clothingItems[0]);
  const [selectedColor, setSelectedColor] = useState(clothingItems[0].colors[0]);
  const [selectedSize, setSelectedSize] = useState(clothingItems[0].sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');


  const platformFeeRate = 0.02; // 2%
  const subtotal = selectedItem.price * quantity;
  const platformFee = subtotal * platformFeeRate;
  const total = subtotal + platformFee;

  const handleItemChange = (item: typeof clothingItems[0]) => {
    setSelectedItem(item);
    setSelectedColor(item.colors[0]);
    setSelectedSize(item.sizes[0]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Retail Store Checkout Demo</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how DropPay enhances retail stores with digital checkout links, size selection, and in-store pickup options
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Boutique Fashion Store
                </CardTitle>
                <CardDescription>Select an item to create a checkout link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clothingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedItem.id === item.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleItemChange(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.popular && <Badge variant="secondary" className="text-xs">Trending</Badge>}
                      </div>
                      <span className="font-bold text-lg">π {item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <span>{item.material}</span>
                      </div>
                      <span>{item.colors.length} colors, {item.sizes.length} sizes</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Product Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Product Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedItem.colors.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedItem.sizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Retail Checkout Link Preview</CardTitle>
                <CardDescription>This is how your customers will see the payment page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Header */}
                <div className="text-center space-y-3 p-4 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-lg">
                  <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <Badge variant="secondary">{selectedColor}</Badge>
                    <Badge variant="secondary">Size {selectedSize}</Badge>
                    <Badge variant="secondary">{selectedItem.material}</Badge>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Item Price (x{quantity})</span>
                    <span className="font-medium">π {(selectedItem.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Platform Fee (for maintenance & features)</span>
                      <PlatformFeeModal>
                        <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">2%</Badge>
                      </PlatformFeeModal>
                    </div>
                    <span className="font-medium">π {platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>π {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Store Options */}
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Store Options:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="pickup" defaultChecked className="text-primary" />
                      <span>In-store Pickup</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="pickup" className="text-primary" />
                      <span>Home Delivery</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>123 Fashion Street, Downtown</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Free Alterations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>Style Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span>Loyalty Rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Style Consultation</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Pay with Pi π
                </Button>
              </CardContent>
            </Card>

            {/* Demo Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retail Store Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shirt className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Size & Color Selection</p>
                      <p className="text-sm text-muted-foreground">Customers choose exact specifications before purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">In-store Pickup</p>
                      <p className="text-sm text-muted-foreground">Customers can reserve items and pay before arriving</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Style Services</p>
                      <p className="text-sm text-muted-foreground">Add consultation, alterations, and styling packages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}