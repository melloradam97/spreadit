"use client";
import { FC, useState } from "react";
import { Label } from "./ui/Label";
import { TextArea } from "./ui/TextArea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentSchemaType } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "./ui/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const [comment, setComment] = useState("");

  const { mutate: createComment, isLoading } = useMutation({
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
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setComment("");

      router.refresh();

      return toast({
        title: "Comment created",
        description: "Your comment has been created.",
      });
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <TextArea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />

        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={comment.length === 0}
            onClick={() => createComment({ postId, text: comment, replyToId })}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
