"use server";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  catalogSessionCookie, catalogSessionMaxAge, createCatalogSession,
  isCatalogAccessConfigured, matchesCatalogSecret,
} from "../../../lib/catalog-access";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin/catalogo",
};

export async function loginCatalogReport(formData: FormData) {
  const secret = process.env.CATALOG_ADMIN_TOKEN;
  if (!isCatalogAccessConfigured(process.env.CATALOG_REPORT_ENABLED, secret)) notFound();
  if (!matchesCatalogSecret(formData.get("accessKey"), secret!)) {
    redirect("/admin/catalogo?access=denied");
  }
  (await cookies()).set(catalogSessionCookie, createCatalogSession(secret!), {
    ...cookieOptions, maxAge: catalogSessionMaxAge,
  });
  redirect("/admin/catalogo");
}

export async function logoutCatalogReport() {
  (await cookies()).set(catalogSessionCookie, "", { ...cookieOptions, maxAge: 0 });
  redirect("/admin/catalogo");
}
