export async function GET() {
  const isDebug = process.env.DEBUG === "true";

  return Response.json({
    isDebug,
  });
}
