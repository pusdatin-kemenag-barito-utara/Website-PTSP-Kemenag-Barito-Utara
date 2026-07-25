import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  const cbQuery = callbackUrl
    ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}`
    : "";

  redirect(`/login/masyarakat${cbQuery}`);
}
