import { Suspense } from "react";
import HoiDapClient from "./HoiDapClient";

export const metadata = { title: "Hỏi đáp Huyền học AI" };

export default function Page() {
  return (
    <Suspense>
      <HoiDapClient />
    </Suspense>
  );
}
