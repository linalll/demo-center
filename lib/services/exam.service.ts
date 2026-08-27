import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/handler";
import { ExamAttemptStatus, ExamResultSource, QuestionType } from "@prisma/client";
import { notifyExamResult } from "@/lib/services/notification.service";

/** system.md #25 — recording a result for an exam that happened outside the system. */
export async function recordOfflineResult(input: {
  examId: string;
  studentId: string;
  score: number;
  gradedById: string;
}) {
  const exam = await db.exam.findUniqueOrThrow({ where: { id: input.examId } });

  const result = await db.examResult.upsert({
    where: { examId_studentId: { examId: input.examId, studentId: input.studentId } },
    update: { score: input.score, gradedById: input.gradedById },
    create: {
      examId: input.examId,
      studentId: input.studentId,
      score: input.score,
      totalMarks: exam.totalMarks,
      source: ExamResultSource.OFFLINE_MANUAL,
      gradedById: input.gradedById,
    },
  });

  await notifyExamResult(result.id).catch((e) => console.error(e));
  return result;
}

export async function startExamAttempt(examId: string, studentId: string) {
  const existing = await db.examAttempt.findUnique({ where: { examId_studentId: { examId, studentId } } });
  if (existing) return existing;

  return db.examAttempt.create({ data: { examId, studentId } });
}

export async function saveAnswer(input: {
  attemptId: string;
  questionId: string;
  answerText?: string;
  selectedOptionId?: string;
}) {
  const attempt = await db.examAttempt.findUniqueOrThrow({ where: { id: input.attemptId } });
  if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) {
    throw new ApiError(409, "ATTEMPT_ALREADY_SUBMITTED");
  }

  return db.answer.upsert({
    where: { attemptId_questionId: { attemptId: input.attemptId, questionId: input.questionId } },
    update: { answerText: input.answerText, selectedOptionId: input.selectedOptionId },
    create: {
      attemptId: input.attemptId,
      questionId: input.questionId,
      answerText: input.answerText,
      selectedOptionId: input.selectedOptionId,
    },
  });
}

/** system.md #24 — auto-grades objective questions on submit; essays/short answers wait for a teacher. */
export async function submitExamAttempt(attemptId: string) {
  const attempt = await db.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      exam: true,
      answers: { include: { question: { include: { options: true } }, selectedOption: true } },
    },
  });

  let autoScore = new Decimal(0);

  for (const answer of attempt.answers) {
    const q = answer.question;
    if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
      const isCorrect = answer.selectedOption?.isCorrect ?? false;
      const marksAwarded = isCorrect ? q.marks : new Decimal(0);
      await db.answer.update({
        where: { id: answer.id },
        data: { isCorrect, marksAwarded },
      });
      autoScore = autoScore.add(marksAwarded);
    }
  }

  await db.examAttempt.update({
    where: { id: attemptId },
    data: { status: ExamAttemptStatus.SUBMITTED, submittedAt: new Date() },
  });

  const hasManualQuestions = attempt.answers.some(
    (a) => a.question.type === QuestionType.SHORT_ANSWER || a.question.type === QuestionType.ESSAY,
  );

  if (!hasManualQuestions) {
    const result = await db.examResult.upsert({
      where: { examId_studentId: { examId: attempt.examId, studentId: attempt.studentId } },
      update: { score: autoScore, totalMarks: attempt.exam.totalMarks },
      create: {
        examId: attempt.examId,
        studentId: attempt.studentId,
        score: autoScore,
        totalMarks: attempt.exam.totalMarks,
        source: ExamResultSource.ONLINE_AUTO,
      },
    });
    await notifyExamResult(result.id).catch((e) => console.error(e));
  }

  return { autoScore, needsManualGrading: hasManualQuestions };
}
