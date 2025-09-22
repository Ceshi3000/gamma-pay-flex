import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Real Stripe publishable key
const stripePromise = loadStripe('pk_test_51SA0OoBEQYxxhI47r2uwQ28YDSlxlUXwXvTp2xPlTYvYFKA32KCaakoUzrQwIwKDz8CDbPpXgo1TUJQLFvYhheYH00mZsRggNP');

interface CheckoutFormProps {
  amount: number;
  clientSecret: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Payment Amount</h3>
          <p className="text-3xl font-bold text-primary">${(amount / 100).toFixed(2)} USD</p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Payment Information</Label>
          <div className="p-4 border border-border rounded-lg bg-card">
            <PaymentElement
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'amazon_pay', 'google_pay'],
                fields: {
                  billingDetails: 'auto'
                }
              }}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full h-12 text-lg font-semibold bg-gradient-financial hover:opacity-90 shadow-elegant"
      >
        {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)} USD`}
      </Button>
    </form>
  );
};

export const StripeCheckout: React.FC = () => {
  const [amount, setAmount] = useState<string>('100.00'); // Display amount as string
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Create PaymentIntent using real Stripe API
  const createPaymentIntent = async (amountInCents: number) => {
    setIsCreatingPayment(true);
    
    try {
      // Create PaymentIntent via Stripe API
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk_test_51SA0OoBEQYxxhI47qce3IxcZRvPGUZ7uixPDACZCh6jJbYOzTY7OnSBk5DkFdgESJxMrAKDoBrngehrgPCaEyeBF00sDp0AzTa',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: amountInCents.toString(),
          currency: 'usd',
          automatic_payment_methods: 'true',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const paymentIntent = await response.json();
      setClientSecret(paymentIntent.client_secret);
      
      toast({
        title: "Payment Ready",
        description: "Please complete your payment information below.",
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow valid decimal input
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setClientSecret(''); // Reset client secret when amount changes
    }
  };

  const handleInitializePayment = () => {
    const amountFloat = parseFloat(amount);
    const amountInCents = Math.round(amountFloat * 100);
    
    if (amountInCents < 50) { // Minimum $0.50
      toast({
        title: "Invalid Amount",
        description: "Minimum payment amount is $0.50 USD",
        variant: "destructive",
      });
      return;
    }
    createPaymentIntent(amountInCents);
  };

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: 'hsl(47, 87%, 61%)',
      colorBackground: 'hsl(217, 19%, 12%)',
      colorText: 'hsl(0, 0%, 98%)',
      colorDanger: 'hsl(0, 84.2%, 60.2%)',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Gamma Fund LLC</h1>
          <p className="text-muted-foreground">Secure Payment Portal</p>
        </div>

        <Card className="shadow-elegant border-border/50">
          <CardHeader className="text-center bg-gradient-financial rounded-t-lg">
            <CardTitle className="text-primary-foreground text-xl">Payment Details</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Payment as per our quoted pricing proposal / communication agreement
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Payment Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount (e.g., 20.00)"
                  className="text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum amount: $0.50 USD
                </p>
              </div>

              {!clientSecret && (
                <Button
                  onClick={handleInitializePayment}
                  disabled={isCreatingPayment || (parseFloat(amount) || 0) < 0.5}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreatingPayment ? 'Initializing...' : 'Initialize Payment'}
                </Button>
              )}
            </div>

            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm amount={Math.round((parseFloat(amount) || 0) * 100)} clientSecret={clientSecret} />
              </Elements>
            )}

            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Secure payment powered by Stripe
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports Amazon Pay, Google Pay, and all major credit cards
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Gamma Fund LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};