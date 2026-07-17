import { checkoutSubscriptionPlan, mockCompleteSubscriptionPlan, verifySubscriptionPaymentPlan } from "./api";

/**
 * Dynamically loads the Razorpay SDK script in the browser.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    
    // If already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PaymentOptions {
  planId: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onFailure?: (error: any) => void;
  onMockSuccess?: () => void;
}

/**
 * Initiates Razorpay checkout flow
 */
export async function payWithRazorpay({
  planId,
  userEmail,
  userPhone,
  userName,
  onSuccess,
  onFailure,
  onMockSuccess,
}: PaymentOptions) {
  try {
    // 1. Create order on the backend
    const checkoutData = await checkoutSubscriptionPlan(planId);
    const { orderId, amount, currency, keyId } = checkoutData;

    // 2. Check if we are using a mock payment (no real Razorpay configuration)
    const isMock = keyId.startsWith("rzp_test_mock") || orderId.startsWith("order_mock_");

    if (isMock) {
      console.log("[Razorpay Helper] Running in Mock Payment Mode");
      
      // Show a simulated payment gateway dialog
      const confirmPayment = typeof window !== "undefined" && window.confirm(
        `[GroupBuying Payment Sandbox]\nSimulating Razorpay payment checkout session.\nPlan ID: ${planId}\nAmount: INR ${(amount / 100).toFixed(2)}\n\nClick OK to simulate successful payment, or Cancel to simulate payment failure.`
      );

      if (!confirmPayment) {
        if (onFailure) {
          onFailure(new Error("Simulated payment cancelled by user."));
        }
        return { mock: true };
      }

      // Upgrade user role on backend manually for mock
      await mockCompleteSubscriptionPlan(planId);
      
      // Simulate API verification call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate success by hitting the mock webhook or calling the callback directly
      if (onMockSuccess) {
        onMockSuccess();
      }
      return { mock: true };
    }

    // 3. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Are you offline?");
    }

    // 4. Configure Razorpay options
    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: "GroupBuying Club",
      description: "Premium Membership Subscription Plan",
      order_id: orderId,
      handler: async function (response: any) {
        console.log("[Razorpay Success]", response);
        try {
          // Verify payment signature on the backend before triggering success callback
          await verifySubscriptionPaymentPlan({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          });
          onSuccess(response);
        } catch (error: any) {
          console.error("Payment verification failed:", error);
          if (onFailure) {
            onFailure(error);
          }
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      notes: {
        planId,
      },
      theme: {
        color: "#e34b32", // GroupBuying primary color
      },
    };

    const rzp = new (window as any).Razorpay(options);
    
    rzp.on("payment.failed", function (response: any) {
      console.error("[Razorpay Failed]", response.error);
      if (onFailure) {
        onFailure(response.error);
      }
    });

    rzp.open();
    return { mock: false };
  } catch (error: any) {
    console.error("Payment initiation failed:", error);
    if (onFailure) {
      onFailure(error);
    } else {
      alert(error.message || "Something went wrong during payment initiation.");
    }
    throw error;
  }
}
