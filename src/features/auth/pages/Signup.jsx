import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/features/auth/context/AuthContext";

const schema = Yup.object({
  fullName: Yup.string().trim().min(2, "Too short").max(100).required("Full name is required"),
  email: Yup.string().trim().email("Invalid email").max(255).required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\-\s]{7,20}$/, "Invalid phone number")
    .required("Phone is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  address: Yup.object({
    house: Yup.string().trim().required("House is required"),
    road: Yup.string().trim().required("Road is required"),
    block: Yup.string().trim().required("Block is required"),
    area: Yup.string().trim().required("Area is required"),
    city: Yup.string().trim().required("City is required"),
  }),
});

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: { house: "", road: "", block: "", area: "", city: "" },
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { confirmPassword, ...payload } = values;
        await signup(payload);
        toast.success("Account created — welcome!");
        navigate("/order", { replace: true });
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Signup failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const err = (path) => {
    const parts = path.split(".");
    let touched = formik.touched;
    let errors = formik.errors;
    for (const p of parts) {
      touched = touched?.[p];
      errors = errors?.[p];
    }
    return touched && errors ? errors : null;
  };

  const value = (path) => path.split(".").reduce((v, p) => v?.[p], formik.values);

  const renderField = (name, label, { type = "text", autoComplete } = {}) => (
    <div className="space-y-1">
      <FloatingInput
        id={name}
        name={name}
        type={type}
        label={label}
        autoComplete={autoComplete}
        value={value(name) || ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={!!err(name)}
        aria-invalid={!!err(name)}
      />
      {err(name) && <p className="text-xs text-destructive">{err(name)}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/40">
      <Topbar />
      <main className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign up to place LPG orders and track deliveries.
          </p>

          <form onSubmit={formik.handleSubmit} className="mt-6 space-y-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {renderField("fullName", "Full name", { autoComplete: "name" })}
              {renderField("email", "Email", { type: "email", autoComplete: "email" })}
              {renderField("phone", "Phone", { type: "tel", autoComplete: "tel" })}
              <div className="hidden sm:block" />
              {renderField("password", "Password", { type: "password", autoComplete: "new-password" })}
              {renderField("confirmPassword", "Confirm password", { type: "password", autoComplete: "new-password" })}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Address</h2>
              <p className="text-xs text-muted-foreground">Used as your default delivery address.</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {renderField("address.house", "House")}
                {renderField("address.road", "Road")}
                {renderField("address.block", "Block")}
                {renderField("address.area", "Area")}
                <div className="sm:col-span-2">
                  {renderField("address.city", "City")}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
