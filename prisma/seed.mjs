import bcrypt from "bcryptjs";
import {
  ClassPostMediaType,
  PrismaClient,
  ClassMediaType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

function monthDate(year, monthIndex, day = 28) {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

async function main() {
  await prisma.liveClassAttendance.deleteMany();
  await prisma.liveClassSession.deleteMany();
  await prisma.classPost.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.classContent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contentRevision.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const editorPasswordHash = await bcrypt.hash("Editor123!", 10);
  const studentPasswordHash = await bcrypt.hash("Student123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@nextgenict.local",
      fullName: "NextGenICT Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: "editor@nextgenict.local",
      fullName: "NextGenICT Content Editor",
      passwordHash: editorPasswordHash,
      role: Role.CONTENT_EDITOR,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@nextgenict.local",
      fullName: "Jannatul Ferdous",
      passwordHash: studentPasswordHash,
      parentAccessCode: "NGPDEMO2026A1",
      role: Role.STUDENT,
    },
  });

  const janInvoice = await prisma.invoice.create({
    data: {
      studentId: student.id,
      monthLabel: "January 2026",
      amount: 4500,
      status: InvoiceStatus.PAID,
      dueDate: monthDate(2026, 0),
    },
  });

  const febInvoice = await prisma.invoice.create({
    data: {
      studentId: student.id,
      monthLabel: "February 2026",
      amount: 4500,
      status: InvoiceStatus.PAID,
      dueDate: monthDate(2026, 1),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: student.id,
      monthLabel: "March 2026",
      amount: 4500,
      status: InvoiceStatus.DUE,
      dueDate: monthDate(2026, 2),
    },
  });

  await prisma.invoice.create({
    data: {
      studentId: student.id,
      monthLabel: "April 2026",
      amount: 4500,
      status: InvoiceStatus.PENDING,
      dueDate: monthDate(2026, 3),
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student.id,
      invoiceId: janInvoice.id,
      amount: 4500,
      currency: "BDT",
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PAID,
      providerRef: "seed_stripe_jan_2026",
      paidAt: monthDate(2026, 0, 24),
      note: "Seeded paid transaction",
    },
  });

  const sampleClass = await prisma.classContent.create({
    data: {
      title: "ICT Basics - Introduction to Networking",
      description:
        "Recorded class on basic networking concepts: IP, LAN, router workflow, and troubleshooting practice.",
      classCode: "ICT-NET-2026",
      mediaType: ClassMediaType.VIDEO,
      mediaUrl: "https://res.cloudinary.com/demo/video/upload/v1312461204/dog.mp4",
      mediaPublicId: "demo/dog",
      mediaOriginalName: "networking-intro.mp4",
      createdById: admin.id,
    },
  });

  await prisma.classEnrollment.create({
    data: {
      classId: sampleClass.id,
      studentId: student.id,
    },
  });

  await prisma.classPost.create({
    data: {
      classId: sampleClass.id,
      authorId: admin.id,
      message:
        "Welcome to the class channel. Here we will post class updates, resources, and assignment instructions.",
      mediaType: ClassPostMediaType.TEXT,
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student.id,
      invoiceId: febInvoice.id,
      amount: 4500,
      currency: "BDT",
      method: PaymentMethod.MANUAL,
      status: PaymentStatus.PAID,
      providerRef: "seed_manual_feb_2026",
      paidAt: monthDate(2026, 1, 26),
      note: "Manual payment approved by admin",
    },
  });

  console.log("Seed complete");
  console.log(`Admin login: ${admin.email} / Admin123!`);
  console.log(`Editor login: ${editor.email} / Editor123!`);
  console.log(`Student login: ${student.email} / Student123!`);
  console.log(`Parent tracking code: ${student.parentAccessCode}`);
  console.log(`Sample class code: ${sampleClass.classCode}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
