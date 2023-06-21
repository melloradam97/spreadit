import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostSchema } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, content, subredditId } = PostSchema.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return new Response("Subscribe to post", { status: 403 });
    }

    await db.post.create({
      data: {
        title,
        authorId: session.user.id,
        subredditId,
        content,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not post to subreddit. Please try again later.",
      { status: 500 }
    );
  }
}
