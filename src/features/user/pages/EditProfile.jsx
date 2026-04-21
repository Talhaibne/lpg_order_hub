import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
  address: Yup.object({
    house: Yup.string().trim().required("House is required"),
    road: Yup.string().trim().required("Road is required"),
    block: Yup.string().trim().required("Block is required"),
    area: Yup.string().trim().required("Area is required"),
    city: Yup.string().trim().required("City is required"),
  }),
});

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: {
        house: user?.address?.house || "",
        road: user?.address?.road || "",
        block: user?.address?.block || "",
        area: user?.address?.area || "",
        city: user?.address?.city || "",
      },
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateProfile(values);
        toast.success("Profile updated");
        navigate(-1);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Update failed");
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
      <main className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-bold text-foreground">Edit profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your personal details and default delivery address.
            </p>

            <form onSubmit={formik.handleSubmit} className="mt-6 space-y-6" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("fullName", "Full name", { autoComplete: "name" })}
                {renderField("email", "Email", { type: "email", autoComplete: "email" })}
                {renderField("phone", "Phone", { type: "tel", autoComplete: "tel" })}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground">Address</h2>
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

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
