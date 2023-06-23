import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameSchema } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    const { name } = UsernameSchema.parse(body);

    const username = await db.user.findFirst({
      where: {
        username: name,
      },
    });

    if (username)
      return new Response("Username already taken", { status: 409 });

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("Username updated", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not update username. Please try again later.", {
      status: 500,
    });
  }
}
