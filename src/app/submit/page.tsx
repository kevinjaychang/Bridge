"use client";

import { useRef, useState } from "react";
import type { FormEventHandler } from "react";
import {
  AlertCircle,
  Bold,
  Code2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  MessageSquareText,
  Plus,
  Quote,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthState } from "@/components/auth/AuthProvider";
import AppSidebar from "@/components/navigation/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { openAuthModal } from "@/lib/auth";
import { categoryOptions, createIssue } from "@/lib/issues";
import type { IssueCategory, IssuePost, SocialCluster } from "@/types/issue";

type ComposerMode = "post" | "image";

type SubmitForm = {
  title: string;
  category: IssueCategory;
  state: string;
  body: string;
  imageUrl: string;
  bibliography: string[];
};

type FieldErrors = Partial<Record<"title" | "category" | "state" | "body" | "imageUrl", string>> & {
  bibliography?: string[];
};

const defaultClusterMix: IssuePost["clusterMix"] = [
  { cluster: "Civic Reformers", support: 29 },
  { cluster: "Pragmatic Moderates", support: 31 },
  { cluster: "Institutional Skeptics", support: 18 },
  { cluster: "Local Organizers", support: 22 },
];

const emptyForm: SubmitForm = {
  title: "",
  category: "Technology",
  state: "",
  body: "",
  imageUrl: "",
  bibliography: ["", ""],
};

const socialClusters: SocialCluster[] = [
  "Civic Reformers",
  "Pragmatic Moderates",
  "Institutional Skeptics",
  "Local Organizers",
];

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-semibold text-slate-800">
      {children}
      <span className="text-red-400">*</span>
    </Label>
  );
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildCounterPerspective(author: string, category: IssueCategory) {
  return {
    cluster: socialClusters[(author.length + category.length) % socialClusters.length],
    author: "Bridge Counterpoint",
    summary:
      "This thread has initial traction, but stronger evidence and links to opposing concerns will help the feed surface a more durable consensus.",
  } as const;
}

function buildSubmissionBody(form: SubmitForm, mode: ComposerMode) {
  const bibliographyBlock = form.bibliography
    .map((link, index) => `${index + 1}. ${link.trim()}`)
    .join("\n");

  const imageBlock = mode === "image" ? `Featured image: ${form.imageUrl.trim()}\n\n` : "";

  return `${imageBlock}${form.body.trim()}\n\nSources:\n${bibliographyBlock}`;
}

function countWords(value: string) {
  const words = value.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function replaceSelectedLines(selectedText: string, prefix: string) {
  const source = selectedText || "list item";
  return source
    .split("\n")
    .map((line, index) => `${prefix.replace("%d", String(index + 1))}${line || "item"}`)
    .join("\n");
}

function validateForm(form: SubmitForm, mode: ComposerMode): FieldErrors {
  const bibliographyErrors = form.bibliography.map((link, index) => {
    if (!link.trim()) {
      return `Bibliography link ${index + 1} is required.`;
    }

    if (!isValidUrl(link.trim())) {
      return `Bibliography link ${index + 1} must be a valid URL.`;
    }

    return "";
  });

  const requiredFilled = form.bibliography.filter((link) => link.trim()).length;
  if (requiredFilled < 2) {
    bibliographyErrors[0] ||= "Add at least 2 bibliography links.";
    bibliographyErrors[1] ||= "Add at least 2 bibliography links.";
  }

  return {
    title: form.title.trim() ? "" : "A title is required.",
    category: form.category ? "" : "Choose a category.",
    state: form.state.trim() ? "" : "State is required.",
    body:
      !form.body.trim()
        ? "Write the body of your post."
        : countWords(form.body) < 500
          ? `Thread body must be at least 500 words. It is currently ${countWords(form.body)} words.`
          : "",
    imageUrl:
      mode === "image"
        ? !form.imageUrl.trim()
          ? "An image URL is required for image posts."
          : !isValidUrl(form.imageUrl.trim())
            ? "Use a valid image URL."
            : ""
        : "",
    bibliography: bibliographyErrors,
  };
}

function hasErrors(errors: FieldErrors) {
  return Boolean(
    errors.title ||
      errors.category ||
      errors.state ||
      errors.body ||
      errors.imageUrl ||
      errors.bibliography?.some(Boolean),
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<ComposerMode>("post");
  const [form, setForm] = useState<SubmitForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const { currentUser } = useAuthState();

  const bodyWordCount = countWords(form.body);

  function updateField<K extends keyof SubmitForm>(field: K, value: SubmitForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitMessage("");
  }

  function updateBibliography(index: number, value: string) {
    setForm((current) => ({
      ...current,
      bibliography: current.bibliography.map((entry, entryIndex) => (entryIndex === index ? value : entry)),
    }));
    setErrors((current) => ({
      ...current,
      bibliography: current.bibliography?.map((entry, entryIndex) => (entryIndex === index ? "" : entry)) ?? [],
    }));
    setSubmitMessage("");
  }

  function addBibliographyField() {
    setForm((current) => ({ ...current, bibliography: [...current.bibliography, ""] }));
  }

  function applyEditorFormat(
    formatter: (selectedText: string) => { text: string; cursorStart?: number; cursorEnd?: number },
  ) {
    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.body.slice(start, end);
    const result = formatter(selectedText);
    const nextBody = `${form.body.slice(0, start)}${result.text}${form.body.slice(end)}`;

    setForm((current) => ({ ...current, body: nextBody }));
    setErrors((current) => ({ ...current, body: undefined }));
    setSubmitMessage("");

    requestAnimationFrame(() => {
      textarea.focus();
      const nextStart = start + (result.cursorStart ?? result.text.length);
      const nextEnd = start + (result.cursorEnd ?? result.text.length);
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      openAuthModal("signin");
      return;
    }

    const nextErrors = validateForm(form, mode);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setSubmitMessage("Fill every required field before publishing.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const created = await createIssue({
        title: form.title.trim(),
        body: buildSubmissionBody(form, mode),
        category: form.category,
        state: form.state.trim(),
        author: currentUser.username,
        clusterMix: defaultClusterMix,
        counterPerspective: buildCounterPerspective(currentUser.username, form.category),
        urgencyLabel: "Active debate",
      });

      setForm(emptyForm);
      router.push(`/issues/${created.id}`);
    } catch {
      setSubmitMessage("Publishing failed. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <div className="flex gap-5 xl:gap-7">
        <AppSidebar
          currentUser={currentUser}
          activeLabel="Source-first"
          secondaryStat={{
            label: "Popular now",
            value: "Submit",
            description: "Create long-form, source-backed posts with at least two bibliography links.",
          }}
        />

        <div className="min-w-0 flex-1 space-y-8">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-800/70 bg-[linear-gradient(135deg,#020617_0%,#0f172a_45%,#172554_100%)] p-8 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(248,113,113,0.12),transparent_20%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <Badge className="rounded-full border border-sky-400/30 bg-sky-500/15 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-sky-100">
                  Create thread
                </Badge>
                <div className="space-y-3">
                  <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Launch a thread people can actually evaluate.</h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300">
                    Strong posts are clear, sourced, and easy to weigh from multiple sides. Required fields are marked with a red asterisk, and publishing stays locked until they are filled.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">At least 2 sources</div>
                  <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">Post or image mode</div>
                  <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">Inline validation</div>
                </div>
              </div>

              <Card className="border-slate-800 bg-slate-950/60 text-white shadow-none">
                <CardHeader>
                  <CardTitle className="text-white">Publishing checklist</CardTitle>
                  <CardDescription className="text-slate-400">
                    Threads with structure travel further in the consensus feed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-sky-300" />
                    Lead with a question or claim that people can actually agree or disagree with.
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <Link2 className="mt-0.5 h-4 w-4 text-sky-300" />
                    Include at least two bibliography links so readers can inspect your evidence.
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <ImageIcon className="mt-0.5 h-4 w-4 text-sky-300" />
                    Switch to image mode if the visual is part of the argument, not just decoration.
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
          <CardHeader className="space-y-5 border-b border-slate-200/80 bg-slate-50/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Create your thread</CardTitle>
                <CardDescription>Required fields are marked with a red asterisk.</CardDescription>
              </div>
              <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {(["post", "image"] as const).map((option) => {
                  const isActive = mode === option;
                  const Icon = option === "post" ? MessageSquareText : ImageIcon;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMode(option)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                        isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option === "post" ? "Post" : "Image"}
                    </button>
                  );
                })}
              </div>
            </div>

            {submitMessage ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {submitMessage}
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="title">Title</RequiredLabel>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="What question should the community evaluate?"
                  className={errors.title ? "border-red-300 focus-visible:ring-red-400" : ""}
                />
                {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="category">Category</RequiredLabel>
                <Select
                  id="category"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value as IssueCategory)}
                  className={errors.category ? "border-red-300 focus-visible:ring-red-400" : ""}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                {errors.category ? <p className="text-sm text-red-600">{errors.category}</p> : null}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="state">State</RequiredLabel>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  placeholder="California"
                  className={errors.state ? "border-red-300 focus-visible:ring-red-400" : ""}
                />
                {errors.state ? <p className="text-sm text-red-600">{errors.state}</p> : null}
              </div>

              {mode === "image" ? (
                <div className="space-y-2">
                  <RequiredLabel htmlFor="imageUrl">Image URL</RequiredLabel>
                  <Input
                    id="imageUrl"
                    value={form.imageUrl}
                    onChange={(event) => updateField("imageUrl", event.target.value)}
                    placeholder="https://example.com/visual.png"
                    className={errors.imageUrl ? "border-red-300 focus-visible:ring-red-400" : ""}
                  />
                  {errors.imageUrl ? <p className="text-sm text-red-600">{errors.imageUrl}</p> : null}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                  Image mode adds a required image URL field and stores it with the thread body.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <RequiredLabel htmlFor="body">Thread body</RequiredLabel>
                  <p className="mt-1 text-sm text-slate-500">Write at least 500 words so the thread has enough substance to evaluate.</p>
                </div>
                <div className={`rounded-full px-4 py-2 text-sm font-semibold ${bodyWordCount >= 500 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {bodyWordCount}/500 words
                </div>
              </div>
              <div className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_25px_80px_-55px_rgba(15,23,42,0.35)] ${errors.body ? "border-red-300" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-3">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const inner = selectedText || "bold text";
                        return {
                          text: `**${inner}**`,
                          cursorStart: 2,
                          cursorEnd: 2 + inner.length,
                        };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const inner = selectedText || "italic text";
                        return {
                          text: `_${inner}_`,
                          cursorStart: 1,
                          cursorEnd: 1 + inner.length,
                        };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const inner = selectedText || "link text";
                        return {
                          text: `[${inner}](https://example.com)`,
                          cursorStart: 1,
                          cursorEnd: 1 + inner.length,
                        };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Link"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const text = replaceSelectedLines(selectedText, "- ");
                        return { text };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Bullet list"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const text = replaceSelectedLines(selectedText, "%d. ");
                        return { text };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Ordered list"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const text = replaceSelectedLines(selectedText || "quoted evidence", "> ");
                        return { text };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applyEditorFormat((selectedText) => {
                        const inner = selectedText || "code";
                        return {
                          text: `\`${inner}\``,
                          cursorStart: 1,
                          cursorEnd: 1 + inner.length,
                        };
                      })
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                    aria-label="Inline code"
                  >
                    <Code2 className="h-4 w-4" />
                  </button>
                </div>

                <Textarea
                  id="body"
                  ref={editorRef}
                  value={form.body}
                  onChange={(event) => updateField("body", event.target.value)}
                  placeholder="Lay out the claim, why it matters, and what evidence should guide readers."
                  className="min-h-[360px] rounded-none border-0 bg-transparent px-5 py-5 font-medium text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              {errors.body ? <p className="text-sm text-red-600">{errors.body}</p> : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <RequiredLabel htmlFor="bibliography-0">Bibliography links</RequiredLabel>
                  <p className="mt-1 text-sm text-slate-500">Add at least 2 source links for readers to verify your thread.</p>
                </div>
                <Button type="button" variant="outline" onClick={addBibliographyField}>
                  <Plus className="h-4 w-4" />
                  Add link
                </Button>
              </div>

              <div className="space-y-3">
                {form.bibliography.map((link, index) => (
                  <div key={`bibliography-${index}`} className="space-y-2">
                    <Input
                      id={`bibliography-${index}`}
                      value={link}
                      onChange={(event) => updateBibliography(index, event.target.value)}
                      placeholder={`https://source-${index + 1}.example.com/article`}
                      className={errors.bibliography?.[index] ? "border-red-300 focus-visible:ring-red-400" : ""}
                    />
                    {errors.bibliography?.[index] ? <p className="text-sm text-red-600">{errors.bibliography[index]}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <div className="text-sm text-slate-500">
                {currentUser ? `Publishing as ${currentUser.username}` : "Sign in required before publishing"}
              </div>
              <div className="flex flex-wrap gap-3">
                {!currentUser ? (
                  <Button type="button" variant="outline" onClick={() => openAuthModal("signin")}>
                    Sign in to publish
                  </Button>
                ) : null}
                <Button type="submit" size="lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Publishing..." : "Publish thread"}
                </Button>
              </div>
            </div>
          </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
