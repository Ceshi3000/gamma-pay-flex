import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-elegant border-border/50 text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-foreground">
                Thank you for your payment to <strong>Gamma Fund LLC</strong>.
              </p>
              <p className="text-muted-foreground text-sm">
                Your transaction has been completed successfully. You will receive a confirmation email shortly.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Back to Payment Portal
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © 2024 Gamma Fund LLC. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;