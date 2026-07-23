import React, { Suspense } from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant_id = process.env.NEXT_PUBLIC_DEFAULT_TENANT || "eco-fashion";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Suspense fallback={<div className="h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer tenantId={tenant_id} />
      <FloatingChatbot />
    </div>
  );
}
