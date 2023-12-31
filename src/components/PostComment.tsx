"use client";
import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { CommentVote, User, Comment } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { TextArea } from "./ui/TextArea";
import { useMutation } from "@tanstack/react-query";
import { CommentSchemaType } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "./ui/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote?: CommentVote | undefined;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmount,
  currentVote,
  postId,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [commentReply, setCommentReply] = useState("");
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const { mutate: createCommentReply, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentSchemaType) => {
      const payload: CommentSchemaType = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data as CommentSchemaType;
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setCommentReply("");
      setIsReplying(false);

      router.refresh();

      return toast({
        title: "Comment created",
        description: "Your comment has been created.",
      });
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className="w-6 h-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="mx-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialUserVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="commentReply">Your comment</Label>
            <div className="mt-2">
              <TextArea
                id="commentReply"
                value={commentReply}
                onChange={(e) => setCommentReply(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant="subtle"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={commentReply.length === 0}
                  onClick={() => {
                    if (!commentReply) return;

                    createCommentReply({
                      postId,
                      text: commentReply,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
