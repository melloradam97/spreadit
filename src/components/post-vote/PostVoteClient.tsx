"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { VoteSchemaType } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "../ui/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmount: number;
  initialUserVote: VoteType | undefined;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVotesAmount,
  initialUserVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [userVote, setUserVote] = useState(initialUserVote);
  const previousUserVote = usePrevious(userVote);

  useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: VoteSchemaType = {
        postId,
        voteType,
      };

      const { data } = await axios.patch("/api/subreddit/post/vote", payload);

      return data as VoteSchemaType;
    },
    onError: (error, voteType) => {
      if (voteType === "UP") {
        setVotesAmount((prev) => prev - 1);
      } else {
        setVotesAmount((prev) => prev + 1);
      }

      setUserVote(previousUserVote);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Error",
        description: "Your vote could not be processed. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: (voteType: VoteType) => {
      if (userVote === voteType) {
        setUserVote(undefined);
        if (voteType === "UP") setVotesAmount((prev) => prev - 1);
        else if (voteType === "DOWN") setVotesAmount((prev) => prev + 1);
      } else {
        setUserVote(voteType);
        if (voteType === "UP")
          setVotesAmount((prev) => prev + (userVote ? 2 : 1));
        else if (voteType === "DOWN")
          setVotesAmount((prev) => prev - (userVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": userVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": userVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
