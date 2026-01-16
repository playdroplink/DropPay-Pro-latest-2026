import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, User, Star, Calendar, Wrench, Home, Car } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';

const services = [
  {
    id: 'home-cleaning',
    name: 'Deep House Cleaning',
    description: 'Professional deep cleaning service for your entire home',
    price: 149.99,
    category: 'Home Services',
    duration: '3-4 hours',
    provider: 'CleanPro Services',
    rating: 4.9,
    popular: true,
    includes: ['All rooms', 'Kitchen appliances', 'Bathroom deep clean', 'Vacuum & mop']
  },
  {
    id: 'plumbing-repair',
    name: 'Emergency Plumbing Repair',
    description: 'Quick response plumbing repair and maintenance service',
    price: 89.99,
    category: 'Home Repair',
    duration: '1-2 hours',
    provider: 'FixIt Fast Plumbing',
    rating: 4.7,
    popular: false,
    includes: ['Diagnostic', 'Basic repair', 'Parts (up to π 50)', '30-day warranty']
  },
  {
    id: 'car-detailing',
    name: 'Premium Car Detailing',
    description: 'Complete exterior and interior car cleaning and protection',
    price: 199.99,
    category: 'Automotive',
    duration: '2-3 hours',
    provider: 'Auto Shine Pro',
    rating: 4.8,
    popular: true,
    includes: ['Exterior wash & wax', 'Interior vacuum', 'Dashboard cleaning', 'Tire shine']
  },
  {
    id: 'lawn-care',
    name: 'Lawn Care Package',
    description: 'Complete lawn maintenance including mowing, trimming, and cleanup',
    price: 79.99,
    category: 'Landscaping',
    duration: '1-2 hours',
    provider: 'Green Thumb Landscaping',
    rating: 4.6,
    popular: false,
    includes: ['Mowing', 'Edge trimming', 'Leaf blowdown', 'Cleanup']
  }
];

export function ServicesDemo() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const platformFeeRate = 0.02; // 2%
  const subtotal = selectedService.price;
  const platformFee = subtotal * platformFeeRate;
  const total = subtotal + platformFee;

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Home Services': return Home;
      case 'Home Repair': return Wrench;
      case 'Automotive': return Car;
      case 'Landscaping': return MapPin;
      default: return MapPin;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Local Services Checkout Demo</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how DropPay streamlines service businesses with appointment booking, customer management, and seamless payments
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Local Service Providers
                </CardTitle>
                <CardDescription>Select a service to create a checkout link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => {
                  const IconComponent = getServiceIcon(service.category);
                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedService.id === service.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">{service.name}</h3>
                          {service.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                        </div>
                        <span className="font-bold text-lg">π {service.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.duration}
                          </span>
                          <Badge variant="outline" className="text-xs">{service.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{service.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{service.provider}</p>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.includes.slice(0, 2).map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{item}</Badge>
                          ))}
                          {service.includes.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{service.includes.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Appointment Booking */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred Date</Label>
                    <Input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label>Preferred Time</Label>
                    <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="1:00">1:00 PM</SelectItem>
                        <SelectItem value="2:00">2:00 PM</SelectItem>
                        <SelectItem value="3:00">3:00 PM</SelectItem>
                        <SelectItem value="4:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Service Address</Label>
                  <Input
                    placeholder="Enter your address..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Special Requests</Label>
                  <Textarea
                    placeholder="Any special requirements or instructions..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
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
                <CardTitle>Service Checkout Link Preview</CardTitle>
                <CardDescription>This is how your customers will see the payment page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Header */}
                <div className="text-center space-y-3 p-4 bg-gradient-to-r from-teal-500/10 to-teal-600/10 rounded-lg">
                  <h2 className="text-xl font-bold">{selectedService.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedService.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedService.rating} rating</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{selectedService.provider}</p>
                </div>

                {/* Appointment Summary */}
                {(appointmentDate || appointmentTime || customerAddress) && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Appointment Details:</p>
                    {appointmentDate && (
                      <p className="text-sm text-muted-foreground">Date: {new Date(appointmentDate).toLocaleDateString()}</p>
                    )}
                    {appointmentTime && (
                      <p className="text-sm text-muted-foreground">Time: {appointmentTime}</p>
                    )}
                    {customerAddress && (
                      <p className="text-sm text-muted-foreground">Address: {customerAddress}</p>
                    )}
                    {specialRequests && (
                      <p className="text-sm text-muted-foreground">Notes: {specialRequests}</p>
                    )}
                  </div>
                )}

                {/* Service Includes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Service Includes:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedService.includes.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Service Price</span>
                    <span className="font-medium">π {selectedService.price.toFixed(2)}</span>
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

                <Button className="w-full" size="lg">
                  Book & Pay with Pi π
                </Button>
              </CardContent>
            </Card>

            {/* Demo Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Business Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Appointment Booking</p>
                      <p className="text-sm text-muted-foreground">Customers book and pay for services in advance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Customer Management</p>
                      <p className="text-sm text-muted-foreground">Track customer history and preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Service Packages</p>
                      <p className="text-sm text-muted-foreground">Bundle services and offer package deals</p>
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