import { requireContentEditorSession } from "@/lib/auth-guards";
import { ContentEditor } from "@/components/content-editor";

export default async function AdminContentPage() {
  await requireContentEditorSession();

  return <ContentEditor />;
}
