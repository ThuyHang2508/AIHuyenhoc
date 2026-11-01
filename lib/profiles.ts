"use client";
// Hồ sơ người xem (tên, giới tính, ngày giờ sinh dương lịch) lưu trong trình duyệt, dùng chung giữa các trang.
import { useEffect, useState } from "react";

export interface Profile {
  id: string;
  name: string;
  gender?: "nam" | "nu";
  day: number;
  month: number;
  year: number; // dương lịch
  hour?: number; // giờ Tý = 1 … Hợi = 12
}

const STORAGE = "aether-profiles";
const EVENT = "aether-profiles-change";
const MAX = 30;

function read(): Profile[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(list: Profile[]) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* bộ nhớ trình duyệt bị chặn: bỏ qua */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Lưu (hoặc cập nhật hồ sơ trùng tên + ngày sinh), đưa lên đầu danh sách. */
export function saveProfile(p: Omit<Profile, "id">): Profile {
  const list = read();
  const same = (x: Profile) => x.name.trim().toLowerCase() === p.name.trim().toLowerCase() && x.day === p.day && x.month === p.month && x.year === p.year;
  const old = list.find(same);
  const saved: Profile = { ...old, ...p, hour: p.hour ?? old?.hour, gender: p.gender ?? old?.gender, id: old?.id ?? `${Date.now()}` };
  write([saved, ...list.filter((x) => !same(x))]);
  return saved;
}

export function deleteProfile(id: string) {
  write(read().filter((x) => x.id !== id));
}

export function useProfiles() {
  const [list, setList] = useState<Profile[]>([]);
  useEffect(() => {
    setList(read());
    const on = () => setList(read());
    window.addEventListener(EVENT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVENT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return list;
}
