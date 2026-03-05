import { NextResponse } from "next/server";
import Stripe from "stripe";
import { InvoiceStatus } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canInvoiceBeMarkedPaid } from "@/lib/invoice-lifecycle";

const checkoutSchema = z.object({
  invoiceId: z.string().min(1),
});

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing");
  }
  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid checkout request" }, { status: 400 });
    }

    const invoice = await db.invoice.findFirst({
      where: {
        id: parsed.data.invoiceId,
        studentId: session.sub,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (!canInvoiceBeMarkedPaid(invoice.status)) {
      return NextResponse.json({ message: "Invoice already closed" }, { status: 400 });
    }

    const stripe = stripeClient();
    const origin = new URL(request.url).origin;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/portal?payment=success`,
      cancel_url: `${origin}/portal?payment=cancelled`,
      customer_email: session.email,
      metadata: {
        invoiceId: invoice.id,
        studentId: session.sub,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "bdt",
            unit_amount: invoice.amount * 100,
            product_data: {
              name: `NextGenICT Monthly Fee - ${invoice.monthLabel}`,
              description: `Invoice ${invoice.id}`,
            },
          },
        },
      ],
    });

    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        stripeSessionId: checkout.id,
        status: InvoiceStatus.PENDING,
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 },
    );
  }
}
