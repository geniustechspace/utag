import {
    handleAuthErrors,
    loginWithEmail,
    loginWithGoogle,
    logOut,
    signUpWithEmail,
} from "./firebase";
import {
    LoginForm,
    SignUpForm,
    AuthComponentsMounter,
} from "./firebase/components";
import { AuthProvider, useAuth, withLoginRequired } from "./firebase/provider";

export {
    AuthProvider,
    useAuth,
    withLoginRequired,
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logOut,
    handleAuthErrors,
    LoginForm,
    SignUpForm,
    AuthComponentsMounter,
};
