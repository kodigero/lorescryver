export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <div>Editing chapter: {chapterId}</div>;
}
