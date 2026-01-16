import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, Clock, MapPin, Star, Users, ChefHat, QrCode, Smartphone } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';

const restaurantItems = [
  {
    id: 'signature-burger',
    name: 'Signature Beef Burger',
    description: 'Juicy beef patty with fresh lettuce, tomato, cheese, and our special sauce',
    price: 18.99,
    category: 'Main Course',
    prepTime: '15-20 min',
    popular: true,
    dietary: ['Gluten-Free Option']
  },
  {
    id: 'margherita-pizza',
    name: 'Classic Margherita Pizza',
    description: 'Traditional Italian pizza with fresh basil, mozzarella, and tomato sauce',
    price: 22.50,
    category: 'Pizza',
    prepTime: '12-18 min',
    popular: false,
    dietary: ['Vegetarian']
  },
  {
    id: 'seafood-pasta',
    name: 'Seafood Linguine',
    description: 'Fresh linguine with prawns, mussels, and calamari in white wine sauce',
    price: 28.00,
    category: 'Pasta',
    prepTime: '20-25 min',
    popular: true,
    dietary: []
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing',
    price: 14.50,
    category: 'Salad',
    prepTime: '5-8 min',
    popular: false,
    dietary: ['Vegetarian', 'Gluten-Free Option']
  }
];

export function RestaurantDemo() {
  const [selectedItem, setSelectedItem] = useState(restaurantItems[0]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [diningOption, setDiningOption] = useState('dine-in');


  const platformFeeRate = 0.02; // 2%
  const subtotal = selectedItem.price * quantity;
  const platformFee = subtotal * platformFeeRate;
  const total = subtotal + platformFee;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Restaurant Checkout Demo</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience how DropPay transforms restaurant ordering with QR codes, table-side payments, and seamless kitchen integration
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Menu Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Bella Vista Restaurant Menu
                </CardTitle>
                <CardDescription>Select your dish to create a checkout link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurantItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedItem.id === item.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                      </div>
                      <span className="font-bold text-lg">π {item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.prepTime}
                        </span>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      {item.dietary.length > 0 && (
                        <div className="flex gap-1">
                          {item.dietary.map((diet) => (
                            <Badge key={diet} variant="secondary" className="text-xs">{diet}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div>
                    <Label>Dining Option</Label>
                    <Select value={diningOption} onValueChange={setDiningOption}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dine-in">Dine In</SelectItem>
                        <SelectItem value="takeout">Takeout</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Any dietary restrictions or special requests..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Checkout Link Preview</CardTitle>
                <CardDescription>This is how your customers will see the payment page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Restaurant Header */}
                <div className="text-center space-y-2 p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-lg">
                  <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedItem.prepTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Table 12
                    </span>
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

                {/* Order Details */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Order Details:</p>
                  <p className="text-sm text-muted-foreground">Dining: {diningOption.charAt(0).toUpperCase() + diningOption.slice(1)}</p>
                  {specialInstructions && (
                    <p className="text-sm text-muted-foreground">Instructions: {specialInstructions}</p>
                  )}
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span>QR Code Menu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Contactless Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-primary" />
                    <span>Kitchen Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span>Loyalty Points</span>
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
                <CardTitle className="text-lg">Restaurant Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">QR Code Ordering</p>
                      <p className="text-sm text-muted-foreground">Customers scan table QR codes to view menu and order</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChefHat className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Kitchen Integration</p>
                      <p className="text-sm text-muted-foreground">Orders automatically sent to kitchen display system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Table Management</p>
                      <p className="text-sm text-muted-foreground">Track orders by table number and manage capacity</p>
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