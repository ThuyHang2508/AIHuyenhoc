"use client";
import { useState } from "react";
import Icon from "./Icon";
import { deleteProfile, saveProfile, useProfiles, type Profile } from "@/lib/profiles";

/** Thanh chọn hồ sơ đã lưu + nút lưu hồ sơ hiện tại. */
export default function ProfilePicker({ current, onPick }: { current: () => Omit<Profile, "id"> | null; onPick: (p: Profile) => void }) {
  const list = useProfiles();
  const [msg, setMsg] = useState<string | null>(null);

  const save = () => {
    const p = current();
    if (!p) return setMsg("Ngày sinh chưa hợp lệ.");
    if (!p.name.trim()) return setMsg("Nhập họ tên trước khi lưu.");
    saveProfile(p);
    setMsg(`Đã lưu hồ sơ "${p.name.trim()}".`);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="mb-4 rounded-xl border border-white/[0.06] bg-abyss/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-sm flex items-center gap-1 text-muted"><Icon name="group" className="text-[16px]" /> Hồ sơ</span>
        {list.length === 0 && <span className="text-xs text-muted">Chưa có hồ sơ nào. Nhập thông tin rồi bấm “Lưu hồ sơ”.</span>}
        {list.map((p) => (
          <span key={p.id} className="group flex items-center rounded-full border border-emerald/20 bg-emerald/5 text-xs text-emerald-mist transition hover:border-primary-container">
            <button className="py-1 pl-3 pr-1" title={`${p.day}/${p.month}/${p.year}`} onClick={() => onPick(p)}>
              {p.name} <span className="text-muted">· {p.year}</span>
            </button>
            <button
              aria-label={`Xóa hồ sơ ${p.name}`}
              className="px-1.5 py-1 text-muted opacity-60 hover:text-error group-hover:opacity-100"
              onClick={() => confirm(`Xóa hồ sơ "${p.name}"?`) && deleteProfile(p.id)}
            >
              <Icon name="close" className="text-[13px]" />
            </button>
          </span>
        ))}
        <button className="ml-auto flex items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1 text-xs text-on-surface-variant hover:border-emerald/50 hover:text-primary-container" onClick={save}>
          <Icon name="bookmark_add" className="text-[15px]" /> Lưu hồ sơ
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-primary-container">{msg}</p>}
    </div>
  );
}
