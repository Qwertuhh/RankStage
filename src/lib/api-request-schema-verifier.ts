import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import { z } from "zod";

async function verifyRequestSchema<T>(req: NextRequest, schema: z.ZodSchema<T>) {
    const { data, error } = schema.safeParse(await req.json());

    if (error) {
        const errorMessage = error.flatten().fieldErrors;
        logger.error("Change Password Error", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    return data;
}

export default verifyRequestSchema;
