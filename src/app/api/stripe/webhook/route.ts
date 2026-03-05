import { NextResponse } from "next/server";
import Stripe from "stripe";
import { InvoiceStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing");
  }
  return new Stripe(key);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ message: "STRIPE_WEBHOOK_SECRET is missing" }, { status: 500 });
  }

  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
    return NextResponse.json({ message: "Missing stripe-signature header" }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const stripe = stripeClient();
    const event = stripe.webhooks.constructEvent(payload, stripeSignature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const invoiceId = checkout.metadata?.invoiceId;
      const studentId = checkout.metadata?.studentId;

      if (!invoiceId || !studentId) {
        return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
      }

      const existingPayment = await db.payment.findUnique({
        where: { providerRef: checkout.id },
      });

      if (existingPayment) {
        return NextResponse.json({ received: true });
      }

      const paidAmount = checkout.amount_total ? Math.round(checkout.amount_total / 100) : 0;

      await db.$transaction([
        db.invoice.update({
          where: { id: invoiceId },
          data: {
            status: InvoiceStatus.PAID,
          },
        }),
        db.payment.create({
          data: {
            studentId,
            invoiceId,
            amount: paidAmount,
            currency: (checkout.currency ?? "bdt").toUpperCase(),
            method: PaymentMethod.STRIPE,
            status: PaymentStatus.PAID,
            providerRef: checkout.id,
            paidAt: new Date(),
            note: "Paid via Stripe checkout webhook",
          },
        }),
      ]);
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const checkout = event.data.object as Stripe.Checkout.Session;

      if (checkout.metadata?.invoiceId) {
        await db.invoice.update({
          where: { id: checkout.metadata.invoiceId },
          data: {
            status: InvoiceStatus.DUE,
          },
        });
      }

      const existingPayment = await db.payment.findUnique({
        where: { providerRef: checkout.id },
      });

      if (!existingPayment && checkout.metadata?.studentId) {
        await db.payment.create({
          data: {
            studentId: checkout.metadata.studentId,
            invoiceId: checkout.metadata.invoiceId,
            amount: checkout.amount_total ? Math.round(checkout.amount_total / 100) : 0,
            currency: (checkout.currency ?? "bdt").toUpperCase(),
            method: PaymentMethod.STRIPE,
            status: PaymentStatus.FAILED,
            providerRef: checkout.id,
            note: "Stripe async payment failed",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 400 });
  }
}
