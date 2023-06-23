"use client";

import { Username, UsernameSchema } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

type PartialUser = Pick<User, "id" | "username">;

interface UsernameFormProps {
  user: PartialUser;
}

const UsernameForm: FC<UsernameFormProps> = ({ user }) => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Username>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: {
      name: user?.username ?? "",
    },
  });

  const { mutate: handleUsernameChange, isLoading } = useMutation({
    mutationFn: async ({ name }: Username) => {
      const payload: Username = {
        name,
      };

      const { data } = await axios.patch("/api/username", payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          toast({
            title: "Username already taken.",
            description: "Please choose another username.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Username updated.",
        description: "Your username has been updated.",
        variant: "default",
      });
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((e) => handleUsernameChange(e))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label htmlFor="username" className="sr-only">
              Username
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors.name && (
              <div className="px-1 text-xs text-red-600">
                {errors.name.message}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UsernameForm;
