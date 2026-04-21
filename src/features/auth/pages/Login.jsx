import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/features/auth/context/AuthContext";

const schema = Yup.object({
  email: Yup.string().trim().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const u = await login(values);
        toast.success("Welcome back!");
        const dest = from || (u?.role === "admin" ? "/admin/orders" : "/order");
        navigate(dest, { replace: true });
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Login failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldError = (name) => formik.touched[name] && formik.errors[name];

  return (
    <div className="min-h-screen bg-secondary/40">
      <Topbar />
      <main className="container-page flex justify-center py-12 md:py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Enter your credentials to continue.
          </p>

          <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1">
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!fieldError("email")}
                aria-invalid={!!fieldError("email")}
              />
              {fieldError("email") && (
                <p className="text-xs text-destructive">{formik.errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <FloatingInput
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!fieldError("password")}
                aria-invalid={!!fieldError("password")}
              />
              {fieldError("password") && (
                <p className="text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
