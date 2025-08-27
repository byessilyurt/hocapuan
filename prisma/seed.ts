import { prisma } from "@/app/lib/prisma";
import { faker } from "@faker-js/faker";

faker.seed(42);

const universities = [
  "Boğaziçi Üniversitesi",
  "İstanbul Teknik Üniversitesi",
  "Orta Doğu Teknik Üniversitesi",
  "Hacettepe Üniversitesi",
  "İstanbul Üniversitesi",
  "Ankara Üniversitesi",
  "Galatasaray Üniversitesi",
  "Marmara Üniversitesi",
  "Ege Üniversitesi",
  "Yıldız Teknik Üniversitesi",
];

const departments = ["Bilgisayar Mühendisliği", "Elektrik-Elektronik", "Endüstri Mühendisliği"];

const tagsPool = [
  "adillik",
  "katılık",
  "katılım zorunlu",
  "projeler",
  "quizzler",
  "not cömert",
  "yoklama",
  "kaynaklar iyi",
];

function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  // Admin and user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const userEmail = "user@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: "$2b$10$V4kQnT/2n6QnY9D0zq9bFuj4m9v3m4gqf3mUj9o1oDq3wJjDk6yFC", // bcrypt for Admin123!@#
      role: "admin",
      emailVerifiedAt: new Date(),
      isEduVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      passwordHash: "$2b$10$z4y2oQCy2ZQwq4o2d5lGqODb7yR3UQ1rA1YQzWgkqU3wU6m5D3W5S", // bcrypt for User123!@#
      emailVerifiedAt: new Date(),
      isEduVerified: false,
    },
  });

  // Catalog
  for (const uniName of universities) {
    const uni = await prisma.university.create({
      data: {
        name: uniName,
        city: faker.location.city(),
        slug: slugify(uniName),
      },
    });

    for (const deptName of departments) {
      const dept = await prisma.department.create({
        data: {
          name: deptName,
          slug: slugify(deptName),
          universityId: uni.id,
        },
      });

      for (let i = 0; i < 5; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const instructor = await prisma.instructor.create({
          data: {
            universityId: uni.id,
            departmentId: dept.id,
            firstName,
            lastName,
            slug: slugify(`${firstName}-${lastName}`),
          },
        });

        // 5-30 reviews per instructor, total ~200 across all
        const reviewsCount = faker.number.int({ min: 5, max: 30 });
        for (let r = 0; r < reviewsCount; r++) {
          const overall = faker.number.int({ min: 1, max: 5 });
          const clarity = faker.number.int({ min: 1, max: 5 });
          const helpfulness = faker.number.int({ min: 1, max: 5 });
          const workload = faker.number.int({ min: 1, max: 5 });
          const wouldTakeAgain = faker.datatype.boolean();
          const text = faker.lorem.paragraphs({ min: 1, max: 2 });
          const isAnonymous = faker.datatype.boolean();
          const status = faker.helpers.weightedArrayElement<"approved" | "pending" | "hidden" | "deleted">([
            { weight: 6, value: "approved" },
            { weight: 2, value: "pending" },
            { weight: 1, value: "hidden" },
            { weight: 1, value: "deleted" },
          ]);

          const review = await prisma.review.create({
            data: {
              userId: faker.helpers.arrayElement([admin.id, user.id]),
              instructorId: instructor.id,
              overall,
              clarity,
              helpfulness,
              workload,
              wouldTakeAgain,
              courseCode: faker.helpers.maybe(() => `CSE${faker.number.int({ min: 100, max: 499 })}`, { probability: 0.5 }),
              term: faker.helpers.maybe(() => `Güz ${faker.number.int({ min: 2019, max: 2025 })}`, { probability: 0.5 }),
              grade: faker.helpers.maybe(() => faker.helpers.arrayElement(["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FF"])) ?? undefined,
              text,
              isAnonymous,
              status,
            },
          });

          const tags = faker.helpers.arrayElements(tagsPool, faker.number.int({ min: 1, max: 3 }));
          for (const t of tags) {
            await prisma.reviewTag.create({ data: { reviewId: review.id, tag: t } });
          }

          const helpfuls = faker.number.int({ min: 0, max: 10 });
          for (let h = 0; h < helpfuls; h++) {
            await prisma.helpfulVote.create({
              data: {
                reviewId: review.id,
                userId: faker.helpers.arrayElement([admin.id, user.id]),
              },
            }).catch(() => { });
          }
        }
      }
    }
  }

  // compute cached aggregates
  const all = await prisma.instructor.findMany({ select: { id: true } });
  for (const inst of all) {
    const agg = await prisma.review.aggregate({
      where: { instructorId: inst.id, status: "approved" },
      _avg: { overall: true },
      _count: { _all: true },
    });
    await prisma.instructor.update({
      where: { id: inst.id },
      data: {
        overallRating: agg._avg.overall ?? 0,
        reviewCount: agg._count._all,
      },
    });
  }

  console.log("Seeded data successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


