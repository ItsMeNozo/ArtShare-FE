import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import InstagramIcon from "/auth_logo_instagram.svg";
import { FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserProvider"; // Import the UserProvider hook

// import { login } from "@/api/authentication/auth"; // Import the login API function

const Login = () => {
  const { loginWithEmail, signUpWithGoogle, signUpWithFacebook } = useUser(); // Using the UserProvider context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [message] = useState<string | null>(null);
  const navigate = useNavigate(); // To navigate after login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous error
    try {
      await loginWithEmail(email, password);
      navigate("/gallery");
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as any).code;
        switch (code) {
          case "auth/invalid-credential":
            errorMessage =
              "Invalid email or password. Try signing up if you don’t have an account.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/email-not-verified":
          case "auth/user-not-verified":
            errorMessage = "Please verify your email before logging in.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email. Please try again";
            break;
          case "auth/missing-password":
            errorMessage = "Missing password. Please try again";
            break;
          default:
            if ("message" in err) {
              errorMessage = (err as any).message;
            }
        }
      }
      setError(errorMessage);
    }
  };


  const handleGoogleLogin = async () => {
    setError(""); // Clear previous error
    try {
      await signUpWithGoogle(); // Call Google login function from UserProvider
      navigate("/gallery"); // Redirect after successful login
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as any).code;
        switch (code) {
          case "auth/popup-closed-by-user":
            message = "Login was cancelled. You closed the popup before signing in.";
            break;
          case "auth/cancelled-popup-request":
            message = "Login was interrupted by another popup request.";
            break;
          case "auth/account-exists-with-different-credential":
            message =
              "An account already exists with a different sign-in method. Try logging in using that method.";
            break;
          case "auth/popup-blocked":
            message = "The login popup was blocked by your browser. Please enable popups and try again.";
            break;
          default:
            if ("message" in error) {
              message = (error as any).message;
            }
        }
      }
      setError(message);
    }
  };


  const handleFacebookLogin = async () => {
    try {
      await signUpWithFacebook(); // Call Facebook login function from UserProvider
      navigate("/gallery"); // Redirect after successful login
    } catch (error) {
      setError((error as Error).message);
    }
  };

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // // Basic email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(emailValue)) {
    //   setError("Please enter a valid email address.");
    // } else {
    //   setError(null); // Clear error if email is valid
    // }
  }

  return (
    <div className="flex-1 space-y-4 px-10 md:px-0 lg:px-20 py-8">
      <div className="flex flex-col space-x-3">
        <h1 className="font-bold text-mountain-800 dark:text-mountain-50 text-2xl xl:text-3xl leading-6">
          Welcome back!
        </h1>
        <p className="mt-2 font-bold text-mountain-600 dark:text-mountain-300 text-2xl xl:text-3xl">
          Login to your account
        </p>
        <p className="mt-4 text-mountain-500 dark:text-mountain-300 text-xs xl:text-sm">
          It's nice to see you again. Ready to showcase your art?
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="username"
            className="block font-semibold text-mountain-600 dark:text-mountain-50 text-sm"
          >
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your username or email"
            className="dark:bg-mountain-900 shadow-sm mt-1 p-3 border border-mountain-800 rounded-lg focus:ring-indigo-500 w-full h-10 text-mountain-950 dark:text-mountain-50"
            value={email}
            onChange={(e) => {
              handleEmailChange(e);
            }}
          />
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
            className="dark:bg-mountain-900 shadow-sm mt-1 p-3 border border-mountain-800 rounded-lg focus:ring-indigo-500 w-full h-10 text-mountain-950 dark:text-mountain-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <label className="flex items-center text-mountain-500 text-sm">
            <input type="checkbox" className="mr-2" />
            Remember me
          </label>
          <div className="text-indigo-600 dark:text-indigo-300 text-sm">
            <Link to="/forgot-password">Forgot username or password?</Link>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-mountain-800 hover:bg-mountain-700 dark:bg-gradient-to-r dark:from-blue-800 dark:via-purple-700 dark:to-pink-900 hover:brightness-110 py-3 rounded-lg focus:ring-indigo-500 w-full h-10 font-bold text-mountain-50 hover:cursor-pointer"
        >
          Login
        </Button>
      </form>

      {/* Display error and success messages */}
      {error && (
        <p className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      {message && (
        <p className="mt-4 text-green-600 dark:text-green-400 text-sm">
          {message}
        </p>
      )}

      <div className="flex items-center space-x-4 mt-6 text-center">
        <hr className="border-mountain-900 border-t-1 w-full" />
        <div className="text-mountain-600 text-sm">Or</div>
        <hr className="border-mountain-900 border-t-1 w-full" />
      </div>

      <div className="flex flex-col justify-between space-x-4 space-y-4 mt-4">
        <div className="flex w-full">
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg w-full h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="size-5" />
            <span>Continue with Google</span>
          </Button>
        </div>
        <div className="flex justify-between w-full">
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
            onClick={handleFacebookLogin}
          >
            <FaFacebookF className="size-5 text-blue-600" />
            <span>Facebook</span>
          </Button>
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
          >
            <img src={InstagramIcon} alt="Instagram" className="size-5" />
            <span>Instagram</span>
          </Button>
          <Button
            variant={"outline"}
            className="flex justify-center items-center hover:brightness-115 px-4 py-3 border border-mountain-950 dark:border-mountain-700 rounded-lg w-[32%] h-10 font-normal text-mountain-950 dark:text-mountain-50 text-sm hover:cursor-pointer"
          >
            <FaApple className="size-5" />
            <span>Apple</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 text-left">
        <p className="text-mountain-600 dark:text-mountain-50 text-xs xl:text-sm">
          Don’t have an account?
          <Link
            to="/signup"
            className="ml-2 text-indigo-600 dark:text-indigo-300"
          >
            Register
          </Link>
        </p>
      </div>
      <div className="mt-4 text-[10px] text-mountain-500 dark:text-mountain-300 xl:text-xs lg:text-left text-center">
        <p>
          By logging in to ArtShare, I confirm that I have read and agree to the
          ArtShare{" "}
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

export default Login;
