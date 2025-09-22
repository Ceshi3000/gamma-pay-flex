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

// 你提供的测试公钥
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
  const [amount, setAmount] = useState<number>(10000); // $100.00 in cents
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // 模拟创建PaymentIntent - 在实际应用中这应该通过后端API完成
  const createPaymentIntent = async (amountInCents: number) => {
    setIsCreatingPayment(true);
    
    try {
      // 这里是模拟的clientSecret - 在实际应用中需要调用后端API
      // 使用你提供的测试密钥模拟创建PaymentIntent
      const mockClientSecret = `pi_test_${Date.now()}_secret_test`;
      
      // 实际实现中应该是：
      // const response = await fetch('/api/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: amountInCents, currency: 'usd' })
      // });
      // const { client_secret } = await response.json();
      
      setClientSecret(mockClientSecret);
      toast({
        title: "Payment Ready",
        description: "Please complete your payment information below.",
      });
    } catch (error) {
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
    const value = parseFloat(e.target.value) || 0;
    setAmount(Math.round(value * 100)); // Convert to cents
    setClientSecret(''); // Reset client secret when amount changes
  };

  const handleInitializePayment = () => {
    if (amount < 50) { // Minimum $0.50
      toast({
        title: "Invalid Amount",
        description: "Minimum payment amount is $0.50 USD",
        variant: "destructive",
      });
      return;
    }
    createPaymentIntent(amount);
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
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={(amount / 100).toFixed(2)}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className="text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum amount: $0.50 USD
                </p>
              </div>

              {!clientSecret && (
                <Button
                  onClick={handleInitializePayment}
                  disabled={isCreatingPayment || amount < 50}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreatingPayment ? 'Initializing...' : 'Initialize Payment'}
                </Button>
              )}
            </div>

            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm amount={amount} clientSecret={clientSecret} />
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