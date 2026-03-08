import React from "react";
import { AdminHeader } from "../AdminHeader/AdminHeader";
import { AdminSidebar } from "../AdminSidebar/AdminSidebar";

interface AdminLayoutProps {
  email: string;
  children: React.ReactNode;
}

export function AdminLayout({ email, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      <AdminHeader email={email} />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: "var(--admin-background-light)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
