import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();
  console.log(`user id is : ${userId}`)

  if (userId) redirect("/reports");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="CarePlusPlus logo" width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          ScamWhiz
        </span>
      </div>
      <p className="max-w-prose text-center">
      Report a scam and find a scammer online. Enter a text of any suspicious Message, Username, Pseudo Name, Email, Phone Number, crypto address, website, or DM, and ScamWhiz will let you know if it&apos;s a scam or not. Built with OpenAI, Pinecone, Clerk, Next/React, and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/reports">Open</Link>
      </Button>
    </main>
  );
}
