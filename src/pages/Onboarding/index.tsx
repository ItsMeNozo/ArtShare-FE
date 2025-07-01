import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { TextareaAutosize } from "@mui/material";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import api from "@/api/baseApi";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// SHADCN Dialog helpers
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios, { AxiosError } from "axios";
import { useUser } from "@/contexts/UserProvider";
import { getUserProfile } from "@/api/authentication/auth";
import { User } from "@/types";

// Constants
const SUCCESS_MESSAGE_TIMEOUT_MS = 1500;

interface ProfileForm {
  full_name: string;
  username: string;
  bio?: string;
  birthday: string;
}

const OnboardingProfile: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProfileForm>({
    defaultValues: {
      full_name: "",
      username: "",
      bio: "",
      birthday: "",
    },
  });
  const { user, setUser } = useUser();

  /* dialog state */
  const [open, setOpen] = useState(true); // Set dialog to open by default
  const [popMessage, setPopMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const showDialog = (ok: boolean, text: string) => {
    setPopMessage({ ok, text });
    setOpen(true);
  };

  // Age validation function (user must be at least 13 years old)
  const isAbove13 = (birthday: string) => {
    const birthDate = new Date(birthday);
    const currentDate = new Date();

    // Calculate the age by comparing the year
    let age = currentDate.getFullYear() - birthDate.getFullYear();

    // If the birth date hasn't occurred yet this year, subtract 1 from age
    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 13;
  };

  const onSubmit = async (raw: ProfileForm) => {
    // Age check
    if (raw.birthday && !isAbove13(raw.birthday)) {
      showDialog(false, "You must be at least 13 years old.");
      return;
    }

    const payload: ProfileForm = {
      ...raw,
      birthday: new Date(raw.birthday).toISOString(),
    };

    try {
      await api.patch("/users/profile", payload);
      // mark them onboarded in context so guards will let them through
      const updatedUser: User = await getUserProfile(user!.id);
      setUser!(updatedUser);

      // Show success message first
      showDialog(true, "Profile completed successfully!");
      reset(raw);

      // Navigate after showing success message for better UX
      setTimeout(() => {
        setOpen(false);
        navigate("/explore", { replace: true });
      }, SUCCESS_MESSAGE_TIMEOUT_MS);
    } catch (err: unknown) {
      // ──── 1. Axios error? ───────────────────────────────────────
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;

        const msg = axiosErr.response?.data?.message ?? axiosErr.message;

        if (msg.includes("Duplicate value for field(s): username")) {
          showDialog(
            false,
            "Username already exists. Please choose a different username.",
          );
          document.getElementById("username")?.focus();
        } else {
          showDialog(false, msg || "Failed to update profile");
        }
        return;
      }

      // ──── 2. Plain JS Error ─────────────────────────────────────
      if (err instanceof Error) {
        showDialog(false, err.message);
        return;
      }

      // ──── 3. Unknown thrown value (string, number, etc.) ────────
      showDialog(false, "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        hideCloseButton
        className="w-full max-w-xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center">
            Complete your profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="full_name"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="full_name"
              placeholder="Your Fullname"
              {...register("full_name", { required: true, maxLength: 80 })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800"
            />
            {errors.full_name && (
              <p className="text-xs text-rose-500">Full Name is required</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="username"
            >
              Username <span className="text-rose-500">*</span>
            </label>
            <Input
              id="username"
              placeholder="Your Username"
              {...register("username", {
                required: {
                  value: true,
                  message: "Username is required",
                },
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Username must be at most 20 characters",
                },
                pattern: {
                  // no spaces anywhere + only a–z, 0–9, _ or –, length 3–20
                  value: /^(?!.*\s)[a-z0-9_-]{3,20}$/i,
                  message:
                    "Use only lowercase letters, numbers, _, and - (no spaces)",
                },
              })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800"
            />

            {/* Error handling */}
            {errors.username && (
              <p className="text-xs text-rose-500">{errors.username.message}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="birthday"
            >
              Birthday <span className="text-rose-500">*</span>
            </label>
            <Input
              id="birthday"
              type="date"
              {...register("birthday", {
                required: "Birthday is required",
                validate: (value) =>
                  typeof value === "string" && isAbove13(value)
                    ? true
                    : "You must be at least 13 years old.",
              })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800"
            />

            {errors.birthday && (
              <p className="text-xs text-rose-500">{errors.birthday.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              htmlFor="bio"
            >
              Bio (optional)
            </label>
            <TextareaAutosize
              id="bio"
              minRows={3}
              maxLength={150}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              placeholder="A short description about you"
              {...register("bio")}
              style={{ resize: "none" }}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {150 - (watch("bio")?.length || 0)} characters left
            </p>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg p-2"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
        {popMessage && (
          <div className="flex flex-col items-center justify-center mt-4">
            {popMessage.ok ? (
              <CheckCircle2 className="text-green-500 w-8 h-8 mb-2" />
            ) : (
              <XCircle className="text-rose-500 w-8 h-8 mb-2" />
            )}
            <span
              className={`text-base font-medium ${popMessage.ok ? "text-green-700 dark:text-green-400" : "text-rose-700 dark:text-rose-400"}`}
            >
              {popMessage.text}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingProfile;
