export default function ChapterEditorPage({
  params,
}: {
  params: { projectId: string; chapterId: string };
}) {
  return <div>Editing chapter: {params.chapterId}</div>;
}
