import { buttonVariants } from "@/components/ui/Button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "You need to be signed in to do that.",
      description: "Please sign in or sign up.",
      variant: "destructive",
      action: (
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "outline" })}
          onClick={() => dismiss()}
        >
          Sign In
        </Link>
      ),
    });
  };

  return { loginToast };
};
