import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import InstagramIcon from "/auth_logo_instagram.svg";
import { FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserProvider";
import { AxiosError } from "axios";
import { validatePassword, validateEmail } from "@/utils/validation";

const SignUp = () => {
  const {
    signUpWithEmail,
    authenWithGoogle,
    signUpWithFacebook,
    user,
    loading,
  } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Navigate when user state changes after successful login/signup
  useEffect(() => {
    if (user && !loading) {
      if (!user.is_onboard) {
        navigate("/onboarding");
      } else {
        navigate("/explore");
      }
    }
  }, [user, loading, navigate]); // To navigate after signup

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    const validationError = validatePassword(passwordValue);
    setPasswordError(validationError || "");
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const validationError = validateEmail(emailValue);
    setEmailError(validationError || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setEmailError("");
    setPasswordError("");

    // Validate email before submitting
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validate password before submitting
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      const token = await signUpWithEmail(email, password, username); // Get the token
      localStorage.setItem("user_verify", token);
      navigate(`/activate-account/${token}`); // Redirect to the activate-account page with the token
    } catch (err) {
      let errorMessage = "";
      if (err instanceof AxiosError) {
        const code = err.code;
        switch (code) {
          case "auth/email-already-in-use":
            errorMessage = "Already used email. Please try with another";
            break;
          case "auth/invalid-email":
            setEmailError("Invalid email. Please try again");
            break;
          case "auth/missing-password":
            setPasswordError("Missing password. Please try again");
            break;
          case "auth/network-request-failed":
            errorMessage = "Overload sign up request. Please try again";
            break;
          default:
            errorMessage = err.message;
        }
      }
      if (err instanceof Error) {
        console.log('name', err.name);
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(""); // Clear any previous errors
      await authenWithGoogle();
      // The UserProvider will handle fetching profile and setting user state
      // We'll navigate after the user state is updated
    } catch (error) {
      console.error("Google login error:", error);
      let message = "Something went wrong. Please try again.";

      if (error instanceof Error) {
        // Handle Firebase Auth errors and our custom errors
        if (error.message.includes("popup-closed-by-user")) {
          message =
            "Login was cancelled. You closed the popup before signing in.";
        } else if (error.message.includes("popup-blocked")) {
          message =
            "The login popup was blocked by your browser. Please enable popups and try again.";
        } else if (error.message.includes("cancelled-popup-request")) {
          message = "Login was interrupted by another popup request.";
        } else if (
          error.message.includes("account-exists-with-different-credential")
        ) {
          message =
            "An account already exists with a different sign-in method. Try logging in using that method.";
        } else if (error.message.includes("network-request-failed")) {
          message =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("Failed to create account")) {
          message = error.message; // Use our custom error message
        } else {
          message = error.message;
        }
      } else if (error instanceof AxiosError) {
        const code = error.code;
        switch (code) {
          case "auth/popup-closed-by-user":
            message =
              "Login was cancelled. You closed the popup before signing in.";
            break;
          case "auth/cancelled-popup-request":
            message = "Login was interrupted by another popup request.";
            break;
          case "auth/account-exists-with-different-credential":
            message =
              "An account already exists with a different sign-in method. Try logging in using that method.";
            break;
          case "auth/popup-blocked":
            message =
              "The login popup was blocked by your browser. Please enable popups and try again.";
            break;
          default:
            message = error.message;
        }
      }
      setError(message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signUpWithFacebook(); // Call Facebook login function from UserProvider
      navigate("/home"); // Redirect after successful login
    } catch (error) {
      setError((error as Error).message); // Handle errors from Facebook login
    }
  };

  return (
    <div className="flex-1 space-y-4 px-10 md:px-0 lg:px-20 py-8">
      <div className="flex flex-col space-x-3">
        <h1 className="font-bold text-mountain-800 dark:text-mountain-50 text-xl xl:text-2xl leading-6">
          Join us!
        </h1>
        <p className="mt-2 font-bold text-mountain-600 dark:text-mountain-300 text-lg lg:text-xl xl:text-2xl text-nowrap">
          Create an ArtShare account
        </p>
        <p className="mt-4 text-mountain-500 dark:text-mountain-300 text-xs xl:text-sm xl:text-nowrap">
          Join a vibrant community where you can create, share, & celebrate art.
        </p>
      </div>
      <div className="flex flex-col justify-between space-x-4 space-y-4 mt-4">
        {/* Google Login */}
        <div className="flex w-full">
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg focus:outline-none focus:ring-2 w-full h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="size-5" />
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Facebook, Instagram, Apple Login */}
        <div className="flex justify-between w-full">
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg focus:outline-none focus:ring-2 w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
            onClick={handleFacebookLogin}
          >
            <FaFacebookF className="size-5 text-blue-700" />
            <span>Facebook</span>
          </Button>
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg focus:outline-none focus:ring-2 w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
          >
            <img src={InstagramIcon} alt="Instagram" className="size-5" />
            <span>Instagram</span>
          </Button>
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg focus:outline-none focus:ring-2 w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
          >
            <FaApple className="size-5" />
            <span>Apple</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-6 text-center">
        <hr className="border-mountain-900 border-t-1 w-full" />
        <div className="text-mountain-600 text-sm">Or</div>
        <hr className="border-mountain-900 border-t-1 w-full" />
      </div>

      {/* Sign-up Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block font-semibold text-mountain-600 dark:text-mountain-50 text-sm"
          >
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="dark:bg-mountain-900 shadow-sm mt-1 p-3 border border-mountain-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-10 text-mountain-950 dark:text-mountain-50"
            value={email}
            onChange={handleEmailChange}
          />
          {emailError && emailError.length > 0 && (
            <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {emailError}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block font-medium text-mountain-600 dark:text-mountain-50 text-sm"
          >
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            className={`dark:bg-mountain-900 shadow-sm mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 w-full h-10 text-mountain-950 dark:text-mountain-50 ${
              passwordError
                ? "border-red-500 focus:ring-red-500"
                : password && (!passwordError || passwordError != "")
                  ? "border-green-500 focus:ring-green-500"
                  : "border-mountain-800 focus:ring-blue-500"
            }`}
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && passwordError.length > 0 && (
            <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {passwordError}
            </p>
          )}
          {password && !passwordError ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-green-600 dark:text-green-400 text-xs font-medium">
                Password requirements satisfied!
              </p>
            </div>
          ) : (
            <p className="mt-1 text-mountain-500 dark:text-mountain-400 text-xs">
              At least 8 characters with numbers & symbols
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-mountain-800 hover:bg-mountain-700 dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900 hover:brightness-110 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full h-10 font-bold text-white dark:text-mountain-50 hover:cursor-pointer"
        >
          Sign Up with Email
        </Button>
      </form>
      {/* Display error and success messages */}
      {error && error.length > 0 && (
        <p className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}

      <div className="mt-6 text-left">
        <p className="text-mountain-600 dark:text-mountain-100 text-xs xl:text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-2 text-indigo-600 dark:text-indigo-300"
          >
            Login
          </Link>
        </p>
      </div>

      <div className="mt-4 text-[10px] text-mountain-500 dark:text-mountain-300 xl:text-xs lg:text-left text-center">
        <p>
          By signing up for ArtShare, I confirm that I have read and agree to
          the ArtShare{" "}
          <a href="#" className="text-indigo-600 dark:text-indigo-300">
            Terms of Service
          </a>{" "}
          -{" "}
          <a href="#" className="text-indigo-600 dark:text-indigo-300">
            Privacy Policy
          </a>{" "}
          regarding data usage.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
