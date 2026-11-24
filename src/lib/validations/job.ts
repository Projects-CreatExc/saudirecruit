import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  titleAr: z.string().max(255).optional(),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters"),
  descriptionAr: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  jobType: z.enum([
    "full_time",
    "part_time",
    "contract",
    "temporary",
    "internship",
  ]),
  experienceLevel: z
    .enum(["entry", "mid", "senior", "lead", "executive"])
    .optional(),
  category: z.string().max(100).optional(),
  skills: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).default("Saudi Arabia"),
  isRemote: z.boolean().default(false),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string().max(3).default("SAR"),
  isSalaryHidden: z.boolean().default(false),
  genderPreference: z
    .enum(["male", "female", "not_specified"])
    .default("not_specified"),
  visaRequirement: z
    .enum([
      "citizen",
      "resident",
      "work_visa",
      "visit_visa",
      "transferable",
      "not_specified",
    ])
    .default("not_specified"),
  saudizationApplicable: z.boolean().default(false),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
