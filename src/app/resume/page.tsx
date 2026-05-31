import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getResumeUploadsAction } from "@/app/actions/resume";
import { ResumePageShell } from "@/components/resume/resume-page-shell";

export const metadata = {
  title: "Resume Analyser — Jobify",
  description: "Upload your resume and let AI automatically find matching jobs for you.",
};

const MAX_UPLOADS = 3;

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { uploads } = await getResumeUploadsAction();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <ResumePageShell initialUploads={uploads} maxUploads={MAX_UPLOADS} />
    </div>
  );
}
