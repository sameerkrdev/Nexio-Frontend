// app/+native-intent.tsx
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  if (path.includes("onConnect")) {
    return "/";
  }
  return path;
}
