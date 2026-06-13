export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <div>Project: {params.projectId}</div>;
}
