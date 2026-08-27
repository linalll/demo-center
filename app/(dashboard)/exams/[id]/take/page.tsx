import { ExamTaking } from "@/components/exams/exam-taking";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ExamTaking examId={id} />
    </div>
  );
}
