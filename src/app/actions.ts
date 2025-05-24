"use server";

// import { redirect } from 'next/navigation'
import { z } from "zod";

import { showMinersInfo } from "./client";

const schema = z.object({
  wallet: z.string().min(1, {
    message: "Wallet address is required",
  }),
});

export async function getInfoMiners(prevState: unknown, formData: FormData) {
  const validatedFields = schema.safeParse({
    wallet: formData.get("wallet"),
  });

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = await showMinersInfo(formData.get("wallet") as string);

  const stats = {
    totalHashRate: data.totalHashRate?.toString() || "0",
    totalMiners: (data.miners?.length?.toString() || "0") as string,
    activeMiners: data.existedMiners.length?.toString() || "0",
    totalHashRateExistMiners: data.totalHashRateExistMiners?.toString() || "0",
  };

  return { info: { stats, miners: data.existedMiners } };
}
